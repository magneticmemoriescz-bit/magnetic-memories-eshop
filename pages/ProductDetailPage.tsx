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
    
    // Pro svatby a těhotenství: Volba mezi naším motivem a vlastní fotkou
    const [designMode, setDesignMode] = useState<'motif' | 'custom'>(
        product?.requiredPhotos === 0 ? 'motif' : 'custom'
    );

    const allMedia = useMemo(() => {
        if (!product) return [];
        // Odstranění duplicity hlavní fotky v galerii
        const filteredGallery = product.gallery.filter(url => url !== product.imageUrl);
        return [product.imageUrl, ...filteredGallery];
    }, [product]);

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
        // Kontrola nahrání fotek u "custom" módu
        if (designMode === 'custom' && product.requiredPhotos > 0 && finalPhotos.length === 0) {
            alert('Prosím nahrajte své fotografie nebo přepněte na volbu motivu.');
            return;
        }

        let cartPhotos = finalPhotos;
        // Pokud je vybrán motiv, pošleme ho jako URL fotky
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

    const isWedding = product.id === 'wedding-announcement';
    const isPregnancy = product.id === 'pregnancy-announcement';

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
                    
                    {/* LEVÁ STRANA: Galerie */}
                    <div className="flex flex-col">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-inner border border-gray-100 relative group">
                            {isVideo(activeMedia) ? (
                                <video key={activeMedia} src={activeMedia} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                            ) : (
                                <img src={optimizeCloudinaryUrl(activeMedia, 1000)} alt="" className="w-full h-full object-center object-cover transition-all duration-700" />
                            )}
                            
                            {/* Navigační šipky */}
                            <button onClick={handlePrevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white active:scale-90">
                                <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button onClick={handleNextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white active:scale-90">
                                <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </div>

                        {/* Náhledy jako volba motivu */}
                        <div className="mt-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                {product.requiredPhotos === 0 || designMode === 'motif' ? '1. Vyberte si motiv z galerie' : 'Detaily produktu'}
                            </h3>
                            <div className="grid grid-cols-5 gap-2.5">
                                {allMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveMedia(media);
                                            if (isWedding || isPregnancy) setDesignMode('motif');
                                        }}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeMedia === media ? 'border-brand-purple ring-4 ring-brand-purple/10 scale-95' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={optimizeCloudinaryUrl(media, 200)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PRAVÁ STRANA: Konfigurátor */}
                    <div className="mt-10 lg:mt-0">
                        <div className="flex flex-col border-b border-gray-100 pb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                            <div className="mt-4 flex items-center justify-between bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                <div>
                                    <p className="text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Doprava od 88 Kč</p>
                                </div>
                                <div className="text-right">
                                    <span className="flex items-center text-green-600 font-black text-xs uppercase tracking-widest">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span> Skladem
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-8">
                            
                            {/* Volba varianty / Rozměru */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Vyberte rozměr / Balení</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all relative group ${selectedVariant?.id === v.id ? 'bg-brand-purple/5 border-brand-purple shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-sm font-black uppercase ${selectedVariant?.id === v.id ? 'text-brand-purple' : 'text-gray-700'}`}>{v.name}</span>
                                                    {v.id === 'a6' && isWedding && <span className="text-[9px] text-brand-purple font-black uppercase tracking-tighter bg-brand-purple/10 px-1.5 py-0.5 rounded">Běžný formát</span>}
                                                </div>
                                                {v.price && <span className="text-xs font-bold text-gray-400 mt-1">{formatPrice(v.price)} Kč</span>}
                                                {v.itemCount && v.itemCount > 1 && <span className="text-[10px] text-brand-pink font-black uppercase mt-1">Balení {v.itemCount} ks</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Volba designu (pro Svatby/Těhotenství) */}
                            {(isWedding || isPregnancy) && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Způsob návrhu</h3>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-100 p-1 rounded-2xl">
                                        <button onClick={() => setDesignMode('motif')} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${designMode === 'motif' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}>Použít náš motiv</button>
                                        <button onClick={() => setDesignMode('custom')} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${designMode === 'custom' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}>Vlastní design / fotka</button>
                                    </div>
                                </div>
                            )}

                            {/* Nahrávání fotek */}
                            {(designMode === 'custom' || product.requiredPhotos > 0) && (
                                <div className="pt-2">
                                    <FileUpload 
                                        onUploadComplete={handleUploadComplete} 
                                        requiredCount={selectedVariant?.photoCount || product.requiredPhotos}
                                        productName={product.name}
                                        onUploadingChange={setUploading}
                                        labelHint={isPregnancy ? "(např. ultrazvuk)" : undefined}
                                    />
                                </div>
                            )}

                            {/* Textová pole */}
                            {product.hasTextFields && (
                                <div className="pt-2 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Doplnění textů na magnetku</h3>
                                    <div className="space-y-3 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Hlavní nápis</label>
                                            <input name="text1" placeholder="Např.: Budeme se brát!" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-bold" onChange={handleTextChange} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Jména / Kdo oznamuje</label>
                                            <input name="text2" placeholder="Adriana & Michal" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-bold" onChange={handleTextChange} />
                                        </div>
                                        {isWedding && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Datum</label>
                                                        <input name="text3" placeholder="24. 8. 2024" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-bold" onChange={handleTextChange} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Místo</label>
                                                        <input name="text4" placeholder="Zámek Sychrov" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-bold" onChange={handleTextChange} />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Speciální přání</label>
                                            <textarea name="comment" placeholder="Změna písma, barvy nebo jiné přání..." rows={2} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-bold resize-none" onChange={handleTextChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Košík */}
                            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-2xl w-max">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 bg-white shadow rounded-xl flex items-center justify-center text-lg font-black" disabled={quantity <= 1}>−</button>
                                    <span className="text-xl font-black min-w-[3rem] text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-11 bg-white shadow rounded-xl flex items-center justify-center text-lg font-black">+</button>
                                </div>

                                <button 
                                    onClick={handleAddToCart} disabled={isAdded || uploading}
                                    className={`flex-grow py-4.5 rounded-2xl text-white font-black text-lg transition-all relative overflow-hidden group ${isAdded ? 'bg-green-500' : 'bg-gradient-to-r from-brand-pink to-brand-orange shadow-lg transform hover:-translate-y-1 active:scale-95 disabled:grayscale'}`}
                                >
                                    {uploading ? 'NAHRÁVÁNÍ...' : isAdded ? '✓ PŘIDÁNO' : 'VLOŽIT DO KOŠÍKU'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
