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
    
    // Rozlišení typů produktů
    const isWedding = id === 'wedding-announcement';
    const isPregnancy = id === 'pregnancy-announcement';
    const isInLove = id === 'in-love-magnets';
    const isMagnets = id === 'photomagnets';
    const isMerch = id === 'magnetic-merch';

    // Volba designu (pro Svatby/Těhotenství)
    const [designMode, setDesignMode] = useState<'motif' | 'custom'>(
        (isWedding || isPregnancy) ? 'motif' : 'custom'
    );

    // Mapování jmen motivů
    const inLoveMotifNames = [
        "100 jazyků lásky", "Potřebuju tě", "Jsi můj vesmír", "Srdce", 
        "Cosmos", "Vzkaz", "Kočička", "Forever", "Nápis I love you", 
        "I love you", "Kočičky", "Puzzle", "Honey bee mine"
    ];

    const weddingMotifNames = [
        "Elegantní", "Polaroid", "Obálka časopisu", "Film", "Fialové květy", "Bílé květy"
    ];

    // Galerie bez duplicit
    const allMedia = useMemo(() => {
        if (!product) return [];
        const combined = [product.imageUrl, ...product.gallery];
        return Array.from(new Set(combined));
    }, [product]);

    // Motivy pro Step 3
    const motifs = useMemo(() => {
        if (!product) return [];
        return product.gallery;
    }, [product]);

    // Inicializace
    useEffect(() => {
        if (product) {
            if (!selectedVariant && product.variants && product.variants.length > 0) {
                setSelectedVariant(product.variants[0]);
            }
            if (!activeMedia) {
                setActiveMedia(product.imageUrl);
            }
        }
    }, [product, selectedVariant, activeMedia]);

    useEffect(() => {
        if (selectedVariant?.imageUrl && !isInLove && !isPregnancy && !isWedding) {
            setActiveMedia(selectedVariant.imageUrl);
        }
    }, [selectedVariant, isInLove, isPregnancy, isWedding]);

    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Produkt nenalezen.</div>;

    // Logika výpočtu ceny sady
    const getSetPrice = (qty: number) => {
        const unitPrice = selectedVariant?.price || product.price;
        // Speciální ceny pro sady oznámení (A6)
        if ((isPregnancy || isWedding) && selectedVariant?.id === 'a6') {
            if (qty === 10) return 400;
            if (qty === 20) return 775;
            if (qty === 50) return 1900;
            if (qty === 100) return 3750;
        }

        // Pro magnetky
        if (qty === 9) return Math.round(unitPrice * 9 * 0.91);
        if (qty === 15) return Math.round(unitPrice * 14);
        if (qty === 30) return Math.round(unitPrice * 28);
        return unitPrice * qty;
    };

    const getUnitPrice = () => {
        const base = selectedVariant?.price || product.price;
        if ((isPregnancy || isWedding) && selectedVariant?.id === 'a6') {
            if (quantity >= 100) return 37.5;
            if (quantity >= 50) return 38;
            if (quantity >= 20) return 38.75;
            if (quantity >= 10) return 40;
        }
        return base;
    };

    const currentUnitPrice = getUnitPrice();
    const mailingSurcharge = directMailing ? 100 : 0;
    
    const isStandardSet = (isMagnets || isInLove || isMerch) ? [9, 15, 30].includes(quantity) : [10, 20, 50, 100].includes(quantity);
    const basePriceTotal = isStandardSet ? getSetPrice(quantity) : (currentUnitPrice * quantity);
    const finalTotal = basePriceTotal + (mailingSurcharge * quantity);

    const handleAddToCart = () => {
        if ((designMode === 'custom' || product.requiredPhotos > 0) && finalPhotos.length === 0) {
            alert('Prosím nahrajte své fotografie.');
            return;
        }

        let cartPhotos = finalPhotos;
        if (designMode === 'motif' || product.requiredPhotos === 0) {
            cartPhotos = [{ url: activeMedia, name: 'Vybraný motiv' }];
        }

        trackAddToCart(product, selectedVariant, quantity, currentUnitPrice);

        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id || 'default'}-${Date.now()}`,
            product, quantity, price: basePriceTotal / quantity, variant: selectedVariant, 
            photos: cartPhotos, photoGroupId,
            customText: Object.keys(customText).length > 0 ? customText : undefined,
            directMailing
        };
        
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setIsAdded(true);
        setTimeout(() => navigate('/kosik'), 800);
    };

    return (
        <div className="bg-white min-h-screen pb-40">
            <Seo title={`${product.name} | Magnetic Memories`} description={product.shortDescription} image={optimizeCloudinaryUrl(product.imageUrl, 1200)} />
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* HLAVIČKA */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{product.name}</h1>
                    <div className="flex items-baseline space-x-2 mb-4">
                        <span className="text-4xl font-black text-brand-purple">{formatPrice(currentUnitPrice)} Kč</span>
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">za 1 ks oznámení</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg max-w-3xl">{product.shortDescription}</p>
                </div>

                <div className="space-y-12 max-w-4xl">
                    {/* KROK 1: VELIKOST */}
                    <section>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">1. Velikost oznámení</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {product.variants?.map(v => (
                                <button 
                                    key={v.id} onClick={() => setSelectedVariant(v)}
                                    className={`py-4 px-4 rounded-xl border-2 font-black uppercase text-sm transition-all shadow-sm ${selectedVariant?.id === v.id ? 'bg-brand-purple border-brand-purple text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* KROK 2: POČET KUSŮ */}
                    <section>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">2. Počet kusů</h2>
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Individuální počet</h3>
                                <div className="relative max-w-xs mx-auto">
                                    <select 
                                        value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 py-4 px-6 rounded-2xl font-bold text-lg appearance-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none"
                                    >
                                        {[1,2,3,4,5,6,7,8,10,12,15,20,25,30,40,50,100].map(n => <option key={n} value={n}>{n} ks</option>)}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-6 text-center">Zvýhodněné sady</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { q: 10, label: '10 KS' },
                                        { q: 20, label: '20 KS' },
                                        { q: 50, label: '50 KS' },
                                        { q: 100, label: '100 KS' }
                                    ].map(pack => (
                                        <button 
                                            key={pack.q} onClick={() => setQuantity(pack.q)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${quantity === pack.q ? 'bg-brand-purple/5 border-brand-purple ring-2 ring-brand-purple/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <span className="text-xs font-black text-gray-900 uppercase">{pack.label}</span>
                                            <span className="text-[11px] font-bold text-brand-pink mt-1">{getSetPrice(pack.q)} Kč</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* KROK 3: KONFIGURACE */}
                    <section>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">3. Výběr motivu a konfigurace</h2>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setDesignMode('motif')} className={`py-4 px-4 rounded-xl border-2 font-black uppercase text-sm transition-all ${designMode === 'motif' ? 'bg-brand-purple border-brand-purple text-white' : 'bg-white border-gray-100 text-gray-600'}`}>Náš motiv</button>
                            <button onClick={() => setDesignMode('custom')} className={`py-4 px-4 rounded-xl border-2 font-black uppercase text-sm transition-all ${designMode === 'custom' ? 'bg-brand-purple border-brand-purple text-white' : 'bg-white border-gray-100 text-gray-600'}`}>Vlastní motiv</button>
                        </div>

                        {designMode === 'motif' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 mb-10">
                                {motifs.map((url, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <button 
                                            onClick={() => setActiveMedia(url)}
                                            className={`relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${activeMedia === url ? 'border-brand-purple ring-4 ring-brand-purple/10' : 'border-transparent hover:border-gray-200'}`}
                                        >
                                            <img src={optimizeCloudinaryUrl(url, 400)} alt="" className="w-full h-full object-cover" />
                                            {activeMedia === url && (
                                                <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                                                    <div className="bg-brand-purple text-white p-2 rounded-full shadow-lg scale-110">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                        <p className="mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight text-center">{weddingMotifNames[idx] || "Motiv"}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-brand-purple uppercase tracking-widest">Doplnění textů na oznámení</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">Hlavní text (např. Budeme se brát)</label>
                                        <input placeholder="Budeme se brát" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold" onChange={(e) => setCustomText(prev => ({ ...prev, text1: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">Jména snoubenců</label>
                                        <input placeholder="Eva a Adam" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold" onChange={(e) => setCustomText(prev => ({ ...prev, text2: e.target.value }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">Datum (případně i čas)</label>
                                            <input placeholder="1. 1. 2029" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold" onChange={(e) => setCustomText(prev => ({ ...prev, text3: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">Místo</label>
                                            <input placeholder="Staroměstská radnice" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold" onChange={(e) => setCustomText(prev => ({ ...prev, text4: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-wider">Vaše speciální přání</label>
                                        <textarea placeholder="Máte přání na jiný font, barvu atd?" rows={2} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold resize-none" onChange={(e) => setCustomText(prev => ({ ...prev, comment: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black text-brand-purple uppercase tracking-widest mb-4">{designMode === 'custom' ? 'Nahrajte vlastní návrh' : 'Nahrajte doplňující fotografii'}</h3>
                                <FileUpload 
                                    onUploadComplete={(photos, gid) => { setFinalPhotos(photos); setPhotoGroupId(gid); }}
                                    requiredCount={1} productName={product.name} onUploadingChange={setUploading}
                                />
                            </div>

                            <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-4 rounded-r-xl flex items-start space-x-3 mt-4">
                                <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                <p className="text-sm font-bold text-yellow-800">Náhled bude vždy poslán ke schválení před započetím výroby.</p>
                            </div>
                        </div>
                    </section>

                    {/* KROK 4: ROZESLÁNÍ */}
                    <section>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">4. Možnost rozeslání</h2>
                        <div className={`p-6 rounded-3xl border-2 transition-all flex items-start space-x-4 cursor-pointer ${directMailing ? 'bg-brand-purple/5 border-brand-purple shadow-sm' : 'bg-white border-gray-100'}`} onClick={() => setDirectMailing(!directMailing)}>
                            <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-1 transition-all ${directMailing ? 'bg-brand-purple border-brand-purple' : 'bg-white border-gray-300'}`}>
                                {directMailing && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <div>
                                <p className="font-black text-gray-800 leading-snug">Přeji si rozeslat oznámení na jednotlivé adresy</p>
                                <p className="text-sm text-gray-500 mt-1 font-bold">Příplatek 100 Kč / ks (tj. {formatPrice(quantity * 100)} Kč navíc)</p>
                                <a href="mailto:magnetic.memories.cz@gmail.com" className="text-brand-purple text-xs font-black underline mt-2 inline-block">V tomto případě nám prosím pošlete mailem seznam adres.</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* FIXNÍ SPODNÍ BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="flex items-baseline space-x-2 mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Celkem:</span>
                        <span className="text-3xl font-black text-brand-purple tracking-tight">{formatPrice(finalTotal)} Kč</span>
                    </div>
                    <button 
                        onClick={handleAddToCart} disabled={isAdded || uploading}
                        className={`w-full max-w-md py-5 rounded-2xl text-white font-black text-xl uppercase tracking-widest transition-all shadow-[0_15px_30px_-5px_rgba(234,92,157,0.3)] ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:opacity-95 active:scale-95 disabled:grayscale'}`}
                    >
                        {isAdded ? 'PŘIDÁNO ✓' : uploading ? 'NAHRÁVÁNÍ...' : 'PŘIDAT DO KOŠÍKU'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
