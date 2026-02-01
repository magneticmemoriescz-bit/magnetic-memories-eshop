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
    
    // Rozlišení typů produktů
    const isWedding = id === 'wedding-announcement';
    const isPregnancy = id === 'pregnancy-announcement';
    const isInLove = id === 'in-love-magnets';
    const isMagnets = id === 'photomagnets';

    // Volba designu (pro Svatby/Těhotenství)
    const [designMode, setDesignMode] = useState<'motif' | 'custom'>(
        (isWedding || isPregnancy) ? 'motif' : 'custom'
    );

    // Galerie bez duplicit (první fotka se neopakuje v náhledech)
    const allMedia = useMemo(() => {
        if (!product) return [];
        const combined = [product.imageUrl, ...product.gallery];
        return Array.from(new Set(combined));
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

    // Pokud varianta změní obrázek (např. u merch magnetek)
    useEffect(() => {
        if (selectedVariant?.imageUrl) {
            setActiveMedia(selectedVariant.imageUrl);
        }
    }, [selectedVariant]);

    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Produkt nenalezen.</div>;

    const currentUnitPrice = selectedVariant?.price || product.price;
    const basePriceTotal = currentUnitPrice * quantity;

    const handleNextMedia = () => {
        const idx = allMedia.indexOf(activeMedia);
        const next = (idx + 1) % allMedia.length;
        setActiveMedia(allMedia[next]);
    };

    const handlePrevMedia = () => {
        const idx = allMedia.indexOf(activeMedia);
        const prev = (idx - 1 + allMedia.length) % allMedia.length;
        setActiveMedia(allMedia[prev]);
    };

    const handleUploadComplete = (photos: UploadedPhoto[], groupId: string | null) => {
        setFinalPhotos(photos);
        setPhotoGroupId(groupId);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomText(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = () => {
        if (designMode === 'custom' && product.requiredPhotos > 0 && finalPhotos.length === 0) {
            alert('Prosím nahrajte své fotografie nebo přepněte na volbu motivu.');
            return;
        }

        let cartPhotos = finalPhotos;
        if (designMode === 'motif' || product.requiredPhotos === 0) {
            cartPhotos = [{ url: activeMedia, name: 'Vybraný motiv' }];
        }

        trackAddToCart(product, selectedVariant, quantity, currentUnitPrice);

        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id || 'default'}-${Date.now()}`,
            product, quantity, price: currentUnitPrice, variant: selectedVariant, 
            photos: cartPhotos, photoGroupId,
            customText: Object.keys(customText).length > 0 ? customText : undefined,
        };
        
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setIsAdded(true);
        setTimeout(() => navigate('/kosik'), 800);
    };

    return (
        <div className="bg-white">
            <Seo 
                title={`${product.name} | Magnetic Memories`} 
                description={product.shortDescription}
                image={optimizeCloudinaryUrl(product.imageUrl, 1200)}
                type="product" price={basePriceTotal} availability="InStock"
            />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    
                    {/* LEVÁ STRANA: Interaktivní Galerie se šipkami */}
                    <div className="flex flex-col">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-inner border border-gray-100 relative group">
                            {isVideo(activeMedia) ? (
                                <video 
                                    key={activeMedia} 
                                    src={activeMedia} 
                                    className="w-full h-full object-cover" 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                />
                            ) : (
                                <img 
                                    src={optimizeCloudinaryUrl(activeMedia, 1000)} 
                                    alt="" 
                                    className="w-full h-full object-center object-cover transition-all duration-700 group-hover:scale-105" 
                                />
                            )}
                            
                            {/* Šipky na hlavní fotce */}
                            <button onClick={handlePrevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90 z-10">
                                <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button onClick={handleNextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90 z-10">
                                <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                            </button>

                            {/* Informační Štítky */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-20">
                                <span className="bg-white/95 backdrop-blur-sm text-brand-purple text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-brand-purple/10">
                                    Ruční výroba
                                </span>
                                {(product.requiredPhotos > 0 || designMode === 'custom') && (
                                    <span className="bg-brand-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                                        Vlastní fotky
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Náhledy / Výběr motivu */}
                        <div className="mt-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                {isInLove || (designMode === 'motif' && (isWedding || isPregnancy)) ? '1. Vyberte si motiv' : 'Další ukázky'}
                            </h3>
                            <div className="grid grid-cols-5 gap-2.5">
                                {allMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveMedia(media);
                                            // Pokud jde o produkt s motivy, automaticky přepne na 'motif' mód
                                            if (isWedding || isPregnancy) setDesignMode('motif');
                                        }}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeMedia === media ? 'border-brand-purple ring-4 ring-brand-purple/10 scale-95 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        {isVideo(media) ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                                            </div>
                                        ) : (
                                            <img src={optimizeCloudinaryUrl(media, 200)} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PRAVÁ STRANA: Konfigurátor a Sady */}
                    <div className="mt-10 lg:mt-0">
                        <div className="flex flex-col border-b border-gray-100 pb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                            <div className="mt-4 flex items-center justify-between bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                <div>
                                    <p className="text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Doprava zdarma nad 800 Kč</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-green-600 font-black text-xs uppercase tracking-widest mb-1">
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                        Skladem
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold">Odesíláme do 3-5 dnů</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-8">
                            
                            {/* VÝBĚR VARIANTY / SADY KUSŮ */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                        {isWedding || isPregnancy ? 'Výběr rozměru' : 'Výběr rozměru a počtu kusů'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all relative group ${selectedVariant?.id === v.id ? 'bg-brand-purple/5 border-brand-purple shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-sm font-black uppercase tracking-wide ${selectedVariant?.id === v.id ? 'text-brand-purple' : 'text-gray-700'}`}>{v.name}</span>
                                                    {v.id === 'a6' && isWedding && (
                                                        <span className="text-[9px] text-brand-purple font-black uppercase tracking-tighter bg-brand-purple/10 px-1.5 py-0.5 rounded">Běžný formát</span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex flex-col">
                                                    {v.price && <span className="text-xs font-bold text-gray-400">{formatPrice(v.price)} Kč</span>}
                                                    {v.itemCount && v.itemCount > 1 && (
                                                        <span className="text-[10px] text-brand-pink font-black uppercase mt-1">
                                                            Výhodná sada {v.itemCount} ks
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedVariant?.id === v.id && (
                                                    <div className="absolute -right-1 -bottom-1 bg-brand-purple text-white p-1.5 rounded-tl-xl shadow-sm">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PŘEPÍNAČ NÁŠ MOTIV / VLASTNÍ FOTKA */}
                            {(isWedding || isPregnancy) && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Způsob návrhu</h3>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                                        <button 
                                            onClick={() => setDesignMode('motif')} 
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'motif' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Použít náš motiv
                                        </button>
                                        <button 
                                            onClick={() => setDesignMode('custom')} 
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'custom' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Vlastní design / fotka
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* NAHRÁVÁNÍ FOTEK */}
                            {(designMode === 'custom' || product.requiredPhotos > 0) && (
                                <div className="pt-2">
                                    <FileUpload 
                                        onUploadComplete={handleUploadComplete} 
                                        requiredCount={selectedVariant?.photoCount || product.requiredPhotos}
                                        productName={product.name}
                                        onUploadingChange={setUploading}
                                        labelHint={isPregnancy ? "(např. ultrazvuk)" : isMagnets ? "(vaše nejlepší fotky)" : undefined}
                                    />
                                </div>
                            )}

                            {/* TEXTOVÁ POLE PRO PERSONALIZACI */}
                            {product.hasTextFields && (
                                <div className="pt-2 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Doplnění textů</h3>
                                    <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Hlavní nápis</label>
                                            <input name="text1" placeholder="Např.: Budeme se brát!" className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm font-bold" onChange={handleTextChange} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Jména / Kdo oznamuje</label>
                                            <input name="text2" placeholder="Adriana & Michal" className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm font-bold" onChange={handleTextChange} />
                                        </div>
                                        {isWedding && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Datum</label>
                                                    <input name="text3" placeholder="24. 8. 2024" className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm font-bold" onChange={handleTextChange} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Místo</label>
                                                    <input name="text4" placeholder="Zámek Sychrov" className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm font-bold" onChange={handleTextChange} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Speciální přání / Poznámka</label>
                                            <textarea name="comment" placeholder="Změna písma, barvy nebo jiné přání..." rows={2} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm font-bold resize-none" onChange={handleTextChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* KOŠÍK A POČET */}
                            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-5">
                                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-2xl w-max shadow-inner">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-xl font-black transition-all active:scale-90 disabled:opacity-50" disabled={quantity <= 1}>−</button>
                                    <span className="text-2xl font-black min-w-[3.5rem] text-center text-gray-800">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-xl font-black transition-all active:scale-90">+</button>
                                </div>

                                <button 
                                    onClick={handleAddToCart} disabled={isAdded || uploading}
                                    className={`flex-grow py-5 px-8 rounded-2xl text-white font-black text-xl shadow-[0_15px_30px_-5px_rgba(234,92,157,0.3)] transition-all relative overflow-hidden group ${isAdded ? 'bg-green-500' : 'bg-gradient-to-r from-brand-pink to-brand-orange hover:-translate-y-1 active:scale-95 disabled:grayscale'}`}
                                >
                                    <span className="relative z-10">
                                        {uploading ? 'NAHRÁVÁNÍ...' : isAdded ? '✓ PŘIDÁNO DO KOŠÍKU' : 'VLOŽIT DO KOŠÍKU'}
                                    </span>
                                    {!isAdded && !uploading && (
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Popis produktu */}
                <div className="mt-20 pt-20 border-t border-gray-100">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">O produktu</h2>
                        <div className="prose prose-brand text-gray-600 leading-relaxed text-lg italic">
                            {product.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
