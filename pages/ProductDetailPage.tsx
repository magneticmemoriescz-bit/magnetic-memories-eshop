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

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products } = useProducts();
    const { dispatch } = useCart();

    const product = products.find(p => p.id === id);

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    // Added uploading state to fix the error and manage button state
    const [uploading, setUploading] = useState(false);
    const [finalPhotos, setFinalPhotos] = useState<UploadedPhoto[]>([]);
    const [photoGroupId, setPhotoGroupId] = useState<string | null>(null);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    
    useEffect(() => {
        if (product && !selectedVariant && product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold">Produkt nenalezen.</div>;
    }

    const basePriceTotal = (selectedVariant?.price || product.price) * quantity;
    const optimizedMainImage = optimizeCloudinaryUrl(product.imageUrl, window.innerWidth < 768 ? 600 : 1200);

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
            id: `${product.id}-${selectedVariant?.id}-${Date.now()}`,
            product, 
            quantity, 
            price: basePriceTotal / quantity, 
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
                image={optimizedMainImage}
                type="product"
                price={basePriceTotal}
                availability="InStock"
            />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    {/* Media Gallery */}
                    <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                        <img 
                            src={optimizedMainImage} 
                            alt={product.name} 
                            className="w-full h-full object-center object-cover"
                            /* @ts-ignore */
                            fetchpriority="high"
                            decoding="async"
                        />
                    </div>

                    {/* Product Details */}
                    <div className="mt-10 lg:mt-0">
                        <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
                        <p className="mt-4 text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                        <p className="mt-6 text-gray-500 leading-relaxed">{product.description}</p>
                        
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Vyberte variantu</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`px-4 py-4 text-sm font-bold rounded-xl border-2 transition-all ${selectedVariant?.id === v.id ? 'bg-brand-purple text-white border-brand-purple shadow-lg transform scale-[1.02]' : 'bg-white text-gray-600 border-gray-100 hover:border-brand-purple/30'}`}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Text Fields for Announcements */}
                            {product.hasTextFields && (
                                <div className="mb-8 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Texty na produkt</h3>
                                    <input 
                                        name="text1" 
                                        placeholder="Hlavní text (např. Budeme se brát!)" 
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-brand-purple"
                                        onChange={handleTextChange}
                                    />
                                    <input 
                                        name="text2" 
                                        placeholder="Jména / Datum" 
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-brand-purple"
                                        onChange={handleTextChange}
                                    />
                                    <textarea 
                                        name="comment" 
                                        placeholder="Speciální přání nebo poznámka" 
                                        rows={3}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-brand-purple"
                                        onChange={handleTextChange}
                                    />
                                </div>
                            )}

                            {/* Upload Section */}
                            <FileUpload 
                                onUploadComplete={handleUploadComplete} 
                                requiredCount={product.requiredPhotos}
                                productName={product.name}
                                onUploadingChange={setUploading}
                            />

                            <div className="mt-10 mb-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Počet kusů (sad)</h3>
                                <div className="flex items-center space-x-6 bg-gray-50 w-max p-2 rounded-2xl">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:text-brand-pink transition-colors">-</button>
                                    <span className="text-2xl font-black min-w-[2.5rem] text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:text-brand-pink transition-colors">+</button>
                                </div>
                            </div>

                            <button 
                                onClick={handleAddToCart}
                                disabled={isAdded || uploading}
                                className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl transition-all ${isAdded ? 'bg-green-500' : 'bg-gradient-to-r from-brand-pink to-brand-orange hover:opacity-90 transform hover:-translate-y-1 active:scale-95'}`}
                            >
                                {isAdded ? '✓ PŘIDÁNO DO KOŠÍKU' : 'VLOŽIT DO KOŠÍKU'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
