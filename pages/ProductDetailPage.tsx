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
    
    // Deduplikace galerie pro zamezení opakování první fotky
    const allMedia = useMemo(() => {
        if (!product) return [];
        const combined = [product.imageUrl, ...product.gallery];
        return Array.from(new Set(combined));
    }, [product]);

    // Inicializace varianty a hlavního média
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

    // Automatické přepnutí motivu při výběru varianty (pokud má varianta vlastní fotku)
    useEffect(() => {
        if (selectedVariant?.imageUrl) {
            setActiveMedia(selectedVariant.imageUrl);
        }
    }, [selectedVariant]);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Produkt nenalezen.</div>;
    }

    const currentUnitPrice = selectedVariant?.price || product.price;
    const basePriceTotal = currentUnitPrice * quantity;
    
    const handleUploadComplete = (photos: UploadedPhoto[], groupId: string | null) => {
        setFinalPhotos(photos);
        setPhotoGroupId(groupId);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomText(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = () => {
        // Pokud produkt vyžaduje fotky a žádné nejsou nahrané
        if (product.requiredPhotos > 0 && finalPhotos.length === 0) {
            alert('Prosím nahrajte nejdříve své fotografie.');
            return;
        }

        // Pokud jde o produkt bez nahrávání (motivy), přiložíme vybraný motiv jako "fotku"
        let cartPhotos = finalPhotos;
        if (product.requiredPhotos === 0 && activeMedia) {
            cartPhotos = [{ url: activeMedia, name: 'Vybraný motiv' }];
        }

        trackAddToCart(product, selectedVariant, quantity, currentUnitPrice);

        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id || 'default'}-${Date.now()}`,
            product, 
            quantity, 
            price: currentUnitPrice, 
            variant: selectedVariant, 
            photos: cartPhotos,
            photoGroupId: photoGroupId,
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
                type="product"
                price={basePriceTotal}
                availability="InStock"
            />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    
                    {/* LEVÁ STRANA: Galerie a náhled */}
                    <div className="flex flex-col">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-inner border border-gray-100 relative group">
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
                                    alt={product.name} 
                                    className="w-full h-full object-center object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}
                            
                            {/* Odznáčky na fotce */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                                <span className="bg-white/95 backdrop-blur-sm text-brand-purple text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-brand-purple/10">
                                    TOP KVALITA
                                </span>
                                {product.requiredPhotos > 0 && (
                                    <span className="bg-brand-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                                        VAŠE FOTKY
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Náhledy / Výběr motivu */}
                        <div className="mt-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                {product.requiredPhotos === 0 ? '1. Vyberte si motiv' : 'Galerie produktu'}
                            </h3>
                            <div className="grid grid-cols-5 gap-2.5">
                                {allMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(media)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeMedia === media ? 'border-brand-purple ring-4 ring-brand-purple/10 scale-95 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        {isVideo(media) ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                                            </div>
                                        ) : (
                                            <img src={optimizeCloudinaryUrl(media, 200)} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PRAVÁ STRANA: Konfigurátor */}
                    <div className="mt-10 lg:mt-0">
                        <div className="flex flex-col border-b border-gray-100 pb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                            <div className="mt-4 flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Včetně DPH, bez dopravy</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-green-600 font-black text-xs uppercase tracking-widest">
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                        Skladem
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Odesíláme do 3-5 dnů</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-8">
                            <p className="text-gray-600 leading-relaxed text-base italic">{product.shortDescription}</p>
                            
                            {/* KROK 2: Výběr varianty / Velikosti */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                        {product.requiredPhotos === 0 ? '2. Vyberte rozměr' : '1. Vyberte rozměr / balení'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedVariant?.id === v.id ? 'bg-brand-purple/5 border-brand-purple shadow-[0_8px_20px_rgba(141,126,239,0.15)]' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <span className={`text-sm font-black uppercase tracking-wide ${selectedVariant?.id === v.id ? 'text-brand-purple' : 'text-gray-700'}`}>
                                                    {v.name}
                                                </span>
                                                {v.price && (
                                                    <span className="text-xs font-bold text-gray-400 mt-1 group-hover:text-gray-500 transition-colors">
                                                        {formatPrice(v.price)} Kč / balení
                                                    </span>
                                                )}
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

                            {/* KROK 3: Nahrávání fotek (pokud jsou vyžadovány) */}
                            {product.requiredPhotos > 0 && (
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                                        2. Nahrajte své fotografie
                                    </h3>
                                    <FileUpload 
                                        onUploadComplete={handleUploadComplete} 
                                        requiredCount={selectedVariant?.photoCount || product.requiredPhotos}
                                        productName={product.name}
                                        onUploadingChange={setUploading}
                                    />
                                </div>
                            )}

                            {/* KROK 4: Textová pole */}
                            {product.hasTextFields && (
                                <div className="pt-2 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        {product.requiredPhotos === 0 ? '3. Doplnění textu' : '3. Doplnění textu'}
                                    </h3>
                                    <div className="space-y-3 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Hlavní nápis</label>
                                            <input 
                                                name="text1" 
                                                placeholder="Např.: Budeme se brát!" 
                                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all placeholder-gray-300 text-sm font-bold"
                                                onChange={handleTextChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">
                                                {product.id === 'wedding-announcement' ? 'Jména snoubenců' : 'Datum / Období'}
                                            </label>
                                            <input 
                                                name="text2" 
                                                placeholder={product.id === 'wedding-announcement' ? 'Adriana & Michal' : 'Léto 2024'}
                                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all placeholder-gray-300 text-sm font-bold"
                                                onChange={handleTextChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand-purple uppercase ml-1">Speciální přání</label>
                                            <textarea 
                                                name="comment" 
                                                placeholder="Chcete jiný font? Nebo jinou barvu textu? Napište nám..." 
                                                rows={2}
                                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all placeholder-gray-300 text-sm font-bold resize-none"
                                                onChange={handleTextChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FINÁLNÍ AKCE: Počet a Košík */}
                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-2xl w-max shadow-inner">
                                        <button 
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                            className="w-11 h-11 bg-white shadow-md rounded-xl flex items-center justify-center text-lg font-black hover:text-brand-pink transition-all active:scale-90 disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="text-xl font-black min-w-[3rem] text-center text-gray-800">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(q => q + 1)} 
                                            className="w-11 h-11 bg-white shadow-md rounded-xl flex items-center justify-center text-lg font-black hover:text-brand-pink transition-all active:scale-90"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={isAdded || uploading}
                                        className={`flex-grow py-4.5 px-8 rounded-2xl text-white font-black text-lg shadow-[0_15px_30px_-5px_rgba(234,92,157,0.3)] transition-all relative overflow-hidden group ${isAdded ? 'bg-green-500 shadow-[0_15px_30px_-5px_rgba(34,197,94,0.3)]' : 'bg-gradient-to-r from-brand-pink to-brand-orange hover:shadow-[0_20px_40px_-5px_rgba(234,92,157,0.5)] transform hover:-translate-y-1 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:transform-none'}`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            {uploading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    NAHRÁVÁNÍ...
                                                </>
                                            ) : isAdded ? '✓ PŘIDÁNO DO KOŠÍKU' : 'VLOŽIT DO KOŠÍKU'}
                                        </span>
                                        {!isAdded && !uploading && (
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="mt-6 p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-brand-purple mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                    <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest">
                                        Doprava zdarma nad 800 Kč
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sekce s popisem produktu níže */}
                <div className="mt-16 pt-16 border-t border-gray-100">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">O produktu</h2>
                        <div className="prose prose-brand text-gray-600 leading-relaxed text-lg">
                            {product.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
