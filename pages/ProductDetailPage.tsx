import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem } from '../types';
import { FileUpload, UploadedFilesInfo } from '../components/FileUpload';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ photos: [], groupId: null });
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);


    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setCustomText({});
            setSelectedVariant(currentProduct.variants?.[0]);
            setOrientation('portrait');
            setQuantity(1);
            setError(null);
        }
    }, [id, products]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const photoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const displayPrice = selectedVariant?.price ?? product.price;

    const isCalendar = product.id === 'magnetic-calendar';
    
    // Prioritize variant-specific image if available
    const variantImage = selectedVariant?.imageUrl;

    const displayImage = variantImage ? variantImage : 
        isCalendar ? 
            (orientation === 'portrait' ? product.imageUrl_portrait : product.imageUrl_landscape) || product.imageUrl 
        : product.imageUrl;
      
    const displayGallery = isCalendar
        ? (orientation === 'portrait' ? product.gallery_portrait : product.gallery_landscape) || product.gallery
        : product.gallery;

    const handleFilesChange = (filesInfo: UploadedFilesInfo) => {
        setUploadedPhotoInfo(filesInfo);
        if (filesInfo.photos.length === photoCount) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        if (uploadedPhotoInfo.photos.length !== photoCount) {
            setError(`Prosím, nahrajte přesně ${photoCount} fotografií.`);
            return;
        }

        setError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${isCalendar ? orientation : ''}-${Date.now()}`,
            product,
            quantity: quantity,
            price: displayPrice,
            variant: selectedVariant,
            photos: uploadedPhotoInfo.photos,
            photoGroupId: uploadedPhotoInfo.groupId,
            customText,
            ...(isCalendar && { orientation: orientation })
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
    
    const imageClass = isCalendar
        ? "w-full h-full object-center object-contain sm:rounded-lg"   // Don't crop calendar
        : "w-full h-full object-center object-cover sm:rounded-lg";    // Crop/zoom others (including wedding announcement)


    return (
        <div className="bg-white">
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
                            <p className="text-3xl text-dark-gray">{displayPrice} Kč</p>
                        </div>
                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
                            {product.variants && (
                                <div className="mt-10">
                                    <h3 className="text-sm text-dark-gray font-medium">Varianta</h3>
                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Vyberte variantu</legend>
                                        <div className="flex items-center space-x-4 flex-wrap gap-y-4">
                                            {product.variants.map((variant) => (
                                                <label key={variant.id} className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium uppercase cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple ${selectedVariant?.id === variant.id ? 'bg-brand-purple border-transparent text-white hover:opacity-90' : 'bg-white border-gray-200 text-dark-gray hover:bg-gray-50'}`}>
                                                    <input type="radio" name="variant-option" value={variant.id} className="sr-only" checked={selectedVariant?.id === variant.id} onChange={() => handleVariantChange(variant)}/>
                                                    <span>{variant.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>
                            )}

                            {isCalendar && (
                                <div className="mt-10">
                                    <h3 className="text-sm text-dark-gray font-medium">Orientace</h3>
                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Vyberte orientaci</legend>
                                        <div className="flex items-center space-x-4">
                                            <label className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium uppercase cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple ${orientation === 'portrait' ? 'bg-brand-purple border-transparent text-white hover:opacity-90' : 'bg-white border-gray-200 text-dark-gray hover:bg-gray-50'}`}>
                                                <input type="radio" name="orientation-option" value="portrait" className="sr-only" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} />
                                                <span>Na výšku</span>
                                            </label>
                                            <label className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium uppercase cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple ${orientation === 'landscape' ? 'bg-brand-purple border-transparent text-white hover:opacity-90' : 'bg-white border-gray-200 text-dark-gray hover:bg-gray-50'}`}>
                                                <input type="radio" name="orientation-option" value="landscape" className="sr-only" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} />
                                                <span>Na šířku</span>
                                            </label>
                                        </div>
                                    </fieldset>
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
                                <h3 className="text-sm text-dark-gray font-medium">Nahrajte fotografie</h3>
                                <div className="mt-4">
                                    <FileUpload 
                                        maxFiles={photoCount} 
                                        onFilesChange={handleFilesChange} 
                                        uploadedFilesInfo={uploadedPhotoInfo}
                                        isReorderable={isCalendar}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-10">
                                <h3 className="text-sm text-dark-gray font-medium">Počet kusů</h3>
                                <div className="mt-4 flex items-center border border-gray-300 rounded-md w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 rounded-l-md"
                                        aria-label="Snížit počet kusů"
                                    >
                                        -
                                    </button>
                                    <span className="px-5 py-2 text-center text-dark-gray">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 rounded-r-md"
                                        aria-label="Zvýšit počet kusů"
                                    >
                                        +
                                    </button>
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
