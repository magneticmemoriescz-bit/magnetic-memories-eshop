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

    // Mapování motivů (přesně podle screenshotu)
    const inLoveMotifNames = ["100 jazyků lásky", "Potřebuju tě", "Jsi můj vesmír", "Srdce", "Cosmos", "Vzkaz", "Kočička", "Forever", "Nápis I love you", "I love you", "Kočičky", "Puzzle", "Honey bee mine"];
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
        const required = selectedVariant?.photoCount || product.requiredPhotos;
        // Zamilované magnetky nepotřebují nahrávat fotku (berou se z motivů)
        const skipUpload = isInLove && designMode === 'motif';
        if (!skipUpload && (designMode === 'custom' || required > 0) && finalPhotos.length < required) {
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
                            
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-brand-purple shadow-sm">Ruční výroba</span>
                                <span className="bg-brand-pink/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm">Vlastní fotky</span>
                            </div>
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
                            <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-2xl p-6 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-4xl font-black text-brand-pink">{formatPrice(currentUnitPrice)} Kč</span>
                                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        Skladem
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">DOPRAVA ZDARMA NAD 800 KČ</div>
                            </div>
                            <p className="text-gray-500 leading-relaxed text-sm">{product.shortDescription}</p>
                        </section>

                        {/* 1. VYBERTE ROZMĚR */}
                        <section>
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">1. Vyberte rozměr</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.variants?.map(v => (
                                    <button 
                                        key={v.id} 
                                        onClick={() => setSelectedVariant(v)} 
                                        className={`relative group p-4 rounded-2xl border-2 text-left transition-all ${selectedVariant?.id === v.id ? 'bg-brand-purple border-brand-purple' : 'bg-white border-gray-100'}`}
                                    >
                                        <div className={`text-sm font-black uppercase transition-colors ${selectedVariant?.id === v.id ? 'text-white' : 'text-gray-900'}`}>
                                            {v.name}
                                        </div>
                                        <div className={`text-xs font-bold mt-1 ${selectedVariant?.id === v.id ? 'text-white/80' : 'text-gray-400'}`}>
                                            {v.price || product.price} Kč
                                        </div>
                                        {selectedVariant?.id === v.id && (
                                            <div className="absolute bottom-0 right-0 p-1.5 bg-brand-purple text-white rounded-tl-xl rounded-br-xl border-t border-l border-white/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 2. POČET KUSŮ */}
                        <section>
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">2. Počet kusů</h2>
                            <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                                {/* Individuální počet */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Individuální počet</h3>
                                    <div className="flex justify-center">
                                        <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-brand-purple outline-none text-center">
                                            {[1,2,3,4,5,6,10,15,20,30,50,100].map(n => <option key={n} value={n}>{n} ks</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Zvýhodněné sady */}
                                {!isCalendar && (
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-4 text-center">Zvýhodněné sady</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(isPregnancy || isWedding ? [10, 20, 50, 100] : [9, 15, 30]).map(q => (
                                                <button key={q} onClick={() => setQuantity(q)} className={`py-4 px-2 rounded-xl border-2 flex flex-col items-center transition-all ${quantity === q ? 'bg-brand-purple/5 border-brand-purple ring-1 ring-brand-purple' : 'bg-white border-gray-100 text-gray-400'}`}>
                                                    <span className="text-xs font-black tracking-tight">{q === 15 ? '14+1' : q === 30 ? '28+2' : `${q} KS`}</span>
                                                    <span className={`text-[11px] font-bold mt-1 ${quantity === q ? 'text-brand-pink' : 'text-brand-pink/60'}`}>{getSetPrice(q)} Kč</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. VÝBĚR MOTIVU A KONFIGURACE */}
                        <section>
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">3. Výběr motivu a konfigurace</h2>
                            
                            {/* Možnost přepínání pouze u svatby */}
                            {isWedding && (
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    <button onClick={() => setDesignMode('motif')} className={`py-3 rounded-xl border-2 font-black uppercase text-xs ${designMode === 'motif' ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-100 text-gray-400'}`}>Náš motiv</button>
                                    <button onClick={() => setDesignMode('custom')} className={`py-3 rounded-xl border-2 font-black uppercase text-xs ${designMode === 'custom' ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-100 text-gray-400'}`}>Vlastní motiv</button>
                                </div>
                            )}

                            {(isWedding || isInLove) && designMode === 'motif' && motifs.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                    {motifs.map((url, idx) => (
                                        <button key={idx} onClick={() => setActiveMedia(url)} className="group flex flex-col items-center">
                                            <div className={`relative aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all ${activeMedia === url ? 'border-brand-purple ring-4 ring-brand-purple/10' : 'border-gray-100'}`}>
                                                <img src={optimizeCloudinaryUrl(url, 400)} className="w-full h-full object-cover" alt="" />
                                                {activeMedia === url && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-brand-purple/10">
                                                        <div className="bg-brand-purple text-white p-2 rounded-full shadow-lg">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`mt-2 text-[10px] font-bold text-center uppercase tracking-wider transition-colors ${activeMedia === url ? 'text-brand-purple' : 'text-gray-400'}`}>
                                                {isWedding ? weddingMotifNames[idx] : isInLove ? inLoveMotifNames[idx] : 'Motiv'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                {/* Textová pole pouze pro oznámení */}
                                {product.hasTextFields && !isCalendar && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <input placeholder={isWedding ? "Budeme se brát" : "Budeme tři..."} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple placeholder-gray-300" onChange={(e) => setCustomText(p => ({...p, t1: e.target.value}))} />
                                        <input placeholder={isWedding ? "Eva a Adam" : "podzim 2026"} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple placeholder-gray-300" onChange={(e) => setCustomText(p => ({...p, t2: e.target.value}))} />
                                        {isWedding && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <input placeholder="1. 1. 2029" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple placeholder-gray-300" onChange={(e) => setCustomText(p => ({...p, t3: e.target.value}))} />
                                                <input placeholder="Místo" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple placeholder-gray-300" onChange={(e) => setCustomText(p => ({...p, t4: e.target.value}))} />
                                            </div>
                                        )}
                                        <textarea placeholder="Speciální přání..." className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-brand-purple resize-none placeholder-gray-300" rows={2} onChange={(e) => setCustomText(p => ({...p, msg: e.target.value}))} />
                                    </div>
                                )}

                                {/* Nahrávání fotek - SKRYTO PRO ZAMILOVANÉ (POUŽÍVAJÍ MOTIVY) */}
                                {!isInLove && (isMagnets || isCalendar || isMerch || isPregnancy || designMode === 'custom') && (
                                    <FileUpload 
                                        onUploadComplete={(p, g) => {setFinalPhotos(p); setPhotoGroupId(g);}} 
                                        requiredCount={selectedVariant?.photoCount || product.requiredPhotos} 
                                        productName={product.name} 
                                        onUploadingChange={setUploading} 
                                        labelHint={isPregnancy ? "(např. ultrazvuk)" : isCalendar ? "(nahrajte 12 fotek)" : undefined}
                                    />
                                )}

                                {/* Info box o náhledu – ZOBRAZEN POUZE PRO SVATEBNÍ OZNÁMENÍ */}
                                {isWedding && (
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
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Možnost rozeslání</h2>
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
                <div className="max-w-7xl mx-auto flex flex-col items-center px-4">
                    <div className="mb-3 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">CELKEM:</span>
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
