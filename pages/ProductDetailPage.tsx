import React, { useState, useEffect } from 'react';
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

    // Když se změní varianta a má vlastní obrázek, přepneme hlavní náhled (motivy)
    useEffect(() => {
        if (selectedVariant?.imageUrl) {
            setActiveMedia(selectedVariant.imageUrl);
        }
    }, [selectedVariant]);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Produkt nenalezen.</div>;
    }

    const basePriceTotal = (selectedVariant?.price || product.price) * quantity;
    
    const handleUploadComplete = (photos: UploadedPhoto[], groupId: string | null) => {
        setFinalPhotos(photos);
        setPhotoGroupId(groupId);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomText(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = () => {
        if (product.requiredPhotos > 0 && finalPhotos.length === 0) {
            alert('Prosím nahrajte nejdříve své fotografie.');
            return;
        }

        trackAddToCart(product, selectedVariant, quantity, basePriceTotal / quantity);

        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id || 'default'}-${Date.now()}`,
            product, 
            quantity, 
            price: (selectedVariant?.price || product.price), 
            variant: selectedVariant, 
            photos: finalPhotos,
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
                    
                    {/* Media Gallery Section */}
                    <div className="flex flex-col">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 relative group">
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
                                    className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className="bg-white/90 backdrop-blur-sm text-brand-purple text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-widest border border-brand-purple/10">
                                    Ruční výroba
                                </span>
                                {product.requiredPhotos > 0 && (
                                    <span className="bg-brand-pink text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-widest">
                                        Vlastní fotky
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {[product.imageUrl, ...product.gallery].map((media, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveMedia(media)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeMedia === media ? 'border-brand-purple ring-2 ring-brand-purple/20' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    {isVideo(media) ? (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                                        </div>
                                    ) : (
                                        <img src={optimizeCloudinaryUrl(media, 200)} alt="" className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="mt-10 lg:mt-0">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{product.name}</h1>
                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider">Skladem</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                            
                            {/* Variants Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Vyberte si variantu</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedVariant?.id === v.id ? 'bg-brand-purple/5 border-brand-purple shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <span className={`text-sm font-bold ${selectedVariant?.id === v.id ? 'text-brand-purple' : 'text-gray-700'}`}>{v.name}</span>
                                                {v.price && <span className="text-xs text-gray-500 mt-1">{formatPrice(v.price)} Kč / ks</span>}
                                                {selectedVariant?.id === v.id && (
                                                    <div className="absolute -right-1 -bottom-1 bg-brand-purple text-white p-1 rounded-tl-lg">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Text Fields */}
                            {product.hasTextFields && (
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Texty na magnetku</h3>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input 
                                                name="text1" 
                                                placeholder="Hlavní nápis (např. Budeme se brát!)" 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-purple focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                                onChange={handleTextChange}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input 
                                                name="text2" 
                                                placeholder={product.id === 'wedding-announcement' ? 'Vaše jména' : 'Datum / Období'}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-purple focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                                onChange={handleTextChange}
                                            />
                                        </div>
                                        <textarea 
                                            name="comment" 
                                            placeholder="Vaše poznámka nebo speciální přání k textu..." 
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-purple focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-medium resize-none"
                                            onChange={handleTextChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* File Upload Component */}
                            <div className="pt-2">
                                <FileUpload 
                                    onUploadComplete={handleUploadComplete} 
                                    requiredCount={selectedVariant?.photoCount || product.requiredPhotos}
                                    productName={product.name}
                                    onUploadingChange={setUploading}
                                />
                            </div>

                            {/* Quantity and CTA */}
                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div className="flex items-center space-x-4 bg-gray-100 p-1.5 rounded-2xl w-max">
                                        <button 
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                            className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-lg font-black hover:text-brand-pink transition-colors disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="text-xl font-black min-w-[2rem] text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(q => q + 1)} 
                                            className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-lg font-black hover:text-brand-pink transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={isAdded || uploading}
                                        className={`flex-grow py-4 px-8 rounded-2xl text-white font-black text-lg shadow-xl transition-all relative overflow-hidden group ${isAdded ? 'bg-green-500' : 'bg-gradient-to-r from-brand-pink to-brand-orange hover:opacity-95 transform hover:-translate-y-1 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:transform-none'}`}
                                    >
                                        <span className="relative z-10">
                                            {uploading ? 'NAHRÁVÁNÍ...' : isAdded ? '✓ PŘIDÁNO' : 'VLOŽIT DO KOŠÍKU'}
                                        </span>
                                        {!isAdded && !uploading && (
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                                        )}
                                    </button>
                                </div>
                                
                                <p className="mt-4 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                    Doprava zdarma při nákupu nad 800 Kč
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
