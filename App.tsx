
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Product, ProductVariant, CartItem } from './types';
import { HOW_IT_WORKS_STEPS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FileUpload, UploadedFilesInfo } from './components/FileUpload';
import { Logo } from './components/Logo';

// Tell TypeScript that external library objects exist on the window object
declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        jspdf: any;
    }
}

interface OrderDetails {
    contact: { [key: string]: string };
    shipping: string;
    payment: string;
    packetaPoint: any | null;
    items: CartItem[];
    total: number;
    subtotal: number;
    shippingCost: number;
    paymentCost: number;
    orderNumber: string;
}

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const buttonStyles = [
    { gradient: 'bg-gradient-to-r from-brand-cyan to-brand-purple', focusRing: 'focus:ring-brand-purple/50' },
    { gradient: 'bg-gradient-to-r from-brand-purple to-brand-pink', focusRing: 'focus:ring-brand-pink/50' },
    { gradient: 'bg-gradient-to-r from-brand-pink to-brand-orange', focusRing: 'focus:ring-brand-orange/50' },
];

const HomePage: React.FC = () => {
    const { products } = useProducts();
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-white flex items-center justify-center min-h-screen text-white p-4 sm:p-6 lg:p-8">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover blur-[1px]" src="https://i.imgur.com/xZl1oox.jpeg" alt="Lednice s magnety" />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>

                <div className="absolute top-0 left-0 p-4 sm:p-6 lg:p-8">
                    <Logo className="h-36 sm:h-56 w-auto" />
                </div>

                <div className="relative z-10 max-w-2xl text-center transform translate-y-40">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-normal [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed">
                        Vaše vzpomínky jsou to nejcennější.
                    </h1>
                    <Link to="/produkty" className="mt-8 inline-block bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-purple/50">
                        Prohlédnout produkty
                    </Link>
                </div>
            </section>

            {/* Product Overview Section */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-dark-gray">Naše Produkty</h2>
                    <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                        {products.map((product, index) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                buttonStyle={buttonStyles[index % buttonStyles.length]}
                            />
                        ))}
                    </div>
                </div>
            </section>

             {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-dark-gray">Jak to funguje?</h2>
                    <div className="mt-12 grid md:grid-cols-4 gap-10">
                        {HOW_IT_WORKS_STEPS.map((step, index) => (
                             <div key={index} className="text-center">
                                 <div className={`flex items-center justify-center h-20 w-20 mx-auto rounded-full ${iconColors[index]} text-white`}>
                                     {step.icon}
                                 </div>
                                 <h3 className="mt-6 text-lg font-medium text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-base text-gray-500">{step.description}</p>
                             </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

const ProductsPage: React.FC = () => {
    const { products } = useProducts();
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center">Všechny produkty</h1>
                <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                    {products.map((product, index) => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            buttonStyle={buttonStyles[index % buttonStyles.length]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ urls: [], groupId: null });
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);


    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ urls: [], groupId: null });
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
        if (filesInfo.urls.length === photoCount) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        if (uploadedPhotoInfo.urls.length !== photoCount) {
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
            photos: uploadedPhotoInfo.urls,
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
        setUploadedPhotoInfo({ urls: [], groupId: null });
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

const HowItWorksPage: React.FC = () => {
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-brand-purple tracking-wide uppercase">Jak to funguje</h2>
                    <p className="mt-1 text-4xl font-extrabold text-dark-gray sm:text-5xl sm:tracking-tight lg:text-6xl">Vytvořte si své vzpomínky ve 4 krocích</p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Celý proces od výběru po objednávku je rychlý a jednoduchý.</p>
                </div>
                <div className="mt-20 grid md:grid-cols-2 gap-16">
                    {HOW_IT_WORKS_STEPS.map((step, index) => (
                         <div key={index} className="flex space-x-6">
                             <div className={`flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full ${iconColors[index]} text-white`}>
                                 {step.icon}
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-base text-gray-500">{step.description}</p>
                             </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ContactPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        if (!formRef.current) {
            console.error("Form reference is not available.");
            setStatus('error');
            return;
        }

        window.emailjs.sendForm('service_2pkoish', 'template_ajmxwjd', formRef.current)
            .then(() => {
                setStatus('success');
            }, (error: any) => {
                console.error('FAILED to send contact form:', error);
                setErrorMessage(`Odeslání zprávy se nezdařilo: ${error.text || 'Zkuste to prosím znovu.'}`);
                setStatus('error');
            });
    };

    const inputStyles = "py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-brand-purple/20 bg-brand-purple/10 rounded-md placeholder-gray-500";
    
    return (
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-dark-gray sm:text-4xl">Kontaktujte nás</h2>
                    <p className="mt-4 text-lg leading-6 text-gray-500">Máte dotaz nebo speciální přání? Neváhejte se na nás obrátit.</p>
                </div>
                <div className="mt-12">
                    {status === 'success' ? (
                         <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-2xl font-semibold text-dark-gray">Děkujeme!</h3>
                            <p className="mt-2 text-gray-600">Vaše zpráva byla odeslána. Ozveme se vám co nejdříve.</p>
                        </div>
                    ) : (
                        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Jméno</label>
                                <div className="mt-1"><input type="text" name="first_name" id="first_name" autoComplete="given-name" className={inputStyles} required /></div>
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                <div className="mt-1"><input type="text" name="last_name" id="last_name" autoComplete="family-name" className={inputStyles} required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1"><input id="email" name="email" type="email" autoComplete="email" className={inputStyles} required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Zpráva</label>
                                <div className="mt-1"><textarea id="message" name="message" rows={4} className={inputStyles} required></textarea></div>
                            </div>
                            <div className="sm:col-span-2">
                                {status === 'error' && <p className="text-red-600 text-sm text-center mb-4">{errorMessage}</p>}
                                <button type="submit" disabled={status === 'sending'} className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-pink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-50">
                                    {status === 'sending' ? 'Odesílám...' : 'Odeslat zprávu'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ name, label, error, value, onChange, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            id={name} 
            name={name} 
            {...props} 
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm placeholder-gray-500 ${error ? 'border-red-500 bg-red-50' : 'border-brand-purple/20 bg-brand-purple/10'}`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const { items } = state;
    const [submittedOrder, setSubmittedOrder] = useState<OrderDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        zip: '',
        additionalInfo: '',
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const shippingCosts: { [key: string]: number } = {
        'zasilkovna': 72,
        'posta': 119,
        'osobne': 0
    };
    const paymentCosts: { [key: string]: number } = {
        'prevodem': 0,
        'dobirka': 20
    };

    const shippingCost = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const paymentCost = paymentMethod ? paymentCosts[paymentMethod] : 0;
    const total = subtotal + shippingCost + paymentCost;
    
    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    };

    const openPacketaWidget = () => {
        const PACKETA_API_KEY = '15e63288a4805214'; // Demo API key
        if (window.Packeta) {
            window.Packeta.Widget.pick(PACKETA_API_KEY, (point: any) => {
                if (point) {
                    setPacketaPoint(point);
                    setFormErrors(prev => ({...prev, packetaPoint: ''}))
                }
            }, {
               country: 'cz',
               language: 'cs'
            });
        }
    };
    
    const generateOrderNumber = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        const storageKey = `orderSequence_${datePrefix}`;
        let sequence = 1;

        try {
            const lastSequence = localStorage.getItem(storageKey);
            if (lastSequence) {
                sequence = parseInt(lastSequence, 10) + 1;
            }
            localStorage.setItem(storageKey, sequence.toString());
        } catch (error) {
            console.error("Could not access localStorage for order sequence. Falling back to timestamp.", error);
            const hours = today.getHours().toString().padStart(2, '0');
            const minutes = today.getMinutes().toString().padStart(2, '0');
            const seconds = today.getSeconds().toString().padStart(2, '0');
            return `${datePrefix}${hours}${minutes}${seconds}`;
        }
        
        const sequenceString = sequence.toString().padStart(3, '0');
        return `${datePrefix}${sequenceString}`;
    };

    const generateInvoicePdfAsBlob = async (order: OrderDetails): Promise<Blob> => {
        if (!window.jspdf) {
            throw new Error("jsPDF library is not loaded.");
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        const fontUrl = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';
        try {
            const response = await fetch(fontUrl);
            if (!response.ok) throw new Error('Network response was not ok for font.');
            const fontBlob = await response.blob();
            const reader = new FileReader();
            const fontBase64 = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        // Get only the base64 part
                        resolve(reader.result.substring(reader.result.indexOf(',') + 1));
                    } else {
                        reject(new Error('Failed to read font as base64 string.'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(fontBlob);
            });

            doc.addFileToVFS('DejaVuSans.ttf', fontBase64);
            doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
            doc.setFont('DejaVuSans');
        } catch (error) {
            console.error("Failed to load custom font for PDF, falling back to default. Czech characters might not render correctly.", error);
        }

        const pageHeight = doc.internal.pageSize.height;
        let y = 20;
        const margin = 15;
        const col1 = margin;
        const col2 = 110;
        const pageWidth = doc.internal.pageSize.width;

        const checkY = (increment: number) => {
            if (y + increment > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // --- Header ---
        doc.setFontSize(22);
        doc.text('Faktura - daňový doklad', col1, y);
        y += 15;

        // --- Supplier & Customer Info ---
        doc.setFontSize(10);
        doc.setLineWidth(0.2);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);

        doc.text('Dodavatel:', col1, y);
        doc.setFontSize(11);
        doc.text('Natálie Väterová', col1, y + 5);
        doc.setFontSize(10);
        doc.text('Dlouhý Most 374', col1, y + 10);
        doc.text('463 12, Dlouhý Most', col1, y + 15);
        doc.text('IČO: 01764365', col1, y + 20);
        doc.text('Nejsem plátce DPH.', col1, y + 25);
        
        doc.setFontSize(10);
        doc.text('Odběratel:', col2, y);
        doc.setFontSize(11);
        doc.text(`${order.contact.firstName} ${order.contact.lastName}`, col2, y + 5);
        doc.setFontSize(10);
        doc.text(order.contact.street, col2, y + 10);
        doc.text(`${order.contact.zip} ${order.contact.city}`, col2, y + 15);
        doc.text(order.contact.email, col2, y + 20);

        y += 35;
        checkY(0);

        // --- Invoice Details ---
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        doc.text(`Číslo faktury: ${order.orderNumber}`, col1, y);
        doc.text(`Variabilní symbol: ${order.orderNumber}`, col1, y + 5);
        
        const issueDate = new Date().toLocaleDateString('cs-CZ');
        const dueDate = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('cs-CZ');
        doc.text(`Datum vystavení: ${issueDate}`, col2, y);
        doc.text(`Datum splatnosti: ${dueDate}`, col2, y + 5);
        
        y += 15;
        checkY(0);

        // --- Items Table ---
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        
        // Table Header
        doc.setFontSize(10);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, pageWidth - (2 * margin), 8, 'F');
        doc.text('Popis položky', col1 + 2, y);
        doc.text('Počet', 130, y, { align: 'center' });
        doc.text('Cena/ks', 155, y, { align: 'right' });
        doc.text('Celkem', pageWidth - margin - 2, y, { align: 'right' });
        
        y += 10;
        
        // Table Rows
        order.items.forEach(item => {
            checkY(10);
            const itemName = `${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}`;
            const lines = doc.splitTextToSize(itemName, 90); // Wrap text
            doc.text(lines, col1 + 2, y);
            doc.text(item.quantity.toString(), 130, y, { align: 'center' });
            doc.text(`${item.price} Kč`, 155, y, { align: 'right' });
            doc.text(`${item.price * item.quantity} Kč`, pageWidth - margin - 2, y, { align: 'right' });
            const lineIncrement = lines.length * 5;
            y += (lineIncrement > 10 ? lineIncrement : 10);
        });

        checkY(5);

        // --- Totals ---
        doc.line(110, y - 5, pageWidth - margin, y - 5);
        const shippingMethodMap: {[key: string]: string} = { zasilkovna: 'Zásilkovna', posta: 'Česká pošta', osobne: 'Osobní odběr'};
        const paymentMethodMap: {[key: string]: string} = { prevodem: 'Bankovním převodem', dobirka: 'Na dobírku'};

        doc.setFontSize(10);
        doc.text('Mezisoučet:', 115, y);
        doc.text(`${order.subtotal} Kč`, pageWidth - margin - 2, y, { align: 'right' });
        y += 6;

        checkY(6);
        doc.text(`Doprava (${shippingMethodMap[order.shipping]}):`, 115, y);
        doc.text(`${order.shippingCost} Kč`, pageWidth - margin - 2, y, { align: 'right' });
        y += 6;

        checkY(6);
        doc.text(`Platba (${paymentMethodMap[order.payment]}):`, 115, y);
        doc.text(`${order.paymentCost} Kč`, pageWidth - margin - 2, y, { align: 'right' });
        y += 6;

        checkY(6);
        doc.setFontSize(14);
        doc.text('Celkem k úhradě:', 115, y);
        doc.text(`${order.total} Kč`, pageWidth - margin - 2, y, { align: 'right' });
        doc.setFontSize(10);

        return doc.output('blob');
    };
    
    const uploadPdfToUploadcare = async (pdfBlob: Blob, orderNumber: string): Promise<string> => {
        if (!window.uploadcare) {
            throw new Error("Uploadcare widget is not available.");
        }
        const file = new File([pdfBlob], `Faktura-${orderNumber}.pdf`, { type: 'application/pdf' });
        try {
            const uploadedFile = await window.uploadcare.uploadFile(file);
            return uploadedFile.cdnUrl;
        } catch (error) {
            console.error("Failed to upload PDF to Uploadcare:", error);
            throw new Error("Nahrání faktury na server selhalo.");
        }
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        const vs = order.orderNumber;
        let paymentDetailsHtml = '';
        let invoiceDownloadLinkHtml = '';

        try {
            const pdfBlob = await generateInvoicePdfAsBlob(order);
            const invoiceUrl = await uploadPdfToUploadcare(pdfBlob, order.orderNumber);
            invoiceDownloadLinkHtml = `
                <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-radius: 8px;">
                    <a href="${invoiceUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #8D7EEF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Stáhnout fakturu (PDF)
                    </a>
                </div>`;
        } catch (error) {
             console.error("Failed to generate or upload invoice PDF:", error);
             invoiceDownloadLinkHtml = `<p style="margin-top:20px; color: #D8000C; background-color: #FFD2D2; padding: 10px; border-radius: 5px;"><strong>Upozornění:</strong> Fakturu se nepodařilo automaticky vygenerovat. Bude Vám zaslána dodatečně.</p>`;
        }
        
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h2 style="border-bottom: 2px solid #8D7EEF; padding-bottom: 10px; margin-bottom: 20px;">Platební instrukce</h2>
                    <p>Pro dokončení objednávky prosím uhraďte částku <strong>${order.total} Kč</strong> na níže uvedený účet.</p>
                    <table style="width: 100%; max-width: 400px; margin: 20px auto; text-align: left;">
                       <tr><td style="padding: 5px;">Číslo účtu:</td><td style="padding: 5px; font-weight: bold;">1562224019/3030</td></tr>
                       <tr><td style="padding: 5px;">Částka:</td><td style="padding: 5px; font-weight: bold;">${order.total} Kč</td></tr>
                       <tr><td style="padding: 5px;">Variabilní symbol:</td><td style="padding: 5px; font-weight: bold;">${vs}</td></tr>
                    </table>
                    <p style="font-size: 12px; color: #777; margin-top: 20px;">Po připsání platby na náš účet začneme s výrobou Vaší objednávky.</p>
                </div>`;
        }

        paymentDetailsHtml += invoiceDownloadLinkHtml;

        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">${item.product.name} ${item.variant ? `(${item.variant.name})` : ''} ${item.orientation ? `(${item.orientation === 'portrait' ? 'na výšku' : 'na šířku'})` : ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price} Kč</td>
            </tr>`).join('');
        
        const photosConfirmationHtml = order.items.some(item => item.photos && item.photos.length > 0) ? `<p style="margin-top: 20px;">Vaše fotografie byly úspěšně přijaty a budou použity pro výrobu.</p>` : '';
        const shippingMethodMap: {[key: string]: string} = { zasilkovna: 'Zásilkovna', posta: 'Česká pošta', osobne: 'Osobní odběr'};
        const paymentMethodMap: {[key: string]: string} = { prevodem: 'Bankovním převodem', dobirka: 'Na dobírku'};
        const additionalInfoHtml = order.contact.additionalInfo ? `<h3 style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">Doplňující informace od zákazníka:</h3><p style="padding: 10px; background-color: #f9f9f9; border-radius: 8px;">${order.contact.additionalInfo.replace(/\n/g, '<br>')}</p>` : '';
        
        let customerShippingAddressHtml = `<p><strong>Fakturační a doručovací adresa:</strong><br>${order.contact.firstName} ${order.contact.lastName}<br>${order.contact.street}<br>${order.contact.zip} ${order.contact.city}</p>`;
        if (order.shipping === 'zasilkovna' && order.packetaPoint) {
            customerShippingAddressHtml = `<p><strong>Výdejní místo:</strong> ${order.packetaPoint.name}, ${order.packetaPoint.street}, ${order.packetaPoint.city}</p><p><strong>Fakturační adresa:</strong><br>${order.contact.street}<br>${order.contact.zip} ${order.contact.city}</p>`;
        }
        
        const customerParams = {
            subject_line: `Potvrzení objednávky č. ${order.orderNumber}`,
            to_email: order.contact.email,
            customer_email: order.contact.email,
            email: order.contact.email,
            to_name: `${order.contact.firstName} ${order.contact.lastName}`,
            reply_to: order.contact.email,
            order_number: order.orderNumber,
            first_name: order.contact.firstName,
            items_html: itemsHtml,
            subtotal: order.subtotal,
            shipping_cost: order.shippingCost,
            payment_cost: order.paymentCost,
            total: order.total,
            photos_confirmation_html: photosConfirmationHtml,
            payment_details_html: paymentDetailsHtml,
            shipping_method: shippingMethodMap[order.shipping],
            shipping_address_html: customerShippingAddressHtml,
        };
        
        const ownerPhotosHtml = order.items
            .filter(item => item.photos && item.photos.length > 0)
            .map(item => {
                const photoManagementHtml = item.photoGroupId 
                    ? `<p style="margin-top: 5px;">
                        <a href="https://uploadcare.com/app/projects/aa96da339a5d48983ea2/groups/${item.photoGroupId}/" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #8D7EEF; color: white; text-decoration: none; border-radius: 5px;">
                            Zobrazit ${item.photos.length} fotografií &raquo;
                        </a>
                       </p>`
                    : `<p style="margin-top: 5px; color: #777;">Počet nahraných fotografií: <strong>${item.photos.length}</strong>. (Nelze zobrazit jako skupinu)</p>`;

                return `
                    <div style="padding: 10px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
                        <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                            ${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}
                        </h4>
                        ${photoManagementHtml}
                    </div>`;
            }).join('');

        const ownerPhotosSectionHtml = ownerPhotosHtml ? 
            `<div style="margin-top: 20px;">
                <h2 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Přiložené fotografie</h2>
                ${ownerPhotosHtml}
                <p style="font-size: 12px; color: #777; margin-top: 10px;">
                    Kliknutím na tlačítko "Zobrazit fotografie" se dostanete do administrace, kde si můžete fotografie prohlédnout a stáhnout.
                </p>
             </div>`
            : '';

        let ownerShippingDetailsHtml = `<h2 style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Doručovací údaje</h2>`;
        ownerShippingDetailsHtml += `<p><strong>Způsob dopravy:</strong> ${shippingMethodMap[order.shipping]}</p>`;

        if (order.shipping === 'zasilkovna' && order.packetaPoint) {
            ownerShippingDetailsHtml += `<div style="padding: 10px; background-color: #f9f9f9; border-radius: 8px; margin-top: 10px;">
                                        <strong>Výdejní místo Zásilkovny:</strong><br>
                                        ${order.packetaPoint.name}<br>
                                        ${order.packetaPoint.street || ''}<br>
                                        ${order.packetaPoint.zip} ${order.packetaPoint.city}
                                      </div>`;
        }
        
        ownerShippingDetailsHtml += `<div style="padding: 10px; background-color: #f0f0f0; border-radius: 8px; margin-top: 10px;">
                                        <strong>Fakturační adresa:</strong><br>
                                        ${order.contact.firstName} ${order.contact.lastName}<br>
                                        ${order.contact.street}<br>
                                        ${order.contact.zip} ${order.contact.city}
                                      </div>`;

        const ownerParams = {
            subject_line: `Nová objednávka č. ${order.orderNumber}`,
            order_number: order.orderNumber,
            customer_name: `${order.contact.firstName} ${order.contact.lastName}`,
            customer_email: order.contact.email,
            shipping_details_html: ownerShippingDetailsHtml,
            payment_method: paymentMethodMap[order.payment],
            items_html_with_total: `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead><tr><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: left;">Produkt</th><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: center;">Množství</th><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: right;">Cena</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align: right; margin-top: 10px;">
                    <p>Mezisoučet: ${order.subtotal} Kč</p>
                    <p>Doprava: ${order.shippingCost} Kč</p>
                    <p>Platba: ${order.paymentCost} Kč</p>
                    <h3 style="margin-top: 5px;">Celkem: ${order.total} Kč</h3>
                </div>`,
            photos_html: ownerPhotosSectionHtml,
            additional_info_html: additionalInfoHtml,
            invoice_html: invoiceDownloadLinkHtml,
        };

        await window.emailjs.send('service_2pkoish', 'template_8ax2a2w', ownerParams);
        await window.emailjs.send('service_2pkoish', 'template_1v2vxgh', customerParams);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = formData;
        let errors: { [key: string]: string } = {};

        if (!data.firstName) errors.firstName = 'Jméno je povinné.';
        if (!data.lastName) errors.lastName = 'Příjmení je povinné.';
        if (!data.email) errors.email = 'Email je povinný.';
        if (!data.street) errors.street = 'Ulice je povinná.';
        if (!data.city) errors.city = 'Město je povinné.';
        if (!data.zip) errors.zip = 'PSČ je povinné.';
        if (!shippingMethod) errors.shipping = 'Vyberte způsob dopravy.';
        if (shippingMethod === 'zasilkovna' && !packetaPoint) errors.packetaPoint = 'Vyberte výdejní místo.';
        if (!paymentMethod) errors.payment = 'Vyberte způsob platby.';
        
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            setSubmitError('');
            
            const orderNumber = generateOrderNumber();
            
            const orderDetails: OrderDetails = {
                contact: data as { [key: string]: string },
                shipping: shippingMethod!,
                payment: paymentMethod!,
                packetaPoint: packetaPoint,
                items: items,
                total: total,
                subtotal: subtotal,
                shippingCost: shippingCost,
                paymentCost: paymentCost,
                orderNumber: orderNumber
            };
            
            try {
                await sendEmailNotifications(orderDetails);
                setSubmittedOrder(orderDetails);
                dispatch({ type: 'CLEAR_CART' });
            } catch (error: any) {
                console.error("Failed to send emails:", error);
                setSubmitError(`Odeslání objednávky se nezdařilo. Zkuste to prosím znovu. Pokud problém přetrvává, kontaktujte nás. (Chyba: ${error.text || error.message || 'Neznámá chyba'})`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    if (submittedOrder) {
        return (
            <PageWrapper title="Objednávka dokončena!">
                <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-3xl font-semibold text-dark-gray">Děkujeme za Váš nákup!</h3>
                    <p className="mt-2 text-gray-600 max-w-lg mx-auto">Vaše objednávka č. <strong className="text-dark-gray">{submittedOrder.orderNumber}</strong> byla úspěšně přijata. Potvrzení s odkazem na fakturu jsme Vám odeslali na email.</p>
                </div>

                {submittedOrder.payment === 'prevodem' && (
                    <div className="mt-10 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-dark-gray text-center mb-6">Platební údaje</h3>
                        <div className="space-y-4 text-center">
                            <p>Pro dokončení objednávky, prosím, proveďte platbu. Všechny potřebné informace jsme Vám zaslali do emailu.</p>
                            <div>
                                <p className="text-sm text-gray-500">Číslo účtu:</p>
                                <p className="text-lg font-semibold text-dark-gray">1562224019/3030</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Částka:</p>
                                <p className="text-lg font-semibold text-dark-gray">{submittedOrder.total} Kč</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Variabilní symbol:</p>
                                <p className="text-lg font-semibold text-dark-gray">{submittedOrder.orderNumber}</p>
                            </div>
                        </div>
                    </div>
                )}
                 <div className="text-center mt-10">
                    <Link to="/" className="inline-block bg-brand-purple text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105">
                        Zpět na hlavní stránku
                    </Link>
                </div>
            </PageWrapper>
        );
    }
    
    if (items.length === 0 && !submittedOrder) {
        return (
            <PageWrapper title="Nákupní košík">
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">Váš košík je prázdný.</p>
                    <Link to="/produkty" className="mt-6 inline-block bg-brand-pink text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105">
                        Pokračovat v nákupu
                    </Link>
                </div>
            </PageWrapper>
        )
    }

    const RadioCard = ({ name, value, checked, onChange, title, price }: any) => (
        <label className={`relative flex p-4 border rounded-lg cursor-pointer ${checked ? 'bg-brand-purple/10 border-brand-purple ring-2 ring-brand-purple' : 'border-gray-300'}`}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
            <div className="flex-1 flex justify-between">
                <span className="font-medium text-dark-gray">{title}</span>
                <span className="text-gray-600">{price}</span>
            </div>
        </label>
    );

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center mb-12">Nákupní košík</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
                    <section className="lg:col-span-7">
                        {/* Contact information */}
                        <div className="border-b border-gray-200 pb-8">
                             <h2 className="text-lg font-medium text-dark-gray">Kontaktní a fakturační údaje</h2>
                             <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                <FormInput name="firstName" label="Jméno" type="text" autoComplete="given-name" error={formErrors.firstName} value={formData.firstName} onChange={handleFormChange} required/>
                                <FormInput name="lastName" label="Příjmení" type="text" autoComplete="family-name" error={formErrors.lastName} value={formData.lastName} onChange={handleFormChange} required/>
                                <div className="sm:col-span-2">
                                    <FormInput name="email" label="Email" type="email" autoComplete="email" error={formErrors.email} value={formData.email} onChange={handleFormChange} required/>
                                </div>
                                <div className="sm:col-span-2">
                                    <FormInput name="street" label="Ulice a číslo popisné" type="text" autoComplete="street-address" error={formErrors.street} value={formData.street} onChange={handleFormChange} required/>
                                </div>
                                <div>
                                    <FormInput name="city" label="Město" type="text" autoComplete="address-level2" error={formErrors.city} value={formData.city} onChange={handleFormChange} required/>
                                </div>
                                <div>
                                    <FormInput name="zip" label="PSČ" type="text" autoComplete="postal-code" error={formErrors.zip} value={formData.zip} onChange={handleFormChange} required/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Doplňující informace (nepovinné)</label>
                                    <div className="mt-1">
                                        <textarea
                                            id="additionalInfo"
                                            name="additionalInfo"
                                            rows={4}
                                            value={formData.additionalInfo}
                                            onChange={handleFormChange}
                                            className="block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm placeholder-gray-500 border-brand-purple/20 bg-brand-purple/10"
                                            placeholder="Zde můžete uvést poznámky k objednávce, speciální požadavky atd."
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Shipping */}
                        <div className="mt-10 border-b border-gray-200 pb-8">
                            <h2 className="text-lg font-medium text-dark-gray">Doprava</h2>
                            {formErrors.shipping && <p className="mt-2 text-sm text-red-500">{formErrors.shipping}</p>}
                            <div className="mt-4 grid grid-cols-1 gap-y-4">
                               <RadioCard name="shipping" value="zasilkovna" checked={shippingMethod === 'zasilkovna'} onChange={(e) => setShippingMethod(e.target.value)} title="Zásilkovna - Výdejní místo" price="72 Kč"/>
                               {shippingMethod === 'zasilkovna' && (
                                   <div className="pl-4">
                                       <button type="button" onClick={openPacketaWidget} className="text-sm font-medium text-white bg-brand-purple hover:opacity-90 py-2 px-4 rounded-md">
                                           {packetaPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
                                       </button>
                                       {packetaPoint && <div className="mt-2 text-sm text-gray-600">Vybráno: <strong>{packetaPoint.name}</strong>, {packetaPoint.street}, {packetaPoint.city}</div>}
                                       {formErrors.packetaPoint && <p className="mt-1 text-sm text-red-500">{formErrors.packetaPoint}</p>}
                                   </div>
                               )}
                               <RadioCard name="shipping" value="posta" checked={shippingMethod === 'posta'} onChange={(e) => setShippingMethod(e.target.value)} title="Česká pošta - Balík Do ruky" price="119 Kč"/>
                               <RadioCard name="shipping" value="osobne" checked={shippingMethod === 'osobne'} onChange={(e) => setShippingMethod(e.target.value)} title="Osobní odběr - Turnov" price="Zdarma"/>
                            </div>
                        </div>
                        
                        {/* Payment */}
                        <div className="mt-10">
                            <h2 className="text-lg font-medium text-dark-gray">Platba</h2>
                            {formErrors.payment && <p className="mt-2 text-sm text-red-500">{formErrors.payment}</p>}
                            <div className="mt-4 grid grid-cols-1 gap-y-4">
                               <RadioCard name="payment" value="prevodem" checked={paymentMethod === 'prevodem'} onChange={(e) => setPaymentMethod(e.target.value)} title="Bankovním převodem" price="Zdarma"/>
                               <RadioCard name="payment" value="dobirka" checked={paymentMethod === 'dobirka'} onChange={(e) => setPaymentMethod(e.target.value)} title="Na dobírku" price="20 Kč"/>
                            </div>
                        </div>
                    </section>

                    {/* Order summary */}
                    <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                        <h2 className="text-lg font-medium text-dark-gray">Souhrn objednávky</h2>
                        <ul role="list" className="divide-y divide-gray-200">
                           {items.map(item => (
                               <li key={item.id} className="flex py-6 space-x-4">
                                   <img src={item.product.imageUrl} alt={item.product.name} className="flex-none w-24 h-24 rounded-md object-cover" />
                                   <div className="flex flex-col justify-between flex-auto">
                                       <div>
                                           <h3 className="font-medium text-dark-gray">{item.product.name}</h3>
                                           <p className="text-sm text-gray-500">
                                               {item.variant?.name}
                                               {item.orientation === 'portrait' ? ' (na výšku)' : item.orientation === 'landscape' ? ' (na šířku)' : ''}
                                           </p>
                                       </div>
                                       <div className="flex items-baseline justify-between mt-2">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                               <button
                                                   type="button"
                                                   onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                   className="px-3 py-1 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-l-md"
                                                   aria-label={`Snížit počet kusů ${item.product.name}`}
                                               >
                                                   -
                                               </button>
                                               <span className="px-4 py-1 text-center text-dark-gray font-medium">{item.quantity}</span>
                                               <button
                                                   type="button"
                                                   onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                   className="px-3 py-1 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-r-md"
                                                   aria-label={`Zvýšit počet kusů ${item.product.name}`}
                                               >
                                                   +
                                               </button>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-medium text-dark-gray">{item.price * item.quantity} Kč</p>
                                               <button onClick={() => handleRemoveItem(item.id)} type="button" className="text-sm font-medium text-brand-purple hover:opacity-80">
                                                   Odstranit
                                               </button>
                                           </div>
                                       </div>
                                   </div>
                               </li>
                           ))}
                        </ul>
                        <dl className="space-y-4 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600">Mezisoučet</dt>
                                <dd className="text-sm font-medium text-dark-gray">{subtotal} Kč</dd>
                            </div>
                             <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600">Doprava</dt>
                                <dd className="text-sm font-medium text-dark-gray">{shippingCost} Kč</dd>
                            </div>
                             <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600">Platba</dt>
                                <dd className="text-sm font-medium text-dark-gray">{paymentCost} Kč</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-dark-gray">Celkem</dt>
                                <dd className="text-base font-medium text-dark-gray">{total} Kč</dd>
                            </div>
                        </dl>
                        <div className="mt-6">
                            {submitError && <p className="text-red-600 text-sm text-center mb-4">{submitError}</p>}
                            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-pink border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-50">
                                {isSubmitting ? 'Odesílám objednávku...' : 'Odeslat objednávku'}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

// Static Page Components
const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center mb-12">{title}</h1>
            <div className="space-y-6 text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-dark-gray mt-10 mb-4 border-b pb-2">{children}</h2>;

const TermsPage: React.FC = () => (
    <PageWrapper title="Obchodní podmínky">
        <SectionTitle>1. Úvodní ustanovení</SectionTitle>
        <p>Tyto obchodní podmínky platí pro nákup v internetovém obchodě Magnetic Memories. Podmínky blíže vymezují a upřesňují práva a povinnosti prodávajícího (provozovatel) a kupujícího (zákazník).</p>
        <SectionTitle>2. Objednávka a uzavření kupní smlouvy</SectionTitle>
        <p>Veškeré objednávky podané prostřednictvím internetového obchodu jsou závazné. Podáním objednávky kupující stvrzuje, že se seznámil s těmito obchodními podmínkami a že s nimi souhlasí. Smlouva je uzavřena okamžikem potvrzení objednávky ze strany prodávajícího.</p>
        <SectionTitle>3. Cena a platební podmínky</SectionTitle>
        <p>Všechny ceny jsou uvedeny v Kč včetně DPH. Platbu je možné provést online platební kartou nebo bankovním převodem. Zboží je expedováno po připsání platby na náš účet.</p>
        <SectionTitle>4. Odstoupení od smlouvy</SectionTitle>
        <p>Vzhledem k tomu, že se jedná o zboží upravené na přání spotřebitele (personalizované produkty s vlastními fotografiemi), nelze od kupní smlouvy odstoupit ve lhůtě 14 dnů bez udání důvodu, jak je tomu u běžného zboží.</p>
        <SectionTitle>5. Reklamace</SectionTitle>
        <p>Případné reklamace vyřídíme v souladu s platným právním řádem České republiky. Zjevné vady je nutné reklamovat ihned při převzetí zboží. Na pozdější reklamace zjevných vad nebude brán zřetel.</p>
    </PageWrapper>
);

const PrivacyPage: React.FC = () => (
    <PageWrapper title="Ochrana osobních údajů">
        <SectionTitle>1. Správce osobních údajů</SectionTitle>
        <p>Správcem Vašich osobních údajů je společnost Magnetic Memories s.r.o. (dále jen "správce").</p>
        <SectionTitle>2. Jaké údaje zpracováváme</SectionTitle>
        <p>Zpracováváme údaje, které nám poskytnete při vytváření objednávky (jméno, adresa, e-mail, telefon) a fotografie, které nahrajete pro výrobu produktů. Tyto fotografie jsou po výrobě a doručení objednávky bezpečně smazány.</p>
        <SectionTitle>3. Účel zpracování</SectionTitle>
        <p>Údaje jsou zpracovávány za účelem vyřízení Vaší objednávky, komunikace ohledně stavu objednávky a pro plnění zákonných povinností (např. účetnictví).</p>
        <SectionTitle>4. Vaše práva</SectionTitle>
        <p>Máte právo na přístup ke svým osobním údajům, jejich opravu, výmaz, omezení zpracování, a právo vznést námitku proti zpracování.</p>
        <SectionTitle>5. Cookies</SectionTitle>
        <p>Náš web používá soubory cookies pro zajištění funkčnosti webu a pro analytické účely. Používáním webu souhlasíte s jejich ukládáním.</p>
    </PageWrapper>
);

const ShippingPage: React.FC = () => (
    <PageWrapper title="Doprava a platba">
        <SectionTitle>Doba výroby</SectionTitle>
        <p>Každý produkt je vyráběn na zakázku s maximální péčí. Doba výroby je obvykle 3-5 pracovních dnů od přijetí platby. Po dokončení výroby je zásilka předána dopravci.</p>
        <SectionTitle>Možnosti dopravy</SectionTitle>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zásilkovna - Výdejní místo:</strong> 72 Kč (Doručení obvykle do 2 pracovních dnů od expedice)</li>
            <li><strong>Česká pošta - Balík Do ruky:</strong> 119 Kč (Doručení na Vaši adresu, obvykle do 2 pracovních dnů od expedice)</li>
            <li><strong>Osobní odběr - Turnov:</strong> Zdarma (Po předchozí domluvě)</li>
        </ul>
        <SectionTitle>Možnosti platby</SectionTitle>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Bankovním převodem:</strong> Po dokončení objednávky obdržíte platební údaje. (Zdarma)</li>
            <li><strong>Na dobírku:</strong> Platba při převzetí zboží. (Poplatek 20 Kč)</li>
        </ul>
    </PageWrapper>
);

// --- ADMIN COMPONENTS ---

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('isAdminAuthenticated'));

    const login = (password: string) => {
        // In a real app, this would be an API call.
        if (password === 'Adrianka06') {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout };
};

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

const AdminLoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/admin";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate(from, { replace: true });
        } else {
            setError('Nesprávné heslo.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-gray-900">Přihlášení do administrace</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password-admin" className="sr-only">Heslo</label>
                        <input
                            id="password-admin"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple"
                            placeholder="Heslo"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-600">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        >
                            Přihlásit se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const { products, updateProducts, exportProducts, importProducts } = useProducts();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = (productId: string) => {
        if (window.confirm('Opravdu chcete smazat tento produkt?')) {
            updateProducts(products.filter(p => p.id !== productId));
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/');
    }
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await importProducts(file);
                alert("Produkty byly úspěšně naimportovány.");
            } catch (error) {
                alert(`Chyba při importu: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };

    return (
        <PageWrapper title="Administrace produktů">
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Link to="/admin/product/new" className="inline-block bg-brand-pink text-white px-6 py-2 rounded-md hover:opacity-90">
                        Přidat nový produkt
                    </Link>
                     <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                        Odhlásit se
                    </button>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-4">
                     <button onClick={exportProducts} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Exportovat data
                    </button>
                    <button onClick={handleImportClick} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Importovat data
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produkt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.price} Kč</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/product/${product.id}`} className="text-brand-purple hover:opacity-80">Upravit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-600 hover:text-red-800">Smazat</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageWrapper>
    );
};

const AdminProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products, updateProducts } = useProducts();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Partial<Product> | null>(null);

    useEffect(() => {
        if (id === 'new') {
            setProduct({
                id: '', name: '', price: 0, shortDescription: '', description: '',
                imageUrl: '', gallery: [], requiredPhotos: 1, variants: [],
            });
        } else {
            const existingProduct = products.find(p => p.id === id);
            setProduct(existingProduct || null);
        }
    }, [id, products]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setProduct(prev => prev ? { ...prev, [name]: parsedValue } : null);
    };

    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        const newVariants = [...(product?.variants || [])];
        newVariants[index] = { ...newVariants[index], [name]: parsedValue };
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };

    const addVariant = () => {
        const newVariants = [...(product?.variants || []), { id: `new-${Date.now()}`, name: '', photoCount: 1, price: 0, imageUrl: '' }];
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };
    
    const removeVariant = (index: number) => {
        const newVariants = [...(product?.variants || [])];
        newVariants.splice(index, 1);
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };
    
    const handleGalleryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const urls = e.target.value.split('\n').filter(url => url.trim() !== '');
        setProduct(prev => prev ? { ...prev, gallery: urls } : null);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !product.name) {
            alert("Název produktu je povinný.");
            return;
        }

        if (id === 'new') {
            const newProduct = {
                ...product,
                id: product.name!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            } as Product;
            updateProducts([...products, newProduct]);
        } else {
            updateProducts(products.map(p => p.id === id ? product as Product : p));
        }
        navigate('/admin');
    };
    
    if (product === null) return <div>Načítání produktu...</div>;

    const AdminInput: React.FC<any> = ({ label, ...props }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
      </div>
    );
    
    const AdminTextarea: React.FC<any> = ({ label, ...props }) => (
       <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea {...props} rows={props.rows || 3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
      </div>
    );

    return (
        <PageWrapper title={id === 'new' ? 'Nový produkt' : 'Upravit produkt'}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminInput label="Název produktu" name="name" value={product.name} onChange={handleChange} required />
                    <AdminInput label="Cena (Kč)" name="price" type="number" value={product.price} onChange={handleChange} required />
                </div>
                
                <AdminInput label="Krátký popisek" name="shortDescription" value={product.shortDescription} onChange={handleChange} required />
                <AdminTextarea label="Dlouhý popisek" name="description" value={product.description} onChange={handleChange} required />
                
                <AdminInput label="URL hlavního obrázku" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="https://imgur.com/your-image.jpg" required />
                <AdminTextarea label="URL obrázků galerie (každý na nový řádek)" name="gallery" value={product.gallery?.join('\n')} onChange={handleGalleryChange} placeholder="https://imgur.com/image1.jpg&#10;https://imgur.com/image2.jpg" />
                
                <AdminInput label="Počet požadovaných fotek od zákazníka" name="requiredPhotos" type="number" value={product.requiredPhotos} onChange={handleChange} required />

                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Varianty produktu</h3>
                    <div className="space-y-4">
                        {product.variants?.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 border rounded-md relative">
                                <AdminInput label="ID varianty" name="id" value={variant.id} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Název varianty" name="name" value={variant.name} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Počet fotek" name="photoCount" type="number" value={variant.photoCount} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Cena (volitelné)" name="price" type="number" value={variant.price} onChange={(e: any) => handleVariantChange(index, e)} />
                                <AdminInput label="URL obrázku (volitelné)" name="imageUrl" value={variant.imageUrl || ''} onChange={(e: any) => handleVariantChange(index, e)} placeholder="https://imgur.com/variant.jpg"/>
                                <button type="button" onClick={() => removeVariant(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addVariant} className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Přidat variantu</button>
                </div>

                <div className="flex justify-end gap-4">
                     <Link to="/admin" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">Zrušit</Link>
                     <button type="submit" className="bg-brand-purple text-white px-6 py-2 rounded-md hover:opacity-90">Uložit produkt</button>
                </div>
            </form>
        </PageWrapper>
    );
};


const AppLayout: React.FC = () => {
    const { loading } = useProducts();

    useEffect(() => {
        if (window.emailjs) {
            window.emailjs.init({publicKey: 'sVd3x5rH1tZu6JGUR'});
        } else {
            console.error("EmailJS script not loaded.");
        }
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Načítání...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/produkty" element={<ProductsPage />} />
                    <Route path="/produkty/:id" element={<ProductDetailPage />} />
                    <Route path="/jak-to-funguje" element={<HowItWorksPage />} />
                    <Route path="/kontakt" element={<ContactPage />} />
                    <Route path="/kosik" element={<CheckoutPage />} />
                    <Route path="/obchodni-podminky" element={<TermsPage />} />
                    <Route path="/ochrana-udaju" element={<PrivacyPage />} />
                    <Route path="/doprava" element={<ShippingPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<ProtectedRoute />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="product/:id" element={<AdminProductEditPage />} />
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
  return (
    <CartProvider>
      <ProductProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </ProductProvider>
    </CartProvider>
  );
}

export default App;
