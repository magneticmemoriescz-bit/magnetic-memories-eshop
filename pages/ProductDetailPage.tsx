
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem } from '../types';
import { FileUpload, UploadedFilesInfo } from '../components/FileUpload';
import { formatPrice } from '../utils/format';
import { Seo } from '../components/Seo';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ photos: [], groupId: null });
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    // State for Wedding Announcement size toggle
    const [announcementSize, setAnnouncementSize] = useState<'a5' | 'a6'>('a5');


    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setCustomText({});
            // Reset to A5 default
            setAnnouncementSize('a5');
            
            // Logic to pick the correct initial variant based on product type
            if (currentProduct.id === 'wedding-announcement' && currentProduct.variants) {
                // Default to A5 for wedding announcements
                const initialVariant = currentProduct.variants.find(v => v.id.startsWith('a5'));
                setSelectedVariant(initialVariant || currentProduct.variants[0]);
            } else if (currentProduct.id === 'magnetic-calendar' && currentProduct.variants) {
                // Default to A5 for calendar as requested
                const a5Variant = currentProduct.variants.find(v => v.id === 'a5');
                setSelectedVariant(a5Variant || currentProduct.variants[0]);
            } else {
                setSelectedVariant(currentProduct.variants?.[0]);
            }
            
            setQuantity(1);
            setError(null);
        }
    }, [id, products]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const isWeddingAnnouncement = product.id === 'wedding-announcement';
    const isPhotomagnets = product.id === 'photomagnets';
    const isCalendar = product.id === 'magnetic-calendar';

    // Specific logic for Photomagnets: 
    // If it's photomagnets, the required photos = variant.photoCount * quantity.
    // For other products (like calendars, or wedding announcements packs), it behaves differently (usually copies).
    const basePhotoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const totalRequiredPhotos = isPhotomagnets ? basePhotoCount * quantity : basePhotoCount;

    const displayPrice = selectedVariant?.price ?? product.price;

    
    // Prioritize variant-specific image if available, otherwise fallback to main image
    const variantImage = selectedVariant?.imageUrl;
    const displayImage = variantImage ? variantImage : product.imageUrl;
      
    const displayGallery = product.gallery;

    const handleFilesChange = (filesInfo: UploadedFilesInfo) => {
        setUploadedPhotoInfo(filesInfo);
        if (filesInfo.photos.length === totalRequiredPhotos) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        if (uploadedPhotoInfo.photos.length !== totalRequiredPhotos) {
            setError(`Prosím, nahrajte přesně ${totalRequiredPhotos} fotografií.`);
            return;
        }

        setError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${Date.now()}`,
            product,
            quantity: quantity,
            price: displayPrice,
            variant: selectedVariant,
            photos: uploadedPhotoInfo.photos,
            photoGroupId: uploadedPhotoInfo.groupId,
            customText,
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        navigate('/kosik');
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomText(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setUploadedPhotoInfo({ photos: [], groupId: null });
        setError(null);
    }
    
    const handleAnnouncementSizeChange = (size: 'a5' | 'a6') => {
        setAnnouncementSize(size);
        if (selectedVariant) {
            // Try to find the matching quantity in the new size
            const suffix = selectedVariant.id.replace('a5-', '').replace('a6-', '');
            const newVariantId = `${size}-${suffix}`;
            const newVariant = product.variants?.find(v => v.id === newVariantId);
            
            if (newVariant) {
                setSelectedVariant(newVariant);
            } else {
                // Fallback to first variant of that size
                const firstOfSize = product.variants?.find(v => v.id.startsWith(size));
                if (firstOfSize) setSelectedVariant(firstOfSize);
            }
        }
    };
    
    // Filtering variants for display
    let visibleVariants = product.variants;
    if (isWeddingAnnouncement && product.variants) {
        visibleVariants = product.variants.filter(v => v.id.startsWith(announcementSize));
    }

    const imageClass = isCalendar
        ? "w-full h-full object-center object-contain sm:rounded-lg"   // Don't crop calendar
        : "w-full h-full object-center object-cover sm:rounded-lg";    // Crop/zoom others (including wedding announcement)

    // Dynamic Title construction: Product Name - Variant Name (if selected and different)
    const pageTitle = selectedVariant && selectedVariant.name !== product.name 
        ? `${product.name} - ${selectedVariant.name} | Magnetic Memories`
        : `${product.name} | Magnetic Memories`;

    return (
        <div className="bg-white">
            <Seo 
                title={pageTitle}
                description={product.shortDescription}
                image={displayImage}
                type="product"
                price={displayPrice}
                availability="InStock"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Image gallery */}
                    <div className="lg:col-span-7">
                        <img src={displayImage} alt={product.name} className={imageClass} />
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:col-span-5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-dark-gray">{product.name}</h1>
                        <div className="mt-3">
                            <p className="text-3xl text-dark-gray">{formatPrice(displayPrice)} Kč</p>
                        </div>
                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
                            
                            {/* Wedding Announcement Size Toggle */}
                            {isWeddingAnnouncement && (
                                <div className="mt-8 pb-4 border-b border-gray-200">
                                    <h3 className="text-sm text-dark-gray font-medium mb-3">Velikost oznámení</h3>
                                    <div className="flex space-x-4">
                                        <button 
                                            type="button"
                                            onClick={() => handleAnnouncementSizeChange('a5')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md border ${announcementSize === 'a5' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            A5 (15 x 21 cm)
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleAnnouncementSizeChange('a6')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md border ${announcementSize === 'a6' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            A6 (10 x 15 cm)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {visibleVariants && (
                                <div className="mt-10">
                                    <h3 className="text-sm text-dark-gray font-medium">Varianta</h3>
                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Vyberte variantu</legend>
                                        <div className="flex items-center space-x-4 flex-wrap gap-y-4">
                                            {visibleVariants.map((variant) => (
                                                <label key={variant.id} className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium uppercase cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple ${selectedVariant?.id === variant.id ? 'bg-brand-purple border-transparent text-white hover:opacity-90' : 'bg-white border-gray-200 text-dark-gray hover:bg-gray-50'}`}>
                                                    <input type="radio" name="variant-option" value={variant.id} className="sr-only" checked={selectedVariant?.id === variant.id} onChange={() => handleVariantChange(variant)}/>
                                                    <span>{variant.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    {isPhotomagnets && (
                                        <p className="text-sm text-gray-500 mt-2">Vaše fotografie upravíme do vybraného formátu.</p>
                                    )}
                                </div>
                            )}

                            {isCalendar && (
                                <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <p>Kalendář a jednotlivé jeho listy uzpůsobíme vašim fotografiím, můžete tak kombinovat fotografie na výšku i na šířku.</p>
                                </div>
                            )}

                            {product.hasTextFields && (
                                <div className="mt-10 space-y-4">
                                     <h3 className="text-sm text-dark-gray font-medium">Detaily oznámení</h3>
                                     <input type="text" name="names" placeholder="Jména snoubenců" onChange={handleTextChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                     <input type="text" name="date" placeholder="Datum" onChange={handleTextChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                     <input type="text" name="place" placeholder="Místo" onChange={handleTextChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                     <input type="text" name="time" placeholder="Čas" onChange={handleTextChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                     <input type="text" name="rsvp" placeholder="RSVP kontakty" onChange={handleTextChange} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                </div>
                            )}
                            
                            <div className="mt-10">
                                <h3 className="text-sm text-dark-gray font-medium">Počet kusů</h3>
                                <div className="mt-4">
                                    <select
                                        value={quantity}
                                        onChange={(e) => {
                                            setQuantity(Number(e.target.value));
                                        }}
                                        className="mt-1 block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md border bg-white"
                                    >
                                        {[...Array(100)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h3 className="text-sm text-dark-gray font-medium">Nahrajte fotografie</h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    {isPhotomagnets ? `Pro ${quantity} ks magnetek nahrajte ${totalRequiredPhotos} fotografií.` : `Požadovaný počet fotografií: ${totalRequiredPhotos}.`}
                                </p>
                                <div className="mt-4">
                                    <FileUpload 
                                        maxFiles={totalRequiredPhotos} 
                                        onFilesChange={handleFilesChange} 
                                        uploadedFilesInfo={uploadedPhotoInfo}
                                        isReorderable={isCalendar}
                                    />
                                </div>
                            </div>

                            <div className="mt-10">
                                {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
                                <button type="button" onClick={handleAddToCart} className="w-full bg-brand-pink border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink">
                                    Přidat do košíku
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
