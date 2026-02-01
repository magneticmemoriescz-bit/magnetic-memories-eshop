import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Product, ProductVariant, CartItem, UploadedPhoto } from '../types';
import { Seo } from '../components/Seo';
import { formatPrice } from '../utils/format';
import { trackAddToCart } from '../utils/gtag';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { FileUpload } from '../components/FileUpload';
import { isVideo } from '../utils/media';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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
    
    // Typy produktů
    const isWedding = id === 'wedding-announcement';
    const isPregnancy = id === 'pregnancy-announcement';
    const isInLove = id === 'in-love-magnets';
    const isMagnets = id === 'photomagnets';
    const isMerch = id === 'magnetic-merch';
    const isCalendar = id === 'magnetic-calendar';

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
        if (isInLove && designMode === 'motif') return 0;
        return selectedVariant?.photoCount || product?.requiredPhotos || 0;
    }, [isWedding, designMode, currentWeddingMotif, isInLove, selectedVariant, product]);

    useEffect(() => {
        if (product) {
            if (!selectedVariant && product.variants?.length) setSelectedVariant(product.variants[0]);
            if (!activeMedia) setActiveMedia(product.imageUrl);
        }
    }, [product]);

    if (!product) return <div className="p-20 text-center font-bold">Produkt nenalezen.</div>;

    // Výpočet ceny
    const getSetPrice = (qty: number) => {
        const unit = selectedVariant?.price || product.price;
        if ((isPregnancy || isWedding) && selectedVariant?.id === 'a6') {
            if (qty === 10) return 400; if (qty === 20) return 775;
            if (qty === 50) return 1900; if (qty === 100) return 3750;
        }
        if (qty === 9 && (isMagnets || isInLove)) return 205;
        if (qty === 15 && (isMagnets || isInLove)) return 350;
        if (qty === 30 && (isMagnets || isInLove)) return 700;
        return unit * qty;
    };

    const currentUnitPrice = (isPregnancy || isWedding) && selectedVariant?.id === 'a6' 
        ? (quantity >= 100 ? 37.5 : quantity >= 50 ? 38 : quantity >= 20 ? 38.75 : quantity >= 10 ? 40 : 45)
        : (selectedVariant?.price || product.price);

    const isSet = isCalendar ? false : ((isMagnets || isInLove) ? [9, 15, 30].includes(quantity) : [10, 20, 50, 100].includes(quantity));
    const baseTotal = isSet ? getSetPrice(quantity) : (currentUnitPrice * quantity);
    const finalTotal = baseTotal + (directMailing ? quantity * 100 : 0);

    const handleAddToCart = () => {
        const skipUpload = effectiveRequiredPhotos === 0;
        if (!skipUpload && finalPhotos.length < effectiveRequiredPhotos) {
            alert(`Prosím nahrajte alespoň ${effectiveRequiredPhotos} fotografií.`); return;
        }
        const cartItem: CartItem = {
            id: `${product.id}-${Date.now()}`, product, quantity, price: baseTotal / quantity,
            variant: selectedVariant, photos: finalPhotos.length ? finalPhotos : [{ url: activeMedia, name: 'Motiv' }],
            photoGroupId, customText, directMailing
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setIsAdded(true);
        setTimeout(() => navigate('/kosik'), 600);
    };

    const inputClasses = "w-full py-2.5 px-4 bg-white rounded-xl border-2 border-gray-100 font-bold focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none placeholder-gray-400 text-sm transition-all shadow-sm";
    
    // Společné třídy pro tlačítka výběru
    const selectionBtnBase = "relative p-2 rounded-xl border-2 text-left transition-all h-full flex flex-col justify-center";
    const selectionBtnActive = "bg-brand-purple border-brand-purple text-white ring-2 ring-brand-purple/10";
    const selectionBtnInactive = "bg-white border-gray-100 text-gray-900 hover:border-gray-200";

    return (
        <div className="bg-white min-h-screen pb-40">
            <Seo title={product.name} description={product.shortDescription} image={activeMedia} />
            
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
                                <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-brand-purple shadow-sm">Ruční výroba</span>
                                <span className="bg-brand-pink/90 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-white shadow-sm">Vlastní fotky</span>
                            </div>
                        </div>
                        {/* GALLERY THUMBNAILS */}
                        <div className="grid grid-cols-5 gap-2">
                            {allMedia.map((m, i) => (
                                <button key={i} onClick={() => setActiveMedia(m)} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center ${activeMedia === m ? 'border-brand-purple scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}>
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
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 flex-shrink-0"></span>
                                        Skladem (3-5 dní)
                                    </div>
                                </div>
                                <div className="mt-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">DOPRAVA ZDARMA NAD 800 KČ</div>
                            </div>
                        </section>

                        {/* 1. VYBERTE ROZMĚR */}
                        <section>
                            <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">1. Vyberte rozměr</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {product.variants?.map(v => (
                                    <button 
                                        key={v.id} 
                                        onClick={() => setSelectedVariant(v)} 
                                        className={`${selectionBtnBase} ${selectedVariant?.id === v.id ? selectionBtnActive : selectionBtnInactive}`}
                                    >
                                        <div className={`text-[13px] font-black uppercase leading-tight ${selectedVariant?.id === v.id ? 'text-white' : 'text-gray-900'}`}>
                                            {v.name}
                                            {isWedding && v.id === 'a6' && <span className="block text-[8px] font-bold normal-case mt-0.5 opacity-80"> nejběžnější</span>}
                                        </div>
                                        <div className={`text-[11px] font-bold mt-0.5 ${selectedVariant?.id === v.id ? 'text-white/80' : 'text-gray-400'}`}>
                                            {v.price || product.price} Kč
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-[10px] font-bold text-brand-purple uppercase tracking-tight px-1 italic">
                                TIP: pokud vaše fotografie neodpovídá rozměru, nevadí, upravíme ji
                            </p>
                        </section>

                        {/* 2. POČET KUSŮ */}
                        <section>
                            <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">2. Počet kusů</h2>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner space-y-3">
                                <div>
                                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Vlastní počet</h3>
                                    <div className="relative">
                                        <select 
                                            value={quantity} 
                                            onChange={(e) => setQuantity(parseInt(e.target.value))} 
                                            className="w-full h-[48px] bg-white border-2 border-gray-100 rounded-xl px-4 font-black text-sm focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none appearance-none cursor-pointer transition-all hover:border-gray-200"
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
                                        <h3 className="text-[9px] font-black text-brand-purple uppercase tracking-widest mb-1.5 px-1">Zvýhodněné sady</h3>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(isPregnancy || isWedding ? [10, 20, 50, 100] : [9, 15, 30]).map(q => (
                                                <button 
                                                    key={q} 
                                                    onClick={() => setQuantity(q)} 
                                                    className={`${selectionBtnBase} text-center items-center py-2.5 ${quantity === q ? selectionBtnActive : selectionBtnInactive}`}
                                                >
                                                    <span className="text-[12px] font-black uppercase">{q === 15 ? '14+1' : q === 30 ? '28+2' : `${q} KS`}</span>
                                                    <span className={`text-[11px] font-black mt-0.5 ${quantity === q ? 'text-white/80' : 'text-brand-pink'}`}>{getSetPrice(q)} Kč</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. KONFIGURACE */}
                        <section>
                            <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">3. Motiv a konfigurace</h2>
                            
                            {isWedding && (
                                <div className="grid grid-cols-2 gap-1.5 mb-4">
                                    <button onClick={() => setDesignMode('motif')} className={`py-2.5 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${designMode === 'motif' ? 'bg-brand-purple border-brand-purple text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>Náš motiv</button>
                                    <button onClick={() => setDesignMode('custom')} className={`py-2.5 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${designMode === 'custom' ? 'bg-brand-purple border-brand-purple text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>Vlastní motiv</button>
                                </div>
                            )}

                            {(isWedding || isInLove) && designMode === 'motif' && motifs.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                                    {motifs.map((url, idx) => (
                                        <button key={idx} onClick={() => setActiveMedia(url)} className="group flex flex-col items-center">
                                            <div className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all ${activeMedia === url ? 'border-brand-purple ring-2 ring-brand-purple/10 scale-95' : 'border-gray-100'}`}>
                                                <img src={optimizeCloudinaryUrl(url, 200)} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className={`mt-1 text-[7px] font-black text-center uppercase tracking-wider transition-colors leading-tight ${activeMedia === url ? 'text-brand-purple' : 'text-gray-400'}`}>
                                                {isWedding ? weddingMotifNames[idx] : isInLove ? inLoveMotifNames[idx] : 'Motiv'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                {product.hasTextFields && !isCalendar && !(isWedding && designMode === 'custom') && (
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-brand-purple uppercase tracking-widest px-1">Doplňte text na oznámení:</h3>
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
                                        labelHint={
                                            (isWedding && designMode === 'custom') ? "vložte hotovou grafiku" :
                                            (isWedding && currentWeddingMotif === 'Film') ? "3 až 5 fotek" :
                                            isPregnancy ? "(např. ultrazvuk)" : 
                                            isCalendar ? "(12 fotek)" : 
                                            isWedding ? "(vaše fotka)" : undefined
                                        }
                                    />
                                )}
                            </div>
                        </section>

                        {/* 4. ROZESLÁNÍ */}
                        {(isWedding || isPregnancy) && (
                            <section>
                                <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">4. Rozeslání</h2>
                                <label className={`flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${directMailing ? 'bg-brand-purple/5 border-brand-purple' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" checked={directMailing} onChange={() => setDirectMailing(!directMailing)} className="mt-0.5 h-5 w-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple" />
                                    <div>
                                        <p className="font-black text-gray-800 text-[13px]">Rozeslat na jednotlivé adresy</p>
                                        <p className="text-[10px] text-gray-400 font-bold">+100 Kč / ks (adresy pak pošlete mailem)</p>
                                    </div>
                                </label>
                            </section>
                        )}

                        {/* STATICKÉ TLAČÍTKO VLOŽIT DO KOŠÍKU */}
                        <div className="pt-2">
                            <button onClick={handleAddToCart} disabled={isAdded || uploading} className={`w-full py-4 rounded-xl text-white font-black text-xl uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:opacity-95 disabled:grayscale'}`}>
                                {isAdded ? 'PŘIDÁNO ✓' : uploading ? 'Ukládám...' : `VLOŽIT DO KOŠÍKU — ${formatPrice(finalTotal)} Kč`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIXNÍ LIŠTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 pb-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="max-w-7xl mx-auto flex flex-col items-center px-4">
                    <div className="mb-2 text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">CELKEM:</span>
                        <span className="text-2xl font-black text-brand-purple">{formatPrice(finalTotal)} Kč</span>
                    </div>
                    <button onClick={handleAddToCart} disabled={isAdded || uploading} className={`w-full max-w-md py-4 rounded-xl text-white font-black text-base uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:opacity-95 disabled:grayscale'}`}>
                        {isAdded ? 'PŘIDÁNO ✓' : uploading ? 'Ukládám...' : `PŘIDAT DO KOŠÍKU — ${formatPrice(finalTotal)} Kč`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
