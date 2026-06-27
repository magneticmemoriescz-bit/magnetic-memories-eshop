import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem, UploadedPhoto } from '../types';
import { Seo } from '../components/Seo';
import { formatPrice } from '../utils/format';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { FileUpload } from '../components/FileUpload';
import { isVideo } from '../utils/media';
import { PregnancyEditorModal } from '../components/PregnancyEditorModal';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const { dispatch } = useCart();

    const product = products.find(p => p.id === id);

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [activeMedia, setActiveMedia] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [finalPhotos, setFinalPhotos] = useState<UploadedPhoto[]>([]);
    const [photoGroupId, setPhotoGroupId] = useState<string | null>(null);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [directMailing, setDirectMailing] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<string[]>([]);

    // Update address count list size dynamically based on quantity
    useEffect(() => {
        setAddresses(prev => {
            const next = [...prev];
            if (next.length < quantity) {
                while (next.length < quantity) next.push('');
            } else if (next.length > quantity) {
                next.splice(quantity);
            }
            return next;
        });
    }, [quantity]);
    
    // Typy produktů
    const isWedding = id === 'wedding-announcement';
    const isPregnancy = id === 'pregnancy-announcement';
    const isInLove = id === 'in-love-magnets';
    const isMagnets = id === 'photomagnets';
    const isCalendar = id === 'magnetic-calendar';

    const [isPregnancyEditorOpen, setIsPregnancyEditorOpen] = useState(false);

    // Dynamické načtení Google písem pro Polaroid a ozdobné editory
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@400;700&family=Cinzel:wght@600&family=Dancing+Script:wght@700&family=Great+Vibes&family=Montserrat:wght@400;700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=WindSong:wght@400;500&family=Whisper&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // Výchozí texty pro těhotenské oznámení
    useEffect(() => {
        if (isPregnancy) {
            setCustomText({
                t1: "Budeme tři...",
                t2: "podzim 2026",
                font: "Great Vibes",
                color: "#191919",
                photoScale: "100",
                photoX: "0",
                photoY: "0"
            });
        } else {
            setCustomText({});
        }
    }, [id, isPregnancy]);

    // Volba designu (Svatba a Zamilované začínají v režimu motivů)
    const [designMode, setDesignMode] = useState<'motif' | 'custom'>(
        (isWedding || isInLove) ? 'motif' : 'custom'
    );

    // Mapování motivů
    const inLoveMotifNames = ["100 jazyků lásky", "Potřebuju tě", "Jsi můj vesmír", "Srdce", "Cosmos", "Vzkaz", "Kočička", "Forever", "Nápis I love you", "I love you", "Kočičky", "Puzzle", "Honey bee mine"];
    const weddingMotifNames = ["Elegantní", "Polaroid", "Obálka", "Film", "Fialové květy", "Bílé květy"];

    const allMedia = useMemo(() => {
        if (!product) return [];
        return Array.from(new Set([product.imageUrl, ...product.gallery]));
    }, [product]);

    // Logika pro výběr motivů (zobrazujeme jen ty s popiskem)
    const motifs = useMemo(() => {
        if (!product) return [];
        if (isWedding) {
            const g = product.gallery;
            // Mapování přesně na pojmenované motivy (Film je 10. v pořadí -> index 9)
            return [
                g[0], // Elegantní
                g[1], // Polaroid
                g[2], // Obálka
                g[9], // Film (10. fotka v galerii)
                g[4], // Fialové květy
                g[5]  // Bílé květy
            ].filter(Boolean);
        }
        if (isInLove) {
            // U zamilovaných magnetek vynecháváme první (hero) fotku a bereme 13 motivů
            return product.gallery.slice(1, 14);
        }
        return product.gallery || [];
    }, [product, isWedding, isInLove]);

    // Aktuálně vybraný svatební motiv (podle názvu)
    const currentWeddingMotif = useMemo(() => {
        if (!isWedding || designMode !== 'motif') return null;
        const idx = motifs.indexOf(activeMedia);
        return idx !== -1 ? weddingMotifNames[idx] : null;
    }, [isWedding, designMode, motifs, activeMedia]);

    // Dynamický počet požadovaných fotek podle kontextu
    const effectiveRequiredPhotos = useMemo(() => {
        if (isWedding && designMode === 'motif') {
            if (currentWeddingMotif === 'Film') return 3;
            if (currentWeddingMotif === 'Fialové květy' || currentWeddingMotif === 'Bílé květy') return 0;
            return 1;
        }
        
        // PRO MAGNETKY (i zamilované s motivy): Počet fotek = Počet kusů (quantity)
        if (isMagnets || isInLove) return quantity;
        
        return selectedVariant?.photoCount || product?.requiredPhotos || 0;
    }, [isWedding, designMode, currentWeddingMotif, isInLove, isMagnets, quantity, selectedVariant, product]);

    useEffect(() => {
        if (product) {
            if (!selectedVariant && product.variants?.length) setSelectedVariant(product.variants[0]);
            if (!activeMedia) setActiveMedia(product.imageUrl);
        }
    }, [product]);

    useEffect(() => {
        setValidationError(null);
    }, [finalPhotos, quantity, selectedVariant]);

    if (!product) return <div className="p-20 text-center font-bold">Produkt nenalezen.</div>;

    // Výpočet ceny
    const getSetPrice = (qty: number) => {
        const unit = selectedVariant?.price || product.price;
        if ((isPregnancy || isWedding) && selectedVariant?.id === 'a6') {
            if (qty === 10) return 500; if (qty === 20) return 975;
            if (qty === 50) return 2400; if (qty === 100) return 4750;
        }
        if (qty === 9 && (isMagnets || isInLove)) return 295;
        if (qty === 15 && (isMagnets || isInLove)) return 500;
        if (qty === 30 && (isMagnets || isInLove)) return 1000;
        return unit * qty;
    };

    const currentUnitPrice = (isPregnancy || isWedding) && selectedVariant?.id === 'a6' 
        ? (quantity >= 100 ? 47.5 : quantity >= 50 ? 48 : quantity >= 20 ? 48.75 : quantity >= 10 ? 50 : 55)
        : (selectedVariant?.price || product.price);

    const isSet = isCalendar ? false : ((isMagnets || isInLove) ? [9, 15, 30].includes(quantity) : [10, 20, 50, 100].includes(quantity));
    
    const baseTotal = useMemo(() => {
        const hasCustomFormats = finalPhotos.some(p => p.customFormat !== undefined);
        if ((isMagnets || isInLove) && hasCustomFormats) {
            let total = 0;
            finalPhotos.forEach(p => {
                const unitPrice = p.customFormat ? p.customFormat.price : (selectedVariant?.price || product.price);
                total += unitPrice * (p.quantity || 1);
            });
            const totalAssigned = finalPhotos.reduce((sum, p) => sum + (p.quantity || 1), 0);
            if (totalAssigned < quantity) {
                total += (selectedVariant?.price || product.price) * (quantity - totalAssigned);
            }
            return total;
        }
        return isSet ? getSetPrice(quantity) : (currentUnitPrice * quantity);
    }, [finalPhotos, isMagnets, isInLove, isSet, quantity, selectedVariant, product, currentUnitPrice]);

    const finalTotal = baseTotal + (directMailing ? quantity * 100 : 0);

    const handleMotifSelect = (url: string, name: string) => {
        if (isWedding) {
            setActiveMedia(url);
            return;
        }

        const totalAssigned = finalPhotos.reduce((sum, p) => sum + (p.quantity || 1), 0);
        if (totalAssigned >= quantity) {
            alert(`Už jste vybrali všech ${quantity} ks magnetek. Pokud chcete přidat tento motiv, snižte počet u jiného motivu nebo fotky.`);
            return;
        }

        const existingIdx = finalPhotos.findIndex(p => p.url === url);
        if (existingIdx !== -1) {
            const updated = [...finalPhotos];
            updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + 1;
            setFinalPhotos(updated);
        } else {
            setFinalPhotos([...finalPhotos, { url, name, quantity: 1 }]);
        }
        setActiveMedia(url);
    };

    const handleAddToCart = () => {
        const skipUpload = effectiveRequiredPhotos === 0;
        
        if (!skipUpload) {
            // Pokud jde o magnetky, stačí aspoň 1 fotka, ale součet musí sedět (nebo aspoň nesmí být prázdno)
            const isAnyMagnet = isMagnets || (isInLove && designMode === 'custom');
            
            if (isAnyMagnet) {
                if (finalPhotos.length === 0) {
                    setValidationError("Prosím nahrajte alespoň jednu fotografii."); return;
                }
                const totalAssigned = finalPhotos.reduce((sum, p) => sum + (p.quantity || 1), 0);
                if (totalAssigned !== quantity) {
                    setValidationError(`Požadováno: ${quantity} ks. Aktuálně vybráno: ${totalAssigned} ks. Upravte počty u fotek.`);
                    return;
                }
            } else {
                const minPhotos = effectiveRequiredPhotos;
                if (finalPhotos.length < minPhotos) {
                    setValidationError(`Nahráli jste ${finalPhotos.length} ${finalPhotos.length === 1 ? 'fotografii' : finalPhotos.length < 5 ? 'fotografie' : 'fotografií'}. Je potřeba nahrát minimálně ${minPhotos} ${minPhotos === 1 ? 'fotografii' : 'fotografií'}.`); return;
                }
            }
        }

        // Validate multiple delivery addresses if mailing is requested
        if (directMailing) {
            const emptyIdx = addresses.findIndex(a => !a || !a.trim());
            if (emptyIdx !== -1) {
                setValidationError(`Prosím doplňte doručovací adresu č. ${emptyIdx + 1} pro rozeslání.`);
                return;
            }
        }

        setValidationError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${Date.now()}`, product, quantity, price: baseTotal / quantity,
            variant: selectedVariant, photos: finalPhotos.length ? finalPhotos : [{ url: activeMedia, name: 'Motiv' }],
            photoGroupId, customText, directMailing,
            addresses: directMailing ? addresses : undefined
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setIsAdded(true);
        // Reset success state after 3 seconds so user can add more or continue browsing
        setTimeout(() => setIsAdded(false), 3000);
    };

    const inputClasses = "w-full py-2.5 px-4 bg-white rounded-xl border-2 border-gray-100 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none placeholder-gray-400 text-sm transition-all shadow-sm";
    
    // Společné třídy pro tlačítka výběru
    const selectionBtnBase = "relative px-2 py-1.5 rounded-xl border-2 text-left transition-all flex flex-col justify-center min-h-[44px]";
    const selectionBtnActive = "bg-brand-purple border-brand-purple text-white ring-2 ring-brand-purple/10 shadow-sm";
    const selectionBtnInactive = "bg-white border-gray-100 text-gray-900 hover:border-gray-200";

    const currentAspect = useMemo(() => {
        if (!selectedVariant) return 1;
        const name = selectedVariant.name.toLowerCase();
        
        // Prefer explicit ISO paper standard sizes first for precise dimensions
        if (name.includes('a6')) {
            // Skutečný fyzický formát A6 je 105 x 148 mm (poměr ~0.7095)
            return 10.5 / 14.8;
        }
        if (name.includes('a5')) {
            // Skutečný fyzický formát A5 je 148 x 210 mm (poměr ~0.7048)
            return 14.8 / 21.0;
        }
        if (name.includes('a4')) {
            // Skutečný fyzický formát A4 je 210 x 297 mm (poměr ~0.7071)
            return 21.0 / 29.7;
        }

        if (name.includes('x')) {
            const parts = name.split(' ')[0].split('x');
            if (parts.length === 2) {
                const w = parseFloat(parts[0]);
                const h = parseFloat(parts[1]);
                if (!isNaN(w) && !isNaN(h)) return w / h;
            }
        }
        return 1;
    }, [selectedVariant]);

    return (
        <div className="bg-white min-h-screen pb-40">
            <Seo 
                title={`${product.name} | Vyrobte si z vlastních fotek | MagneticMemories.cz`} 
                description={`Proměňte své oblíbené snímky v jedinečný produkt: ${product.name}. ${product.shortDescription} Snadné nahrání z telefonu, vysoká kvalita, rychlá doprava zdarma při nákupu nad 800 Kč.`} 
                image={activeMedia} 
                type="product"
                price={currentUnitPrice}
                availability="InStock"
            />
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    
                    {/* LEVÝ SLOUPY: GALERIE */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative">
                            {isVideo(activeMedia) ? (
                                <video key={activeMedia} src={activeMedia} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                            ) : (
                                <img src={optimizeCloudinaryUrl(activeMedia, 1000)} alt="" className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black uppercase text-brand-purple shadow-sm">Ruční výroba</span>
                                <span className="bg-brand-pink/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black uppercase text-white shadow-sm">Vlastní fotky</span>
                            </div>
                        </div>

                        {/* GALLERY THUMBNAILS */}
                        <div className="grid grid-cols-5 gap-2">
                            {allMedia.map((m, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setActiveMedia(m)} 
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center ${activeMedia === m ? 'border-brand-purple scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    {isVideo(m) ? (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-purple/40" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <img src={optimizeCloudinaryUrl(m, 200)} alt="" className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PRAVÝ SLOUPY: KONFIGURÁTOR */}
                    <div className="mt-8 lg:mt-0 space-y-6">
                        <section>
                            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{product.name}</h1>
                            <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-2xl p-4 mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-brand-pink">{formatPrice(currentUnitPrice)} Kč</span>
                                    <div className="flex items-center text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></span>
                                        Výroba (3-5 dní)
                                    </div>
                                </div>
                                <div className="mt-1.5 text-[11px] font-bold text-black uppercase tracking-wider">DOPRAVA ZDARMA NAD 800 KČ</div>
                            </div>
                        </section>

                        {/* 1. VYBERTE ROZMĚR */}
                        <section>
                            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">1. Vyberte rozměr</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                {product.variants?.map(v => (
                                    <button 
                                        key={v.id} 
                                        onClick={() => setSelectedVariant(v)} 
                                        className={`${selectionBtnBase} ${selectedVariant?.id === v.id ? selectionBtnActive : selectionBtnInactive}`}
                                    >
                                        <div className={`text-[13px] font-bold uppercase leading-tight ${selectedVariant?.id === v.id ? 'text-white' : 'text-gray-900'}`}>
                                            {v.name}
                                            {isWedding && v.id === 'a6' && <span className="block text-[10px] font-bold normal-case mt-0.5 opacity-90"> nejběžnější</span>}
                                        </div>
                                        <div className={`text-[13px] font-bold mt-0.5 ${selectedVariant?.id === v.id ? 'text-white' : 'text-brand-pink'}`}>
                                            {v.price || product.price} Kč
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-[11px] font-bold text-brand-purple uppercase tracking-normal px-1">
                                TIP: pokud vaše fotografie neodpovídá rozměru, nevadí, upravíme ji
                            </p>
                        </section>

                        {/* 2. POČET KUSŮ */}
                        <section>
                            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">2. Počet kusů</h2>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner space-y-3">
                                <div>
                                    <h3 className="text-[11px] font-bold text-black uppercase tracking-wide mb-1.5 px-1">Vlastní počet</h3>
                                    <div className="relative">
                                        <select 
                                            value={quantity} 
                                            onChange={(e) => setQuantity(parseInt(e.target.value))} 
                                            className="w-full h-[48px] bg-white border-2 border-gray-100 rounded-xl px-4 font-normal text-sm focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none appearance-none cursor-pointer transition-all hover:border-gray-200"
                                        >
                                            {[1,2,3,4,5,6,10,15,20,30,50,100].map(n => <option key={n} value={n}>{n} ks</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {!isCalendar && (
                                    <div>
                                        <h3 className="text-xs font-black text-brand-purple uppercase tracking-wider mb-1.5 px-1">Zvýhodněné sady</h3>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {(isPregnancy || isWedding ? [10, 20, 50, 100] : [9, 15, 30]).map(q => (
                                                <button 
                                                    key={q} 
                                                    onClick={() => setQuantity(q)} 
                                                    className={`${selectionBtnBase} text-center items-center ${quantity === q ? selectionBtnActive : selectionBtnInactive}`}
                                                >
                                                    <span className={`text-[12px] font-medium uppercase ${quantity === q ? 'text-white' : 'text-black'}`}>{q === 15 ? '14+1' : q === 30 ? '28+2' : `${q} KS`}</span>
                                                    <span className={`text-[12px] font-bold mt-0.5 ${quantity === q ? 'text-white' : 'text-brand-pink'}`}>{getSetPrice(q)} Kč</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. KONFIGURACE */}
                        <section>
                            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">3. Motiv a konfigurace</h2>
                            
                            {(isWedding || isInLove) && (
                                <div className="grid grid-cols-2 gap-1.5 mb-4">
                                    <button onClick={() => setDesignMode('motif')} className={`py-2.5 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${designMode === 'motif' ? 'bg-brand-purple border-brand-purple text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>Náš motiv</button>
                                    <button onClick={() => setDesignMode('custom')} className={`py-2.5 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${designMode === 'custom' ? 'bg-brand-purple border-brand-purple text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>Vlastní motiv</button>
                                </div>
                            )}

                            {(isWedding || isInLove) && designMode === 'motif' && motifs.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                                    {motifs.map((url, idx) => {
                                        const motifName = isWedding ? weddingMotifNames[idx] : isInLove ? inLoveMotifNames[idx] : 'Motiv';
                                        return (
                                            <button key={idx} onClick={() => handleMotifSelect(url, motifName)} className="group flex flex-col items-center">
                                                <div className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all ${activeMedia === url ? 'border-brand-purple ring-2 ring-brand-purple/10 scale-95' : 'border-gray-100'}`}>
                                                    <img src={optimizeCloudinaryUrl(url, 200)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <span className={`mt-1 text-[10px] font-medium text-center uppercase tracking-wide transition-colors leading-tight ${activeMedia === url ? 'text-brand-purple' : 'text-black'}`}>
                                                    {motifName}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                {isPregnancy ? (
                                    <div className="space-y-4">
                                        {finalPhotos.length === 0 ? (
                                            <div className="space-y-4">
                                                <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-2xl p-5 text-center space-y-4">
                                                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                        <span className="text-2xl animate-bounce">🤰</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-950 uppercase tracking-widest text-xs">Vytvořte si těhotenské oznámení</h4>
                                                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">
                                                            Nahrajte nejdříve snímek z ultrazvuku. <b className="text-brand-purple">Vyskakovací grafický editor (s ořezem, volbou ozdobného písma, barvy a textu)</b> se vám otevře ihned po nahrání fotky.
                                                        </p>
                                                    </div>
                                                    <FileUpload 
                                                        onUploadComplete={(p, g) => {
                                                            setFinalPhotos(p); 
                                                            setPhotoGroupId(g);
                                                            setIsPregnancyEditorOpen(true);
                                                        }} 
                                                        requiredCount={1} 
                                                        productName={product.name} 
                                                        onUploadingChange={setUploading} 
                                                        currentPhotos={finalPhotos}
                                                        aspect={currentAspect}
                                                        sizeLabel={selectedVariant?.name}
                                                        labelHint="(např. snímek ultrazvuku)"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-white border-2 border-brand-purple/10 rounded-2xl p-4 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                        <span className="text-xs font-black uppercase tracking-widest text-brand-purple">Váš Grafický Návrh</span>
                                                        <span className="text-[10px] bg-green-100 text-green-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Foto nahráno ✓</span>
                                                    </div>
                                                    <div className="space-y-2 text-xs font-medium text-gray-600">
                                                        <div className="flex justify-between">
                                                            <span>Hlavní text:</span>
                                                            <span className="font-extrabold text-gray-900">"{customText.t1 || 'Budeme tři...'}"</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Doplňující text:</span>
                                                            <span className="font-extrabold text-gray-900">"{customText.t2 || 'podzim 2026'}"</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Styl písma (font):</span>
                                                            <span className="font-extrabold text-brand-pink">{customText.font || 'Great Vibes'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Barva textu:</span>
                                                            <span className="flex items-center gap-1 font-extrabold text-gray-900">
                                                                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: customText.color || '#191919' }} />
                                                                {customText.color === '#2B82C9' ? 'Baby Blue' : customText.color === '#D84B8E' ? 'Baby Pink' : customText.color === '#E11D48' ? 'Rose Gold' : customText.color === '#C084FC' ? 'Fialová' : customText.color === '#1E3A8A' ? 'Modrá' : customText.color === '#4B5563' ? 'Přírodně šedá' : customText.color === '#78350F' ? 'Čokoládová' : customText.color === '#D4AF37' ? 'Zlatá' : 'Černá'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsPregnancyEditorOpen(true)}
                                                        className="w-full mt-2 py-3 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        🎨 Upravit fotku, písmo a text
                                                    </button>
                                                    
                                                    {/* Option to change photo easily */}
                                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                                        <span className="text-gray-400 font-bold uppercase tracking-wider">Chcete změnit fotografii?</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                setFinalPhotos([]);
                                                            }}
                                                            className="text-brand-pink font-black hover:underline uppercase tracking-wide"
                                                        >
                                                            Nahrát jinou
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {product.hasTextFields && !isCalendar && !(isWedding && designMode === 'custom') && (
                                            <div className="space-y-2">
                                                <h3 className="text-xs font-bold text-brand-purple uppercase tracking-wider px-1">Doplňte text na oznámení:</h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <input placeholder={isWedding ? "Budeme se brát" : "Budeme tři..."} className={inputClasses} onChange={(e) => setCustomText(p => ({...p, t1: e.target.value}))} />
                                                    <input placeholder={isWedding ? "Eva a Adam" : "podzim 2026"} className={inputClasses} onChange={(e) => setCustomText(p => ({...p, t2: e.target.value}))} />
                                                    {isWedding && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input placeholder="1. 1. 2029" className={inputClasses} onChange={(e) => setCustomText(p => ({...p, t3: e.target.value}))} />
                                                            <input placeholder="Místo" className={inputClasses} onChange={(e) => setCustomText(p => ({...p, t4: e.target.value}))} />
                                                        </div>
                                                    )}
                                                    <textarea placeholder="Speciální přání (font, barva textu...)" className={inputClasses + " resize-none h-16 text-xs"} onChange={(e) => setCustomText(p => ({...p, msg: e.target.value}))} />
                                                </div>
                                            </div>
                                        )}

                                        {effectiveRequiredPhotos > 0 && (
                                            <FileUpload 
                                                onUploadComplete={(p, g) => {setFinalPhotos(p); setPhotoGroupId(g);}} 
                                                requiredCount={effectiveRequiredPhotos} 
                                                productName={product.name} 
                                                onUploadingChange={setUploading} 
                                                currentPhotos={finalPhotos}
                                                aspect={currentAspect}
                                                sizeLabel={selectedVariant?.name}
                                                hideUpload={isInLove && designMode === 'motif'}
                                                labelHint={
                                                    (isMagnets || isInLove) && designMode !== 'motif' ? `rozdělte ${quantity} ks mezi fotky` :
                                                    (isWedding && designMode === 'custom') ? "vložte hotovou grafiku" :
                                                    (isWedding && currentWeddingMotif === 'Film') ? "3 až 5 fotek" :
                                                    isInLove && designMode === 'motif' ? "vyberte motivy z galerie" :
                                                    isPregnancy ? "(např. ultrazvuk)" : 
                                                    isCalendar ? "(12 fotek)" : 
                                                    isWedding ? "(vaše fotka)" : undefined
                                                }
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* 4. ROZESLÁNÍ */}
                        {(isWedding || isPregnancy) && (
                            <section className="space-y-3">
                                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">4. Rozeslání</h2>
                                <label className={`flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${directMailing ? 'bg-brand-purple/5 border-brand-purple' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" checked={directMailing} onChange={() => setDirectMailing(!directMailing)} className="mt-0.5 h-5 w-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple cursor-pointer" />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Rozeslat na jednotlivé adresy</p>
                                         <p className="text-[11px] text-black font-bold">+100 Kč / ks (adresy vyplňte níže podle počtu kusů)</p>
                                    </div>
                                </label>

                                {directMailing && (
                                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                                        <h3 className="text-xs font-black text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-pink"></span>
                                            Doručení na individuální adresy ({quantity} ks)
                                        </h3>
                                        <p className="text-[10px] text-gray-500 font-bold leading-normal">
                                            Pro každý objednaný kus vyplňte doručovací adresu (jméno adresáta, ulice, obec, PSČ):
                                        </p>
                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                            {Array.from({ length: quantity }).map((_, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <span className="text-[10px] font-black text-gray-400 w-8 text-right shrink-0">#{idx + 1}</span>
                                                    <input 
                                                        type="text"
                                                        value={addresses[idx] || ''}
                                                        onChange={(e) => {
                                                            const newAddrs = [...addresses];
                                                            newAddrs[idx] = e.target.value;
                                                            setAddresses(newAddrs);
                                                        }}
                                                        placeholder="Např: Jan Novák, Pražská 123, Praha, 11000"
                                                        className="flex-grow py-2 px-3 bg-white border border-gray-200/80 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple shadow-sm font-medium"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* STATICKÉ TLAČÍTKO VLOŽIT DO KOŠÍKU */}
                        <div className="pt-2">
                            {validationError && (
                                <div className="mb-3 p-3 bg-red-50 border-2 border-red-100 rounded-xl flex items-center gap-2 animate-bounce">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-[11px] font-black text-red-600 uppercase tracking-wide leading-tight">{validationError}</span>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={handleAddToCart} disabled={isAdded || uploading} className={`flex-[3] py-4 rounded-xl text-white font-black text-xl uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:opacity-95 disabled:grayscale'}`}>
                                    {isAdded ? 'PŘIDÁNO ✓' : uploading ? 'Ukládám...' : `VLOŽIT DO KOŠÍKU — ${formatPrice(finalTotal)} Kč`}
                                </button>
                                {isAdded && (
                                    <Link to="/kosik" className="flex-[2] bg-brand-purple text-white rounded-xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest shadow-xl hover:bg-brand-purple/90 transition-all animate-pulse">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        OBJEDNAT
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIXNÍ LIŠTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-2 pb-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
                <div className="max-w-4xl mx-auto flex flex-col gap-2">
                    {validationError && (
                        <div className="mx-2 p-2 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-tight text-center">{validationError}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-black uppercase tracking-wider block leading-none">Celkem:</span>
                            <span className="text-xl font-black text-brand-pink leading-tight">{formatPrice(finalTotal)} Kč</span>
                        </div>
                        <div className="flex gap-2 flex-grow sm:flex-grow-0">
                            <button 
                                onClick={handleAddToCart} 
                                disabled={isAdded || uploading} 
                                className={`flex-grow sm:flex-grow-0 sm:min-w-[140px] py-3 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:opacity-95 disabled:grayscale'}`}
                            >
                                {isAdded ? 'V KOŠÍKU' : uploading ? '...' : 'DO KOŠÍKU'}
                            </button>
                            {isAdded && (
                                <Link 
                                    to="/kosik" 
                                    className="flex-grow sm:flex-grow-0 sm:px-6 py-3 bg-brand-purple text-white rounded-xl shadow-lg font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    KOŠÍK
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isPregnancy && isPregnancyEditorOpen && finalPhotos.length > 0 && (
                <PregnancyEditorModal 
                    image={customText.originalImageUrl || finalPhotos[0].url}
                    aspect={currentAspect}
                    sizeLabel={selectedVariant?.name}
                    initialCustomText={customText}
                    onConfirm={(finalText) => {
                        const originalUrl = customText.originalImageUrl || finalPhotos[0].url;
                        const updatedText = {
                            ...finalText,
                            originalImageUrl: originalUrl
                        };
                        setCustomText(updatedText);
                        
                        if (finalText.designedImageUrl) {
                            setFinalPhotos(prev => {
                                if (prev.length > 0) {
                                    const updated = [...prev];
                                    updated[0] = {
                                        ...updated[0],
                                        url: finalText.designedImageUrl
                                    };
                                    return updated;
                                }
                                return prev;
                            });
                        }
                        setIsPregnancyEditorOpen(false);
                    }}
                    onCancel={() => setIsPregnancyEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductDetailPage;
