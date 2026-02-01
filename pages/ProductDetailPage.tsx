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

        // Volba designu (pro Svatby možnost přepínání)
        const [designMode, setDesignMode] = useState<'motif' | 'custom'>(
            isWedding ? 'motif' : 'custom'
        );

        // Mapování motivů
        const inLoveMotifNames = ["100 jazyků", "Potřebuju tě", "Vesmír", "Srdce", "Cosmos", "Vzkaz", "Kočička", "Forever", "I love you", "I love you 2", "Kočičky", "Puzzle", "Honey bee"];
        const weddingMotifNames = ["Elegantní", "Polaroid", "Obálka", "Film", "Fialové květy", "Bílé květy"];

        const allMedia = useMemo(() => {
            if (!product) return [];
            return Array.from(new Set([product.imageUrl, ...product.gallery]));
        }, [product]);

        const motifs = useMemo(() => product?.gallery || [], [product]);

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
            if (qty === 15 && (isMagnets || isInLove)) return unit * 14;
            if (qty === 30 && (isMagnets || isInLove)) return unit * 28;
            return unit * qty;
        };

        const currentUnitPrice = (isPregnancy || isWedding) && selectedVariant?.id === 'a6' 
            ? (quantity >= 100 ? 37.5 : quantity >= 50 ? 38 : quantity >= 20 ? 38.75 : quantity >= 10 ? 40 : 45)
            : (selectedVariant?.price || product.price);

        // Pro kalendář nepoužíváme slevové sady
        const isSet = isCalendar ? false : ((isMagnets || isInLove) ? [9, 15, 30].includes(quantity) : [10, 20, 50, 100].includes(quantity));
        const baseTotal = isSet ? getSetPrice(quantity) : (currentUnitPrice * quantity);
        const finalTotal = baseTotal + (directMailing ? quantity * 100 : 0);

        const handleAddToCart = () => {
            const required = selectedVariant?.photoCount || product.requiredPhotos;
            if ((designMode === 'custom' || required > 0) && finalPhotos.length < required) {
                alert(`Prosím nahrajte všech ${required} fotografií.`); return;
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

        return (
            <div className="bg-white min-h-screen pb-40">
                <Seo title={product.name} description={product.shortDescription} image={activeMedia} />
                
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                        
                        {/* LEVÝ SLOUPY: GALERIE */}
                        <div className="space-y-6">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative">
                                {isVideo(activeMedia) ? (
                                    <video key={activeMedia} src={activeMedia} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                    <img src={optimizeCloudinaryUrl(activeMedia, 1000)} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {allMedia.map((m, i) => (
                                    <button key={i} onClick={() => setActiveMedia(m)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeMedia === m ? 'border-brand-purple scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={optimizeCloudinaryUrl(m, 200)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRAVÝ SLOUPY: KONFIGURÁTOR */}
                        <div className="mt-10 lg:mt-0 space-y-10">
                            <section>
                                <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
                                <div className="flex items-baseline space-x-2 mb-4">
                                    <span className="text-3xl font-black text-brand-purple">{formatPrice(currentUnitPrice)} Kč</span>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">za 1 ks</span>
                                </div>
                                <p className="text-gray-500 leading-relaxed">{product.shortDescription}</p>
                            </section>

                            {/* 1. ROZMĚR */}
                            <section>
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">1. Vyberte rozměr</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {product.variants?.map(v => (
                                        <button key={v.id} onClick={() => setSelectedVariant(v)} className={`py-3 px-2 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${selectedVariant?.id === v.id ? 'bg-brand-purple border-brand-purple text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* 2. POČET */}
                            <section>
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">2. Počet kusů</h2>
                                <div className="bg-gray-50 rounded-3xl p-6 space-y-6 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Zvolte počet:</span>
                                        <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-brand-purple outline-none">
                                            {[1,2,3,4,5,6,10,15,20,30,50,100].map(n => <option key={n} value={n}>{n} ks</option>)}
                                        </select>
                                    </div>
                                    
                                    {/* Sady pro vše kromě kalendáře */}
                                    {!isCalendar && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
                                            {(isPregnancy || isWedding ? [10, 20, 50, 100] : [9, 15, 30]).map(q => (
                                                <button key={q} onClick={() => setQuantity(q)} className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${quantity === q ? 'bg-brand-purple border-brand-purple text-white' : 'bg-white border-gray-100 text-gray-400'}`}>
                                                    <span className="text-[10px] font-black">{q === 15 ? '14+1' : q === 30 ? '28+2' : `${q} KS`}</span>
                                                    <span className={`text-[9px] font-bold ${quantity === q ? 'text-white/80' : 'text-brand-pink'}`}>{getSetPrice(q)} Kč</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 3. KONFIGURACE */}
                            <section>
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">3. Konfigurace vzpomínek</h2>
                                
                                {isWedding && (
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        <button onClick={() => setDesignMode('motif')} className={`py-3 rounded-xl border-2 font-black uppercase text-xs ${designMode === 'motif' ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-100 text-gray-400'}`}>Náš motiv</button>
                                        <button onClick={() => setDesignMode('custom')} className={`py-3 rounded-xl border-2 font-black uppercase text-xs ${designMode === 'custom' ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-100 text-gray-400'}`}>Vlastní motiv</button>
                                    </div>
                                )}

                                {(isWedding || isInLove) && designMode === 'motif' && motifs.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                                        {motifs.map((url, idx) => (
                                            <button key={idx} onClick={() => setActiveMedia(url)} className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeMedia === url ? 'border-brand-purple ring-4 ring-brand-purple/10' : 'border-transparent'}`}>
                                                <img src={optimizeCloudinaryUrl(url, 300)} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 text-[8px] text-white font-bold text-center uppercase">
                                                    {isWedding ? weddingMotifNames[idx] : isInLove ? inLoveMotifNames[idx] : 'Motiv'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    {/* Textová pole pouze pro oznámení */}
                                    {product.hasTextFields && !isCalendar && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <input placeholder={isWedding ? "Budeme se brát" : "Budeme tři..."} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple" onChange={(e) => setCustomText(p => ({...p, t1: e.target.value}))} />
                                            <input placeholder={isWedding ? "Eva a Adam" : "podzim 2026"} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple" onChange={(e) => setCustomText(p => ({...p, t2: e.target.value}))} />
                                            {isWedding && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input placeholder="1. 1. 2029" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple" onChange={(e) => setCustomText(p => ({...p, t3: e.target.value}))} />
                                                    <input placeholder="Místo" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple" onChange={(e) => setCustomText(p => ({...p, t4: e.target.value}))} />
                                                </div>
                                            )}
                                            <textarea placeholder="Speciální přání..." className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple resize-none" rows={2} onChange={(e) => setCustomText(p => ({...p, msg: e.target.value}))} />
                                        </div>
                                    )}

                                    {/* Nahrávání fotek */}
                                    {(isMagnets || isCalendar || isMerch || isPregnancy || designMode === 'custom') && (
                                        <FileUpload 
                                            onUploadComplete={(p, g) => {setFinalPhotos(p); setPhotoGroupId(g);}} 
                                            requiredCount={selectedVariant?.photoCount || product.requiredPhotos} 
                                            productName={product.name} 
                                            onUploadingChange={setUploading} 
                                            labelHint={isPregnancy ? "(např. ultrazvuk)" : isCalendar ? "(nahrajte 12 fotek)" : undefined}
                                        />
                                    )}

                                    {/* Info box o náhledu skryt pro těhotenství a kalendář */}
                                    {!isPregnancy && !isCalendar && (
                                        <div className="bg-yellow-50 p-4 rounded-2xl flex items-start space-x-3">
                                            <div className="text-yellow-500 mt-0.5">ⓘ</div>
                                            <p className="text-[11px] font-bold text-yellow-800">Náhled bude vždy poslán ke schválení před výrobou.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 4. ROZESLÁNÍ (pouze pro oznámení) */}
                            {(isWedding || isPregnancy) && (
                                <section>
                                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">4. Možnost rozeslání</h2>
                                    <label className={`flex items-start space-x-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${directMailing ? 'bg-brand-purple/5 border-brand-purple' : 'bg-white border-gray-100'}`}>
                                        <input type="checkbox" checked={directMailing} onChange={() => setDirectMailing(!directMailing)} className="mt-1 h-5 w-5 text-brand-purple rounded" />
                                        <div>
                                            <p className="font-black text-gray-800 text-sm">Rozeslat na jednotlivé adresy</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1">+100 Kč / ks (adresy nám pak pošlete mailem)</p>
                                        </div>
                                    </label>
                                </section>
                            )}
                        </div>
                    </div>
                </div>

                {/* FIXNÍ LIŠTA */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50 shadow-2xl">
                    <div className="max-w-7xl mx-auto flex flex-col items-center">
                        <div className="mb-3 text-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Celková cena</span>
                            <span className="text-3xl font-black text-brand-purple">{formatPrice(finalTotal)} Kč</span>
                        </div>
                        <button onClick={handleAddToCart} disabled={isAdded || uploading} className={`w-full max-w-md py-5 rounded-2xl text-white font-black text-xl uppercase tracking-widest transition-all shadow-xl ${isAdded ? 'bg-green-500' : 'bg-brand-pink hover:scale-95 active:scale-90 disabled:grayscale'}`}>
                            {isAdded ? 'PŘIDÁNO ✓' : uploading ? 'Ukládám...' : 'PŘIDAT DO KOŠÍKU'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default ProductDetailPage;
