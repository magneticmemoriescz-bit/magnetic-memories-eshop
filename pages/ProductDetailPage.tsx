import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Product, ProductVariant, CartItem, UploadedPhoto } from '../types';
import { Seo } from '../components/Seo';
import { formatPrice } from '../utils/format';
import { trackAddToCart } from '../utils/gtag';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products } = useProducts();
    const { dispatch } = useCart();

    const product = products.find(p => p.id === id);

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [finalPhotos, setFinalPhotos] = useState<UploadedPhoto[]>([]);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [directMailing, setDirectMailing] = useState(false);
    
    const [uploadedPhotoInfo] = useState({ groupId: null as string | null });
    const [selectedTheme] = useState({ id: 'default' });
    const [designSource] = useState('theme');

    useEffect(() => {
        if (product && !selectedVariant && product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold">Produkt nenalezen.</div>;
    }

    const isInLoveMagnets = product.id === 'in-love-magnets';
    const isWeddingAnnouncement = product.id === 'wedding-announcement';
    const isAnyAnnouncement = product.id.toLowerCase().includes('announcement');
    const reqMax = product.requiredPhotos;
    const basePriceTotal = (selectedVariant?.price || product.price) * quantity;

    // Optimalizace hlavního obrázku pro mobil (600px) a desktop (1200px)
    const optimizedMainImage = optimizeCloudinaryUrl(product.imageUrl, window.innerWidth < 768 ? 600 : 1200);

    const handleAddToCart = () => {
        trackAddToCart(product, selectedVariant, quantity, basePriceTotal / quantity);

        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${Date.now()}`,
            product, 
            quantity, 
            price: basePriceTotal / quantity, 
            variant: selectedVariant, 
            photos: finalPhotos,
            photoGroupId: (isInLoveMagnets || (isWeddingAnnouncement && designSource === 'theme' && reqMax === 0)) ? `theme-${selectedTheme.id}` : uploadedPhotoInfo.groupId,
            customText, 
            directMailing: isAnyAnnouncement ? directMailing : undefined,
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
                            /* @ts-ignore - fetchpriority is a valid experimental attribute */
                            fetchpriority="high"
                            decoding="async"
                        />
                    </div>

                    {/* Product Details */}
                    <div className="mt-10 lg:mt-0">
                        <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
                        <p className="mt-4 text-3xl text-brand-pink font-black">{formatPrice(basePriceTotal)} Kč</p>
                        
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Vyberte velikost</h3>
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

                            <div className="mb-10">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Množství</h3>
                                <div className="flex items-center space-x-6 bg-gray-50 w-max p-2 rounded-2xl">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:text-brand-pink transition-colors">-</button>
                                    <span className="text-2xl font-black min-w-[2.5rem] text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:text-brand-pink transition-colors">+</button>
                                </div>
                            </div>

                            <button 
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl transition-all ${isAdded ? 'bg-green-500' : 'bg-gradient-to-r from-brand-pink to-brand-orange hover:opacity-90 transform hover:-translate-y-1 active:scale-95'}`}
                            >
                                {isAdded ? '✓ PŘIDÁNO DO KOŠÍKU' : 'VYTVOŘIT A KOUPIT'}
                            </button>
                            
                            <div className="mt-6 flex items-center justify-center space-x-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center"><svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg> Zabezpečené nahrávání</span>
                                <span className="flex items-center"><svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/></svg> Fotky po výrobě mažeme</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
