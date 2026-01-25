
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem, UploadedPhoto } from '../types';
import { FileUpload, UploadedFilesInfo } from '../components/FileUpload';
import { formatPrice } from '../utils/format';
import { Seo } from '../components/Seo';
import { isVideo } from '../utils/media';

const DIRECT_MAILING_FEE = 100;

const LOVE_THEMES = [
    { id: 'theme-100-lang', name: '100 jazyků lásky', url: 'https://i.imgur.com/7taClUR.jpg', bgPos: '50% 58%', zoom: '180%' },
    { id: 'theme-need-you', name: 'Potřebuju tě', url: 'https://i.imgur.com/XAXWhjc.jpg', bgPos: '42% 50%', zoom: '180%' },
    { id: 'theme-universe', name: 'Jsi můj vesmír', url: 'https://i.imgur.com/Gvj8548.jpg', bgPos: '50% 58%', zoom: '180%' },
    { id: 'theme-heart', name: 'Srdce', url: 'https://i.imgur.com/TUAxRBE.jpg', bgPos: '50% 58%', zoom: '180%' },
    { id: 'theme-cosmos', name: 'Cosmos', url: 'https://i.imgur.com/sThMnIH.jpg', bgPos: '50% 50%', zoom: '180%' },
    { id: 'theme-message', name: 'Vzkaz', url: 'https://i.imgur.com/5jbjvQv.jpg', bgPos: '50% 50%', zoom: '180%' },
    { id: 'theme-cat', name: 'Kočička', url: 'https://i.imgur.com/0Q0B9tY.jpg', bgPos: '50% 50%', zoom: '180%' },
    { id: 'theme-forever', name: 'Forever', url: 'https://i.imgur.com/2zaZy2p.jpg', bgPos: '50% 58%', zoom: '115%' },
    { id: 'theme-love-sign', name: 'Nápis I love you', url: 'https://i.imgur.com/dAW1KeU.jpg', bgPos: '42% 50%', zoom: '180%' },
    { id: 'theme-love-you', name: 'I love you', url: 'https://i.imgur.com/2nDqxWz.jpg', bgPos: '42% 50%', zoom: '180%' },
    { id: 'theme-cats', name: 'Kočičky', url: 'https://i.imgur.com/MBezi9I.jpg', bgPos: '50% 50%', zoom: '180%' },
    { id: 'theme-puzzle', name: 'Puzzle', url: 'https://i.imgur.com/AwsnHVo.jpg', bgPos: '50% 50%', zoom: '180%' },
    { id: 'theme-bee', name: 'Honey bee mine', url: 'https://i.imgur.com/40rE7KM.jpg', bgPos: '50% 50%', zoom: '180%' },
];

const WEDDING_THEMES = [
    { id: 'wtheme-elegant', name: 'Elegantní', url: 'https://i.imgur.com/IGtS2eZ.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 1, maxPhotos: 1 },
    { id: 'wtheme-polaroid', name: 'Polaroid', url: 'https://i.imgur.com/k7OafeN.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 1, maxPhotos: 1 },
    { id: 'wtheme-magazine', name: 'Obálka časopisu', url: 'https://i.imgur.com/ECKuK8M.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 1, maxPhotos: 1 },
    { id: 'wtheme-film', name: 'Film', url: 'https://i.imgur.com/h6UkoZf.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 3, maxPhotos: 5 },
    { id: 'wtheme-purple-flowers', name: 'Fialové květy', url: 'https://i.imgur.com/ZoBD3cv.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 0, maxPhotos: 0 },
    { id: 'wtheme-white-flowers', name: 'Bílé květy', url: 'https://i.imgur.com/0qVMmVZ.jpg', bgPos: '50% 50%', zoom: '100%', minPhotos: 0, maxPhotos: 0 },
];

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ photos: [], groupId: null });
    const [selectedTheme, setSelectedTheme] = useState<any>(LOVE_THEMES[0]);
    const [designSource, setDesignSource] = useState<'custom' | 'theme'>('custom');
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [directMailing, setDirectMailing] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [announcementSize, setAnnouncementSize] = useState<'a5' | 'a6'>('a6');

    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setAnnouncementSize('a6');
            setDirectMailing(false);
            setActiveImageIndex(0); 
            setIsAdded(false);
            
            if (currentProduct.id === 'wedding-announcement' && currentProduct.variants) {
                const initialVariant = currentProduct.variants.find(v => v.id === 'a6');
                setSelectedVariant(initialVariant || currentProduct.variants[0]);
                setSelectedTheme(WEDDING_THEMES[0]);
                setDesignSource('theme'); 
                setCustomText({
                    'text1': 'Budeme se brát',
                    'text2': 'Eva a Adam',
                    'text3': '1. 1. 2029',
                    'text4': 'Staroměstská radnice, Praha',
                    'comment': '',
                });
            } else if (currentProduct.id === 'pregnancy-announcement' && currentProduct.variants) {
                const initialVariant = currentProduct.variants.find(v => v.id === 'a6');
                setSelectedVariant(initialVariant || currentProduct.variants[0]);
                setDesignSource('custom');
                setCustomText({
                    'text1': 'Budeme tři...',
                    'text2': 'podzim 2026',
                    'comment': '',
                });
            } else if (currentProduct.id === 'magnetic-calendar' && currentProduct.variants) {
                const a5Variant = currentProduct.variants.find(v => v.id === 'a5');
                setSelectedVariant(a5Variant || currentProduct.variants[0]);
                setDesignSource('custom');
            } else if (currentProduct.id === 'photomagnets' && currentProduct.variants) {
                const firstSize = currentProduct.variants.find(v => !v.id.startsWith('set-'));
                setSelectedVariant(firstSize || currentProduct.variants[0]);
                setDesignSource('custom');
            } else if (currentProduct.id === 'in-love-magnets' && currentProduct.variants) {
                const firstSize = currentProduct.variants.find(v => v.id === '5x5');
                setSelectedVariant(firstSize || currentProduct.variants[0]);
                setSelectedTheme(LOVE_THEMES[0]);
                setDesignSource('theme');
            } else {
                setSelectedVariant(currentProduct.variants?.[0]);
                setDesignSource('custom');
            }
            setQuantity(1);
            setError(null);
        }
    }, [id, products]);

    // Reset fotek při změně motivu
    useEffect(() => {
        if (product?.id === 'wedding-announcement' && designSource === 'theme') {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setError(null);
        }
    }, [selectedTheme]);

    if (!product) return <div className="text-center py-20">Produkt nenalezen.</div>;

    const isWeddingAnnouncement = product.id === 'wedding-announcement';
    const isPregnancyAnnouncement = product.id === 'pregnancy-announcement';
    const isPhotomagnets = product.id === 'photomagnets';
    const isCalendar = product.id === 'magnetic-calendar';
    const isInLoveMagnets = product.id === 'in-love-magnets';

    const isAnyAnnouncement = isWeddingAnnouncement || isPregnancyAnnouncement;

    let galleryImages = product.gallery && product.gallery.length > 0 ? [...product.gallery] : [product.imageUrl];
    const handleThemeSelect = (theme: any) => {
        setSelectedTheme(theme);
        const themeIndex = galleryImages.findIndex(img => img === theme.url);
        if (themeIndex !== -1) setActiveImageIndex(themeIndex);
    };

    const currentDisplayImage = galleryImages[activeImageIndex];
    const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    const unitPrice = selectedVariant?.price ?? product.price;
    let basePriceTotal = unitPrice * quantity;
    
    if (isPhotomagnets || isInLoveMagnets) {
        if (quantity === 9) basePriceTotal = (unitPrice * 9) - 20;
        else if (quantity === 15) basePriceTotal = (unitPrice * 14);
        else if (quantity === 30) basePriceTotal = (unitPrice * 28);
    } else if (isAnyAnnouncement) {
        if (announcementSize === 'a6') {
            if (quantity === 10) basePriceTotal = 400;
            else if (quantity === 20) basePriceTotal = 775;
            else if (quantity === 50) basePriceTotal = 1900;
            else if (quantity === 100) basePriceTotal = 3750;
        } else {
            if (quantity === 10) basePriceTotal = 800;
            else if (quantity === 20) basePriceTotal = 1550;
            else if (quantity === 50) basePriceTotal = 3800;
            else if (quantity === 100) basePriceTotal = 7500;
        }
    }
    
    const itemsInVariant = selectedVariant?.itemCount || 1;
    const totalPhysicalPieces = itemsInVariant * quantity;
    const mailingFeeTotal = isAnyAnnouncement && directMailing ? (DIRECT_MAILING_FEE * totalPhysicalPieces) : 0;
    const displayPriceTotal = basePriceTotal + mailingFeeTotal;

    const basePhotoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    
    // Dynamické určení počtu fotek podle vybraného motivu u oznámení
    const totalRequiredPhotos = isAnyAnnouncement 
        ? (designSource === 'custom' ? 1 : (selectedTheme?.maxPhotos || 0))
        : (isPhotomagnets || isCalendar) 
            ? (isCalendar ? basePhotoCount : basePhotoCount * quantity) 
            : 0;

    const handleFilesChange = (filesInfo: UploadedFilesInfo) => {
        setUploadedPhotoInfo(filesInfo);
        
        let min = totalRequiredPhotos;
        let max = totalRequiredPhotos;
        if (isWeddingAnnouncement && designSource === 'theme') {
            min = selectedTheme?.minPhotos || 0;
            max = selectedTheme?.maxPhotos || 0;
        }

        if (filesInfo.photos.length >= min && filesInfo.photos.length <= max) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        let finalPhotos: UploadedPhoto[] = uploadedPhotoInfo.photos;
        
        let reqMin = totalRequiredPhotos;
        let reqMax = totalRequiredPhotos;
        
        if (isWeddingAnnouncement && designSource === 'theme') {
            reqMin = selectedTheme?.minPhotos || 0;
            reqMax = selectedTheme?.maxPhotos || 0;
        }

        // Pokud motiv nevyžaduje fotky, použijeme jen URL motivu
        if (reqMax === 0 && (isInLoveMagnets || (isWeddingAnnouncement && designSource === 'theme'))) {
            finalPhotos = Array(quantity).fill({ url: selectedTheme.url, name: selectedTheme.name });
        } else {
            // Validace počtu nahraných fotek
            if (finalPhotos.length < reqMin || finalPhotos.length > reqMax) {
                const msg = reqMin === reqMax 
                    ? `Prosím, nahrajte ${reqMin === 1 ? '1 fotografii' : `přesně ${reqMin} fotografií`}.`
                    : `Prosím, nahrajte ${reqMin} až ${reqMax} fotografií.`;
                setError(msg);
                return;
            }
        }

        setError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${Date.now()}`,
            product, quantity, price: basePriceTotal / quantity, variant: selectedVariant, photos: finalPhotos,
            photoGroupId: (isInLoveMagnets || (isWeddingAnnouncement && designSource === 'theme' && reqMax === 0)) ? `theme-${selectedTheme.id}` : uploadedPhotoInfo.groupId,
            customText, directMailing: isAnyAnnouncement ? directMailing : undefined,
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setUploadedPhotoInfo({ photos: [], groupId: null });
        setError(null);
    };
    
    const handleAnnouncementSizeChange = (size: 'a5' | 'a6') => {
        setAnnouncementSize(size);
        const newVariant = product.variants?.find(v => v.id === size);
        if (newVariant) setSelectedVariant(newVariant);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomText(prev => ({ ...prev, [name]: value }));
    };
    
    const mediaClass = "w-full h-full object-center object-contain sm:rounded-lg transition-all duration-300";

    return (
        <div className="bg-white">
            <Seo title={`${product.name} | Magnetic Memories`} description={product.shortDescription} image={galleryImages[0]} type="product" price={selectedVariant?.price ?? product.price} availability="InStock" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    <div className="lg:col-span-7 relative group">
                        <div className="bg-gray-50 overflow-hidden sm:rounded-lg h-[600px] sm:h-[850px] flex items-center justify-center relative border border-gray-100 shadow-inner">
                            {isVideo(currentDisplayImage) ? (
                                <video 
                                    key={currentDisplayImage} 
                                    src={currentDisplayImage} 
                                    className={mediaClass} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                    preload="auto" 
                                />
                            ) : (
                                <img key={currentDisplayImage} src={currentDisplayImage} alt={product.name} className={mediaClass} />
                            )}
                            {galleryImages.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.preventDefault(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-dark-gray p-3 rounded-full shadow-lg z-20"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                                    <button onClick={(e) => { e.preventDefault(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-dark-gray p-3 rounded-full shadow-lg z-20"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
                                </>
                            )}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {galleryImages.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-brand-purple ring-2 ring-brand-purple/20 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                    {isVideo(img) ? <div className="w-full h-full bg-black flex items-center justify-center text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg></div> : <img src={img} className="w-full h-full object-cover" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:col-span-5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-dark-gray">{product.name}</h1>
                        
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-brand-purple">{formatPrice(displayPriceTotal)} Kč</span>
                            <span className="text-sm text-gray-500 font-medium tracking-tight">za {quantity} ks {isAnyAnnouncement ? 'oznámení' : 'magnetek'}</span>
                        </div>

                        <div className="mt-6 text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />

                        <form className="mt-8 space-y-10" onSubmit={(e) => e.preventDefault()}>
                            
                            {/* 1. VELIKOST / ROZMĚR */}
                            <div className="pb-4 border-b border-gray-200">
                                <h3 className="text-sm text-dark-gray font-bold mb-3 uppercase tracking-wider">
                                    {isAnyAnnouncement ? '1. Velikost oznámení' : '1. Vyberte rozměr'}
                                </h3>
                                {isAnyAnnouncement ? (
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleAnnouncementSizeChange('a6')} className={`flex-1 py-1.5 px-3 rounded-md border text-[13px] font-bold transition-all ${announcementSize === 'a6' ? 'bg-brand-purple text-white border-brand-purple shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                            A6 (10 x 15 cm)
                                        </button>
                                        <button type="button" onClick={() => handleAnnouncementSizeChange('a5')} className={`flex-1 py-1.5 px-3 rounded-md border text-[13px] font-bold transition-all ${announcementSize === 'a5' ? 'bg-brand-purple text-white border-brand-purple shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                            A5 (15 x 21 cm)
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {product.variants?.map((v) => (
                                            <button key={v.id} type="button" onClick={() => handleVariantChange(v)} className={`px-4 py-2 border rounded-md text-[13px] font-bold uppercase transition-all ${selectedVariant?.id === v.id ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-dark-gray border-gray-200 hover:bg-gray-50'}`}>
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2. POČET KUSŮ A SADY */}
                            <div className="pb-6 border-b border-gray-200">
                                <h3 className="text-sm text-dark-gray font-bold mb-4 uppercase tracking-wider">2. Počet kusů</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-4 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block text-center">Individuální počet</label>
                                            <select 
                                                value={quantity} 
                                                onChange={(e) => setQuantity(Number(e.target.value))} 
                                                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md border bg-white font-bold text-dark-gray shadow-inner"
                                            >
                                                {[...Array(200)].map((_, i) => ( <option key={i + 1} value={i + 1}>{i + 1} ks</option> ))}
                                            </select>
                                        </div>

                                        {(isPhotomagnets || isInLoveMagnets || isAnyAnnouncement) && (
                                            <div className="sm:col-span-8 bg-brand-purple/5 p-3 rounded-lg border border-brand-purple/10 shadow-sm">
                                                <label className="text-[10px] font-bold text-brand-purple uppercase mb-2 block text-center">Zvýhodněné sady</label>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                    {(isPhotomagnets || isInLoveMagnets) ? (
                                                        [9, 15, 30].map((setQty) => {
                                                            let setLabel = `${setQty} ks`;
                                                            let setPrice = unitPrice * setQty;
                                                            if (setQty === 9) setPrice -= 20;
                                                            else if (setQty === 15) { setPrice = unitPrice * 14; setLabel = `14+1`; }
                                                            else if (setQty === 30) { setPrice = unitPrice * 28; setLabel = `28+2`; }
                                                            const isActive = quantity === setQty;
                                                            return (
                                                                <button key={setQty} type="button" onClick={() => setQuantity(setQty)} className={`relative border rounded-md px-1 py-1.5 flex flex-col items-center justify-center min-h-[50px] text-[10px] font-black uppercase transition-all ${isActive ? 'bg-brand-pink border-transparent text-white ring-2 ring-brand-pink ring-offset-1' : 'bg-white border-gray-200 text-dark-gray hover:border-brand-purple'}`}>
                                                                    <span className="text-center leading-tight mb-0.5">{setLabel}</span>
                                                                    <span className={isActive ? 'text-white/90' : 'text-brand-pink'}>{formatPrice(setPrice)} Kč</span>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        [10, 20, 50, 100].map((setQty) => {
                                                            let setPrice = announcementSize === 'a6' 
                                                                ? (setQty === 10 ? 400 : setQty === 20 ? 775 : setQty === 50 ? 1900 : 3750)
                                                                : (setQty === 10 ? 800 : setQty === 20 ? 1550 : setQty === 50 ? 3800 : 7500);
                                                            const isActive = quantity === setQty;
                                                            return (
                                                                <button key={setQty} type="button" onClick={() => setQuantity(setQty)} className={`relative border rounded-md px-1 py-1.5 flex flex-col items-center justify-center min-h-[50px] text-[10px] font-black uppercase transition-all ${isActive ? 'bg-brand-pink border-transparent text-white ring-2 ring-brand-pink ring-offset-1' : 'bg-white border-gray-200 text-dark-gray hover:border-brand-purple'}`}>
                                                                    <span className="text-center leading-tight mb-0.5">{setQty} ks</span>
                                                                    <span className={isActive ? 'text-white/90' : 'text-brand-pink'}>{formatPrice(setPrice)} Kč</span>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {(quantity === 9 || quantity === 15 || quantity === 30 || (isAnyAnnouncement && [10, 20, 50, 100].includes(quantity))) && (
                                        <p className="text-[11px] text-green-600 font-bold uppercase tracking-wide text-center">Množstevní sleva byla uplatněna ✓</p>
                                    )}
                                </div>
                            </div>

                            {/* 3. VÝBĚR MOTIVU / NAHRÁVÁNÍ */}
                            <div className="pb-4 border-b border-gray-200">
                                <h3 className="text-sm text-dark-gray font-bold mb-4 uppercase tracking-wider">3. Výběr motivu a konfigurace</h3>
                                {isWeddingAnnouncement && (
                                    <div className="flex gap-4 mb-6">
                                        <button type="button" onClick={() => setDesignSource('theme')} className={`flex-1 py-3 px-4 rounded-md border font-bold text-sm transition-all ${designSource === 'theme' ? 'bg-brand-purple text-white border-brand-purple shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>Náš motiv</button>
                                        <button type="button" onClick={() => setDesignSource('custom')} className={`flex-1 py-3 px-4 rounded-md border font-bold text-sm transition-all ${designSource === 'custom' ? 'bg-brand-purple text-white border-brand-purple shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>Vlastní motiv</button>
                                    </div>
                                )}
                                
                                {(designSource === 'theme' || isPregnancyAnnouncement) && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {isWeddingAnnouncement && (
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {WEDDING_THEMES.map((theme) => (
                                                    <button key={theme.id} type="button" onClick={() => handleThemeSelect(theme)} className="flex flex-col items-center group">
                                                        <div className={`relative w-full aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedTheme.id === theme.id ? 'border-brand-purple ring-4 ring-brand-purple/10 scale-110' : 'border-gray-100'}`}>
                                                            <div className="w-full h-full bg-cover" style={{ backgroundImage: `url(${theme.url})`, backgroundSize: theme.zoom || '180%', backgroundPosition: theme.bgPos || '50% 50%' }} />
                                                            {selectedTheme.id === theme.id && <div className="absolute inset-0 bg-brand-purple/10 flex items-center justify-center"><div className="bg-brand-purple text-white rounded-full p-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div></div>}
                                                        </div>
                                                        <span className={`mt-1.5 text-[7px] leading-tight font-bold text-center h-4 overflow-hidden w-full ${selectedTheme.id === theme.id ? 'text-brand-purple' : 'text-gray-400'}`}>{theme.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {!isWeddingAnnouncement && isInLoveMagnets && (
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {LOVE_THEMES.map((theme) => (
                                                    <button key={theme.id} type="button" onClick={() => handleThemeSelect(theme)} className="flex flex-col items-center group">
                                                        <div className={`relative w-full aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedTheme.id === theme.id ? 'border-brand-purple ring-4 ring-brand-purple/10 scale-110' : 'border-gray-100'}`}>
                                                            <div className="w-full h-full bg-cover" style={{ backgroundImage: `url(${theme.url})`, backgroundSize: theme.zoom || '180%', backgroundPosition: theme.bgPos || '50% 50%' }} />
                                                            {selectedTheme.id === theme.id && <div className="absolute inset-0 bg-brand-purple/10 flex items-center justify-center"><div className="bg-brand-purple text-white rounded-full p-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div></div>}
                                                        </div>
                                                        <span className={`mt-1.5 text-[7px] leading-tight font-bold text-center h-4 overflow-hidden w-full ${selectedTheme.id === theme.id ? 'text-brand-purple' : 'text-gray-400'}`}>{theme.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {isAnyAnnouncement && (
                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                                                <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest">Doplnění textů na oznámení</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-dark-gray">Hlavní text (např. {isPregnancyAnnouncement ? 'Budeme tři...' : 'Budeme se brát'})</label>
                                                        <input type="text" name="text1" value={customText.text1 || ''} onChange={handleTextChange} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white text-dark-gray focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none shadow-sm font-medium" />
                                                    </div>
                                                    {isWeddingAnnouncement && (
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-dark-gray">Jména snoubenců</label>
                                                            <input type="text" name="text2" value={customText.text2 || ''} onChange={handleTextChange} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white text-dark-gray focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none shadow-sm font-medium" />
                                                        </div>
                                                    )}
                                                    <div className={isWeddingAnnouncement ? "grid grid-cols-2 gap-4" : ""}>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-dark-gray">{isPregnancyAnnouncement ? 'Datum / Období' : 'Datum (případně i čas)'}</label>
                                                            <input type="text" name={isPregnancyAnnouncement ? "text2" : "text3"} value={isPregnancyAnnouncement ? (customText.text2 || '') : (customText.text3 || '')} onChange={handleTextChange} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white text-dark-gray focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none shadow-sm font-medium" />
                                                        </div>
                                                        {isWeddingAnnouncement && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-dark-gray">Místo</label>
                                                                <input type="text" name="text4" value={customText.text4 || ''} onChange={handleTextChange} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white text-dark-gray focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none shadow-sm font-medium" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-dark-gray">Vaše speciální přání</label>
                                                        <textarea 
                                                            name="comment" 
                                                            value={customText.comment || ''} 
                                                            onChange={handleTextChange} 
                                                            rows={2} 
                                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white text-dark-gray focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none shadow-sm font-medium" 
                                                            placeholder="Máte přání na jiný font, jinou barvu textu atd?" 
                                                        />
                                                    </div>
                                                </div>

                                                {/* Nahrávání fotek pro specifické motivy oznámení nebo pro oznámení těhotenství */}
                                                {((isWeddingAnnouncement && designSource === 'theme' && (selectedTheme?.maxPhotos || 0) > 0) || isPregnancyAnnouncement) && (
                                                    <div className="mt-8 pt-8 border-t border-gray-200 animate-in slide-in-from-top-4 duration-500">
                                                        <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest mb-4">Nahrajte fotografie pro toto oznámení</h4>
                                                        <p className="text-[11px] text-gray-500 mb-4 italic">
                                                            {isPregnancyAnnouncement ? 'Nahrajte prosím fotografii ultrazvuku nebo jiný obrázek.' : (selectedTheme.id === 'wtheme-film' 
                                                                ? 'Tento motiv vyžaduje 3 až 5 fotografií.' 
                                                                : 'Tento motiv vyžaduje 1 fotografii.')}
                                                        </p>
                                                        <FileUpload 
                                                            maxFiles={isPregnancyAnnouncement ? 1 : selectedTheme.maxPhotos} 
                                                            onFilesChange={handleFilesChange} 
                                                            uploadedFilesInfo={uploadedPhotoInfo} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {designSource === 'custom' && !isPregnancyAnnouncement && (
                                    <div className="animate-in fade-in duration-300">
                                        <FileUpload maxFiles={totalRequiredPhotos} onFilesChange={handleFilesChange} uploadedFilesInfo={uploadedPhotoInfo} isReorderable={isCalendar} />
                                    </div>
                                )}
                            </div>

                            {/* Upozornění o schválení před 4. sekcí - POUZE PRO SVATEBNÍ OZNÁMENÍ */}
                            {isWeddingAnnouncement && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700 font-bold">
                                                Náhled bude vždy poslán ke schválení před započetím výroby.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. ROZESÍLÁNÍ */}
                            {isAnyAnnouncement && (
                                <div className="pb-4 border-b border-gray-200">
                                    <h3 className="text-sm text-dark-gray font-bold mb-3 uppercase tracking-wider">4. Možnost rozeslání</h3>
                                    <div className="p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-lg shadow-sm">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input id="direct-mailing" type="checkbox" checked={directMailing} onChange={(e) => setDirectMailing(e.target.checked)} className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded" />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="direct-mailing" className="font-medium text-gray-700">Přeji si rozeslat oznámení na jednotlivé adresy</label>
                                                <p className="text-gray-500">Příplatek 100 Kč / ks (tj. {formatPrice(totalPhysicalPieces * 100)} Kč navíc)</p>
                                                <p className="text-xs text-brand-purple mt-2 font-bold italic underline">V tomto případě nám prosím pošlete mailem seznam adres.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                {/* Zobrazení celkové ceny nad tlačítkem */}
                                <div className="mb-4 flex items-baseline justify-center gap-2">
                                    <span className="text-sm text-gray-500 font-bold uppercase tracking-wide">Celkem:</span>
                                    <span className="text-2xl font-black text-brand-purple">{formatPrice(displayPriceTotal)} Kč</span>
                                </div>
                                
                                {error && <p className="text-red-600 text-sm text-center mb-4 font-bold">{error}</p>}
                                <button type="button" onClick={handleAddToCart} className={`w-full border border-transparent rounded-md py-4 px-8 flex items-center justify-center text-lg font-black text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${isAdded ? 'bg-brand-purple scale-105 shadow-xl' : 'bg-brand-pink hover:opacity-90 shadow-lg active:scale-95 focus:ring-brand-pink/50'}`}>
                                    {isAdded ? ( <> <svg className="w-6 h-6 mr-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Přidáno do košíku! </> ) : 'PŘIDAT DO KOŠÍKU'}
                                </button>
                                {isAdded && (
                                    <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2">
                                        <button onClick={() => navigate('/kosik')} className="text-brand-purple font-black text-base hover:underline flex items-center justify-center mx-auto tracking-tight">PŘEJÍT K POKLADNĚ<svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
