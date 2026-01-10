
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem } from '../types';
import { FileUpload, UploadedFilesInfo } from '../components/FileUpload';
import { formatPrice } from '../utils/format';
import { Seo } from '../components/Seo';

const DIRECT_MAILING_FEE = 100;

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ photos: [], groupId: null });
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [directMailing, setDirectMailing] = useState(false);
    
    // Gallery State
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // State for Wedding Announcement size toggle
    const [announcementSize, setAnnouncementSize] = useState<'a5' | 'a6'>('a5');


    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setCustomText({});
            setAnnouncementSize('a5');
            setDirectMailing(false);
            setActiveImageIndex(0); // Reset gallery index
            
            if (currentProduct.id === 'wedding-announcement' && currentProduct.variants) {
                const initialVariant = currentProduct.variants.find(v => v.id.startsWith('a5'));
                setSelectedVariant(initialVariant || currentProduct.variants[0]);
            } else if (currentProduct.id === 'magnetic-calendar' && currentProduct.variants) {
                const a5Variant = currentProduct.variants.find(v => v.id === 'a5');
                setSelectedVariant(a5Variant || currentProduct.variants[0]);
            } else if (currentProduct.id === 'photomagnets' && currentProduct.variants) {
                const firstSize = currentProduct.variants.find(v => !v.id.startsWith('set-'));
                setSelectedVariant(firstSize || currentProduct.variants[0]);
            } else {
                setSelectedVariant(currentProduct.variants?.[0]);
            }
            
            setQuantity(1);
            setError(null);
        }
    }, [id, products]);

    const isVideo = (url: string) => {
        if (!url) return false;
        const path = url.split(/[?#]/)[0].toLowerCase();
        return path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mov') || path.endsWith('.m4v') || path.endsWith('.ogv');
    };

    // Robust video autoplay handler
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = true;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.debug("Autoplay prevented on Detail:", err);
                });
            }
        }
    }, [activeImageIndex]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const isWeddingAnnouncement = product.id === 'wedding-announcement';
    const isPhotomagnets = product.id === 'photomagnets';
    const isCalendar = product.id === 'magnetic-calendar';

    // Calculate Dynamic Discounts for Photomagnets
    const unitPrice = selectedVariant?.price ?? product.price;
    let basePriceTotal = unitPrice * quantity;
    
    if (isPhotomagnets) {
        if (quantity === 9) basePriceTotal -= 10;
        else if (quantity === 15) basePriceTotal -= 20;
        else if (quantity === 30) basePriceTotal -= 50;
    }
    
    // Calculate total physical pieces for mailing fee
    const itemsInVariant = selectedVariant?.itemCount || 1;
    const totalPhysicalPieces = itemsInVariant * quantity;
    const mailingFeeTotal = isWeddingAnnouncement && directMailing ? (DIRECT_MAILING_FEE * totalPhysicalPieces) : 0;
    
    const displayPriceTotal = basePriceTotal + mailingFeeTotal;

    // Required photos logic
    const basePhotoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const totalRequiredPhotos = isPhotomagnets ? basePhotoCount * quantity : basePhotoCount;

    // Gallery logic
    const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageUrl];
    const currentDisplayImage = galleryImages[activeImageIndex];

    const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

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
            price: basePriceTotal / quantity,
            variant: selectedVariant,
            photos: uploadedPhotoInfo.photos,
            photoGroupId: uploadedPhotoInfo.groupId,
            customText,
            directMailing: isWeddingAnnouncement ? directMailing : undefined,
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
            const suffix = selectedVariant.id.replace('a5-', '').replace('a6-', '');
            const newVariantId = `${size}-${suffix}`;
            const newVariant = product.variants?.find(v => v.id === newVariantId);
            
            if (newVariant) {
                setSelectedVariant(newVariant);
            } else {
                const firstOfSize = product.variants?.find(v => v.id.startsWith(size));
                if (firstOfSize) setSelectedVariant(firstOfSize);
            }
        }
    };
    
    let visibleVariants = product.variants;
    if (isWeddingAnnouncement && product.variants) {
        visibleVariants = product.variants.filter(v => v.id.startsWith(announcementSize));
    }

    const imageClass = "w-full h-full object-center object-contain sm:rounded-lg";

    const pageTitle = selectedVariant && selectedVariant.name !== product.name 
        ? `${product.name} - ${selectedVariant.name} | Magnetic Memories`
        : `${product.name} | Magnetic Memories`;

    return (
        <div className="bg-white">
            <Seo 
                title={pageTitle}
                description={product.shortDescription}
                image={galleryImages[0]}
                type="product"
                price={selectedVariant?.price ?? product.price}
                availability="InStock"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Gallery Section */}
                    <div className="lg:col-span-7 relative group">
                        <div className="bg-gray-50 overflow-hidden sm:rounded-lg h-[600px] sm:h-[850px] flex items-center justify-center relative border border-gray-100 shadow-inner">
                            {isVideo(currentDisplayImage) ? (
                                <video 
                                    ref={videoRef}
                                    key={currentDisplayImage}
                                    src={currentDisplayImage} 
                                    className={imageClass} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline
                                    preload="auto"
                                />
                            ) : (
                                <img 
                                    src={currentDisplayImage} 
                                    alt={product.name} 
                                    className={imageClass} 
                                />
                            )}
                        </div>

                        {/* Navigation Arrows */}
                        {galleryImages.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-dark-gray p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                                    aria-label="Předchozí obrázek"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-dark-gray p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                                    aria-label="Následující obrázek"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                {/* Indicators (Dots) */}
                                <div className="mt-4 flex justify-center space-x-2">
                                    {galleryImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`h-2 w-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-brand-purple w-4' : 'bg-gray-300'}`}
                                            aria-label={`Přejít na obrázek ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:col-span-5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-dark-gray">{product.name}</h1>
                        <div className="mt-3">
                            <p className="text-3xl text-dark-gray">{formatPrice(selectedVariant?.price ?? product.price)} Kč / ks</p>
                        </div>
                        <div className="mt-6">
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
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
                                <div className="mt-10 space-y-6">
                                    <div>
                                        <h3 className="text-sm text-dark-gray font-medium mb-4">
                                            {isPhotomagnets ? 'Vyberte rozměr magnetek' : 'Varianta'}
                                        </h3>
                                        <div className="flex items-center space-x-4 flex-wrap gap-y-4">
                                            {visibleVariants.map((variant) => (
                                                <label key={variant.id} className={`relative border rounded-md px-4 py-2 flex items-center justify-center text-sm font-medium uppercase cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple ${selectedVariant?.id === variant.id ? 'bg-brand-purple border-transparent text-white hover:opacity-90' : 'bg-white border-gray-200 text-dark-gray hover:bg-gray-50'}`}>
                                                    <input type="radio" name="variant-option" value={variant.id} className="sr-only" checked={selectedVariant?.id === variant.id} onChange={() => handleVariantChange(variant)}/>
                                                    <span>{variant.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isWeddingAnnouncement && (
                                <div className="mt-8 p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="direct-mailing"
                                                name="direct-mailing"
                                                type="checkbox"
                                                checked={directMailing}
                                                onChange={(e) => setDirectMailing(e.target.checked)}
                                                className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="direct-mailing" className="font-medium text-gray-700">Přeji si rozeslat oznáné jednotlivé adresy</label>
                                            <p className="text-gray-500">Příplatek 100 Kč / ks (tj. {formatPrice(itemsInVariant * 100)} Kč za balení)</p>
                                            <p className="text-xs text-gray-400 mt-1 italic">V tomto případě nás prosím kontaktujte pro zaslání seznamu adres.</p>
                                        </div>
                                    </div>
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
                            
                            {/* Quantity and Sets Section */}
                            <div className="mt-10 flex flex-col space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                                    <div className="flex-shrink-0">
                                        <h3 className="text-sm text-dark-gray font-medium mb-3">Počet kusů</h3>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md border bg-white"
                                        >
                                            {[...Array(100)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1} ks</option>
                                            ))}
                                        </select>
                                    </div>

                                    {isPhotomagnets && (
                                        <div className="flex-grow">
                                            <h3 className="text-sm text-dark-gray font-medium mb-3">Nebo zvolte zvýhodněnou sadu</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {[9, 15, 30].map((setQty) => {
                                                    const discount = setQty === 9 ? 10 : setQty === 15 ? 20 : 50;
                                                    const setPrice = (unitPrice * setQty) - discount;
                                                    const isActive = quantity === setQty;
                                                    
                                                    return (
                                                        <button
                                                            key={setQty}
                                                            type="button"
                                                            onClick={() => setQuantity(setQty)}
                                                            className={`relative border rounded-md px-3 py-2 flex flex-col items-center justify-center text-xs font-semibold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple ${isActive ? 'bg-brand-pink border-transparent text-white' : 'bg-gray-100 border-gray-200 text-dark-gray hover:bg-gray-200'}`}
                                                        >
                                                            <span>Sada {setQty} ks</span>
                                                            <span className={isActive ? 'text-white/90' : 'text-brand-pink'}>{formatPrice(setPrice)} Kč</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10">
                                <h3 className="text-sm text-dark-gray font-medium">Nahrajte fotografie (celkem {totalRequiredPhotos})</h3>
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
                                <div className="mb-4 text-right">
                                    <p className="text-sm text-gray-500 italic">Celková cena za tuto položku:</p>
                                    <p className="text-2xl font-bold text-dark-gray">{formatPrice(displayPriceTotal)} Kč</p>
                                    {isPhotomagnets && (quantity === 9 || quantity === 15 || quantity === 30) && (
                                        <p className="text-xs text-green-600 font-medium">Uplatněna množstevní sleva</p>
                                    )}
                                </div>
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
