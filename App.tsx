import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Product, ProductVariant, CustomerInfo, ShippingOption, PaymentOption, Order, CartItem } from './types';
import { HOW_IT_WORKS_STEPS, SHIPPING_OPTIONS, PAYMENT_OPTIONS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FileUpload } from './components/FileUpload';
import { Cart } from './components/Cart';
import AdminPage from './components/AdminPage';

// Declare Packeta for TypeScript
declare const Packeta: any;

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

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-purple"></div>
    </div>
);

const HomePage: React.FC = () => {
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];
    const { products, loading, error } = useProducts();

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-white">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover" src="https://i.imgur.com/kY8d3vA.jpeg" alt="Lednice s magnety" />
                    <div className="absolute inset-0 bg-gray-900 opacity-60"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-48 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
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
                    {loading ? <LoadingSpinner /> : error ? <p className="text-center text-red-500">Chyba při načítání produktů.</p> : products.length === 0 ? <p className="text-center text-gray-500 mt-8">Zatím zde nejsou žádné produkty. Přidejte je prosím v administraci.</p> : (
                        <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                            {products.map((product, index) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    buttonStyle={buttonStyles[index % buttonStyles.length]}
                                />
                            ))}
                        </div>
                    )}
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
    const { products, loading, error } = useProducts();
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center">Všechny produkty</h1>
                {loading ? <LoadingSpinner /> : error ? <p className="text-center text-red-500">Chyba při načítání produktů.</p> : products.length === 0 ? <p className="text-center text-gray-500 mt-8">Zatím zde nejsou žádné produkty. Přidejte je prosím v administraci.</p> : (
                    <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                        {products.map((product, index) => (
                            <ProductCard 
                                key={product.id} 
                                product={product}
                                buttonStyle={buttonStyles[index % buttonStyles.length]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductDetailPage: React.FC<{ openCart: () => void }> = ({ openCart }) => {
    const { id } = useParams<{ id: string }>();
    const { products, loading, error } = useProducts();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    
    const { dispatch } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [uploadError, setUploadError] = useState<string | null>(null);

     useEffect(() => {
        if (products.length > 0) {
            const foundProduct = products.find(p => p.id === id);
            setProduct(foundProduct);
            setSelectedVariant(foundProduct?.variants?.[0]);
            setUploadedFiles([]);
            setCustomText({});
            setUploadError(null);
        }
    }, [id, products]);

    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-center text-red-500 py-20">Chyba při načítání produktu.</p>;
    if (!product) return <div className="text-center py-20">Produkt nenalezen.</div>;


    const photoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const displayPrice = selectedVariant?.price ?? product.price;
    const displayImage = selectedVariant?.imageUrl || product.imageUrl;

    const handleFilesChange = (files: string[]) => {
        setUploadedFiles(files);
        if (uploadError && files.length === photoCount) {
            setUploadError(null);
        }
    };
    
    const handleAddToCart = () => {
        if (uploadedFiles.length !== photoCount) {
            setUploadError(`Prosím, nahrajte přesně ${photoCount} fotografií.`);
            return;
        }
        setUploadError(null);

        const cartItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity: 1,
            price: displayPrice,
            variant: selectedVariant,
            photos: uploadedFiles,
            customText
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        setUploadedFiles([]);
        setCustomText({});
        openCart();
    };

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div>
                        <img src={displayImage} alt={product.name} className="w-full h-full object-center object-cover sm:rounded-lg" />
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
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
                                                    <input type="radio" name="variant-option" value={variant.id} className="sr-only" checked={selectedVariant?.id === variant.id} onChange={() => { setSelectedVariant(variant); setUploadedFiles([]); }}/>
                                                    <span>{variant.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>
                            )}

                            <div className="mt-10">
                                <h3 className="text-sm text-dark-gray font-medium">Nahrajte fotografie</h3>
                                <div className="mt-4">
                                    <FileUpload maxFiles={photoCount} onFilesChange={handleFilesChange} uploadedFiles={uploadedFiles} />
                                    {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                                </div>
                            </div>
                            
                            <div className="mt-10 flex">
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
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('first-name') + ' ' + formData.get('last-name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        const mailtoLink = `mailto:magnetic.memories.cz@gmail.com?subject=Kontaktní formulář od ${name}&body=${message}%0D%0A%0D%0AEmail pro odpověď: ${email}`;
        
        window.location.href = mailtoLink;
        
        setFormSubmitted(true);
    };

    return (
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
            <div className="relative max-w-xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-dark-gray sm:text-4xl">Kontaktujte nás</h2>
                    <p className="mt-4 text-lg leading-6 text-gray-500">Máte dotaz nebo speciální přání? Neváhejte se na nás obrátit.</p>
                </div>
                <div className="mt-12">
                    {formSubmitted ? (
                         <div className="rounded-md bg-green-50 p-4">
                             <div className="flex">
                                 <div className="flex-shrink-0">
                                     <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                     </svg>
                                 </div>
                                 <div className="ml-3">
                                     <p className="text-sm font-medium text-green-800">Děkujeme za vaši zprávu. Budeme vás brzy kontaktovat.</p>
                                 </div>
                             </div>
                         </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">Jméno</label>
                                <div className="mt-1"><input required type="text" name="first-name" id="first-name" autoComplete="given-name" className="py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-gray-300 rounded-md bg-white text-dark-gray" /></div>
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                <div className="mt-1"><input required type="text" name="last-name" id="last-name" autoComplete="family-name" className="py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-gray-300 rounded-md bg-white text-dark-gray" /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1"><input required id="email" name="email" type="email" autoComplete="email" className="py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-gray-300 rounded-md bg-white text-dark-gray" /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Zpráva</label>
                                <div className="mt-1"><textarea required id="message" name="message" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-brand-purple focus:border-brand-purple border-gray-300 rounded-md bg-white text-dark-gray"></textarea></div>
                            </div>
                            <div className="sm:col-span-2">
                                <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-pink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink">
                                    Odeslat zprávu
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: '', lastName: '', email: '', street: '', city: '', zip: '', country: 'Česká republika' });
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(SHIPPING_OPTIONS[0]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentOption>(PAYMENT_OPTIONS[0]);
    const [zasilkovnaPoint, setZasilkovnaPoint] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const subtotal = useMemo(() => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0), [state.items]);
    const shippingCost = useMemo(() => selectedShipping.price, [selectedShipping]);
    const codFee = useMemo(() => selectedPayment.id === 'cod' ? selectedPayment.codFee ?? 0 : 0, [selectedPayment]);
    const total = useMemo(() => subtotal + shippingCost + codFee, [subtotal, shippingCost, codFee]);

    useEffect(() => {
        if (state.items.length === 0) {
            navigate('/produkty');
        }
    }, [state.items, navigate]);

    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
             if (selectedShipping.id === 'zasilkovna' && !zasilkovnaPoint) {
                alert('Prosím, vyberte výdejní místo Zásilkovny.');
                return;
            }
             if (!agreedToTerms) {
                alert('Musíte souhlasit s obchodními podmínkami.');
                return;
            }
            const order: Order = {
                id: `MM-${Date.now()}`,
                customerInfo,
                shipping: selectedShipping,
                payment: selectedPayment,
                items: state.items,
                total, subtotal, shippingCost, codFee,
                notes,
                zasilkovnaPoint: zasilkovnaPoint ? `${zasilkovnaPoint.name}, ${zasilkovnaPoint.street}, ${zasilkovnaPoint.city}` : undefined,
            };
            navigate(`/potvrzeni/${order.id}`, { state: { order } });
            dispatch({ type: 'CLEAR_CART' });
        }
    };
    
    const openPacketaWidget = () => {
        Packeta.Widget.pick(
            "5d969b88a8731385", // API klíč Zásilkovny
            (point: any) => {
                if (point) {
                    setZasilkovnaPoint(point);
                }
            },
            {
                language: 'cs',
                country: 'cz',
            }
        );
    };

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto lg:max-w-none">
                    <h1 className="sr-only">Pokladna</h1>

                    <form onSubmit={handleFormSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                        <div>
                           {/* Formulář */}
                           <div>
                                <h2 className="text-lg font-medium text-gray-900">Kontaktní údaje</h2>

                                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Jméno</label>
                                        <div className="mt-1"><input required type="text" id="firstName" name="firstName" value={customerInfo.firstName} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                        <div className="mt-1"><input required type="text" id="lastName" name="lastName" value={customerInfo.lastName} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <div className="mt-1"><input required type="email" id="email" name="email" value={customerInfo.email} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Ulice a č. p.</label>
                                        <div className="mt-1"><input required type="text" name="street" id="street" value={customerInfo.street} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Město</label>
                                        <div className="mt-1"><input required type="text" name="city" id="city" value={customerInfo.city} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                    <div>
                                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">PSČ</label>
                                        <div className="mt-1"><input required type="text" name="zip" id="zip" value={customerInfo.zip} onChange={handleCustomerInfoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray" /></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 border-t border-gray-200 pt-10">
                                {/* Doprava a platba */}
                                <fieldset>
                                    <legend className="text-lg font-medium text-gray-900">Způsob dopravy</legend>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6">
                                        {SHIPPING_OPTIONS.map((option) => (
                                            <label key={option.id} className="relative bg-white border rounded-lg p-4 flex cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple">
                                                <input type="radio" name="shipping-method" value={option.id} checked={selectedShipping.id === option.id} onChange={() => setSelectedShipping(option)} className="sr-only" />
                                                <div className="flex-1 flex">
                                                    <div className="flex flex-col">
                                                        <span className="block text-sm font-medium text-gray-900">{option.name}</span>
                                                        <span className="mt-1 flex items-center text-sm text-gray-500">{option.description}</span>
                                                        <span className="mt-6 text-sm font-medium text-gray-900">{option.price} Kč</span>
                                                    </div>
                                                </div>
                                                {selectedShipping.id === option.id && <div className="absolute border-2 border-brand-purple rounded-lg inset-0 pointer-events-none"></div>}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                {selectedShipping.id === 'zasilkovna' && (
                                    <div className="mt-6">
                                        <button type="button" onClick={openPacketaWidget} className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                            {zasilkovnaPoint ? "Změnit výdejní místo" : "Vybrat výdejní místo"}
                                        </button>
                                        {zasilkovnaPoint && <p className="mt-2 text-sm text-gray-600">Vybráno: {zasilkovnaPoint.name}</p>}
                                    </div>
                                )}

                                <fieldset className="mt-10">
                                    <legend className="text-lg font-medium text-gray-900">Způsob platby</legend>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6">
                                        {PAYMENT_OPTIONS.map((option) => (
                                            <label key={option.id} className="relative bg-white border rounded-lg p-4 flex cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-purple">
                                                <input type="radio" name="payment-method" value={option.id} checked={selectedPayment.id === option.id} onChange={() => setSelectedPayment(option)} className="sr-only" />
                                                <div className="flex-1 flex">
                                                    <div className="flex flex-col">
                                                        <span className="block text-sm font-medium text-gray-900">{option.name}</span>
                                                        <span className="mt-1 flex items-center text-sm text-gray-500">{option.description}</span>
                                                    </div>
                                                </div>
                                                {selectedPayment.id === option.id && <div className="absolute border-2 border-brand-purple rounded-lg inset-0 pointer-events-none"></div>}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>

                            <div className="mt-10 border-t border-gray-200 pt-10">
                               <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Poznámka k objednávce (volitelné)</label>
                               <div className="mt-1"><textarea id="notes" name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-white text-dark-gray"></textarea></div>
                            </div>

                            <div className="mt-10 border-t border-gray-200 pt-6">
                                <div className="relative flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="font-medium text-gray-700">Souhlasím s <Link to="/obchodni-podminky" target="_blank" className="text-brand-purple hover:underline">obchodními podmínkami</Link> a <Link to="/zasady-ochrany-udaju" target="_blank" className="text-brand-purple hover:underline">zásadami ochrany osobních údajů</Link>.</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="mt-10 lg:mt-0">
                            <h2 className="text-lg font-medium text-gray-900">Souhrn objednávky</h2>

                            <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h3 className="sr-only">Items in your cart</h3>
                                <ul role="list" className="divide-y divide-gray-200">
                                    {state.items.map((item) => (
                                        <li key={item.id} className="flex py-6 px-4 sm:px-6">
                                            <div className="flex-shrink-0">
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-20 rounded-md" />
                                            </div>
                                            <div className="ml-6 flex-1 flex flex-col">
                                                <div className="flex">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-sm">
                                                            <a href="#" className="font-medium text-gray-700 hover:text-gray-800">{item.product.name}</a>
                                                        </h4>
                                                        {item.variant && <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pt-2 flex items-end justify-between">
                                                    <p className="mt-1 text-sm font-medium text-gray-900">{item.price} Kč</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <dl className="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm">Mezisoučet</dt>
                                        <dd className="text-sm font-medium text-gray-900">{subtotal} Kč</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm">Doprava</dt>
                                        <dd className="text-sm font-medium text-gray-900">{shippingCost} Kč</dd>
                                    </div>
                                    {codFee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <dt className="text-sm">Dobírka</dt>
                                            <dd className="text-sm font-medium text-gray-900">{codFee} Kč</dd>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                        <dt className="text-base font-medium">Celkem</dt>
                                        <dd className="text-base font-medium text-gray-900">{total} Kč</dd>
                                    </div>
                                </dl>

                                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                                    <button type="submit" disabled={!agreedToTerms} className="w-full bg-brand-pink border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-pink disabled:bg-gray-300 disabled:cursor-not-allowed">
                                        Dokončit objednávku
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

const ConfirmationPage: React.FC = () => {
    const { state } = useLocation();
    const order: Order = state?.order;

    if (!order) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Objednávka nenalezena.</h1>
                <p className="mt-4">Vraťte se prosím na <Link to="/" className="text-brand-purple hover:underline">hlavní stránku</Link>.</p>
            </div>
        )
    }

    const { id, customerInfo, shipping, payment, items, total, subtotal, shippingCost, codFee, notes, zasilkovnaPoint } = order;
    
    // Generování QR kódu pro platbu
    const qrCodeValue = `SPD*1.0*ACC:CZ3930300000001562224019*AM:${total}*CC:CZK*MSG:Objednavka ${id}*X-VS:${id.replace('MM-', '')}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeValue)}`;

    return (
        <div className="bg-white">
            <main className="max-w-3xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-purple">Děkujeme!</p>
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Vaše objednávka byla přijata</h1>
                    <p className="mt-2 text-base text-gray-500">Číslo vaší objednávky je <span className="font-medium text-dark-gray">{id}</span>. Brzy vás budeme kontaktovat s potvrzením.</p>
                </div>

                <section aria-labelledby="order-heading" className="mt-10 border-t border-gray-200">
                    <h2 id="order-heading" className="sr-only">Vaše objednávka</h2>

                    <h3 className="sr-only">Položky</h3>
                    {items.map((item) => (
                        <div key={item.id} className="py-10 border-b border-gray-200 flex space-x-6">
                            <img src={item.product.imageUrl} alt={item.product.name} className="flex-none w-20 h-20 object-center object-cover bg-gray-100 rounded-lg sm:w-40 sm:h-40" />
                            <div className="flex-auto flex flex-col">
                                <div>
                                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                    {item.variant && <p className="text-sm text-gray-600">{item.variant.name}</p>}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="sm:ml-40 sm:pl-6">
                        <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                            <div>
                                <dt className="font-medium text-gray-900">Doručovací adresa</dt>
                                <dd className="mt-2 text-gray-700">
                                    <address className="not-italic">
                                        <span className="block">{customerInfo.firstName} {customerInfo.lastName}</span>
                                        <span className="block">{customerInfo.street}</span>
                                        <span className="block">{customerInfo.zip} {customerInfo.city}</span>
                                    </address>
                                </dd>
                                {zasilkovnaPoint && <dd className="mt-2 text-gray-700"><b>Výdejní místo:</b> {zasilkovnaPoint}</dd>}
                            </div>
                            <div>
                                <dt className="font-medium text-gray-900">Informace o platbě</dt>
                                <dd className="mt-2 text-gray-700">
                                    <p>{payment.name}</p>
                                    <p>{shipping.name}</p>
                                </dd>
                            </div>
                        </dl>

                        <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm">
                            <div className="flex justify-between"><dt>Mezisoučet</dt><dd>{subtotal} Kč</dd></div>
                            <div className="flex justify-between"><dt>Doprava</dt><dd>{shippingCost} Kč</dd></div>
                            {codFee > 0 && <div className="flex justify-between"><dt>Dobírka</dt><dd>{codFee} Kč</dd></div>}
                            <div className="flex justify-between"><dt className="font-medium text-lg">Celkem</dt><dd className="font-medium text-lg">{total} Kč</dd></div>
                        </dl>
                        
                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <h3 className="text-xl font-medium text-dark-gray">Platební instrukce</h3>
                            {payment.id === 'transfer' && (
                                <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                                    <p>Prosím, uhraďte částku <b>{total} Kč</b> na následující účet:</p>
                                    <ul className="mt-2 list-disc list-inside space-y-1">
                                        <li>Číslo účtu: <b>1562224019/3030</b></li>
                                        <li>Variabilní symbol: <b>{id.replace('MM-', '')}</b></li>
                                    </ul>
                                    <p className="mt-4">Pro snadnou platbu můžete naskenovat tento QR kód:</p>
                                    <img src={qrCodeUrl} alt="QR kód pro platbu" className="mt-2" />
                                </div>
                            )}
                             {payment.id === 'cod' && <p className="mt-4">Částku <b>{total} Kč</b> uhradíte hotově nebo kartou dopravci při převzetí zásilky.</p>}
                             {payment.id === 'cash' && <p className="mt-4">Částku <b>{total} Kč</b> uhradíte v hotovosti při osobním odběru.</p>}
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
};

const TermsPage: React.FC = () => (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose lg:prose-lg">
            <h1>Obchodní podmínky</h1>
            <p>Platné od 1. 1. 2024</p>
            
            <h2>1. Úvodní ustanovení</h2>
            <p>Tyto obchodní podmínky (dále jen „podmínky“) platí pro nákup v internetovém obchodě Magnetic Memories. Podmínky blíže vymezují a upřesňují práva a povinnosti prodávajícího, kterým je [DOPLNIT JMÉNO A ADRESU], IČO: [DOPLNIT IČO], a kupujícího (dále jen „zákazník“).</p>

            <h2>2. Objednávka a uzavření kupní smlouvy</h2>
            <p>Veškeré objednávky podané prostřednictvím internetového obchodu jsou závazné. Odesláním objednávky zákazník potvrzuje, že se seznámil s těmito podmínkami a že s nimi souhlasí. Kupní smlouva vzniká v okamžiku potvrzení objednávky prodávajícím.</p>
            
            <h2>3. Cena a platba</h2>
            <p>Ceny zboží jsou uvedeny včetně DPH. Zákazník může uhradit cenu zboží bankovním převodem, na dobírku nebo v hotovosti při osobním odběru. Podrobné informace jsou uvedeny v sekci pokladny.</p>

            <h2>4. Dodací podmínky</h2>
            <p>Zboží je vyráběno na zakázku. Obvyklá doba dodání je 5-10 pracovních dnů od přijetí platby (v případě bankovního převodu) nebo od potvrzení objednávky (v případě dobírky). Osobní odběr je možný po předchozí domluvě.</p>

            <h2>5. Odstoupení od smlouvy</h2>
            <p>Vzhledem k tomu, že se jedná o zboží upravené podle přání spotřebitele (zakázková výroba z dodaných fotografií), v souladu s § 1837 písm. d) občanského zákoníku nelze od kupní smlouvy odstoupit ve 14denní lhůtě bez udání důvodu.</p>

            <h2>6. Reklamace a odpovědnost za vady</h2>
            <p>Případné reklamace budou vyřízeny v souladu s platným právním řádem České republiky. Zákazník je povinen zboží po jeho převzetí prohlédnout a případné vady neprodleně oznámit prodávajícímu.</p>

            <h2>7. Ochrana osobních údajů</h2>
            <p>Ochrana osobních údajů zákazníka je zajištěna v souladu s platnou legislativou. Podrobné informace naleznete na stránce Zásady ochrany osobních údajů.</p>
        </div>
    </div>
);

const PrivacyPolicyPage: React.FC = () => (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose lg:prose-lg">
            <h1>Zásady ochrany osobních údajů (GDPR)</h1>
            <p>Platné od 1. 1. 2024</p>
            
            <h2>1. Správce osobních údajů</h2>
            <p>Správcem vašich osobních údajů je [DOPLNIT JMÉNO A ADRESU], IČO: [DOPLNIT IČO] (dále jen „správce“).</p>

            <h2>2. Jaké údaje zpracováváme</h2>
            <p>Pro účely vyřízení vaší objednávky a plnění smlouvy zpracováváme následující údaje: jméno, příjmení, doručovací adresa, e-mail, telefonní číslo a fotografie, které nám poskytnete pro výrobu produktů.</p>
            
            <h2>3. Účel zpracování</h2>
            <p>Vaše osobní údaje zpracováváme za účelem:
                <ul>
                    <li>Vyřízení objednávky a výkonu práv a povinností vyplývajících ze smluvního vztahu mezi vámi a správcem.</li>
                    <li>Komunikace týkající se stavu vaší objednávky.</li>
                    <li>Plnění zákonných povinností (např. účetnictví).</li>
                </ul>
            </p>

            <h2>4. Doba uchovávání údajů</h2>
            <p>Vaše osobní údaje uchováváme po dobu nezbytně nutnou k výkonu práv a povinností vyplývajících ze smluvního vztahu a uplatňování nároků z těchto smluvních vztahů (po dobu 10 let od ukončení smluvního vztahu). Fotografie poskytnuté pro výrobu jsou po zhotovení a odeslání objednávky mazány.</p>
            
            <h2>5. Vaše práva</h2>
            <p>Máte právo na přístup ke svým osobním údajům, jejich opravu, výmaz, omezení zpracování, a právo vznést námitku proti zpracování. V případě dotazů nás neváhejte kontaktovat.</p>
        </div>
    </div>
);


const AppLayout: React.FC<{ children: React.ReactNode; openCart: () => void }> = ({ children, openCart }) => {
    const location = useLocation();
    
    // Zkontroluje, zda je aktuální cesta /admin
    // Používáme location.hash pro HashRouter
    const isAdminPage = location.hash === '#/admin';

    if (isAdminPage) {
        return <>{children}</>;
    }
    
    return (
        <>
            <Header onCartClick={openCart} />
            <main>{children}</main>
            <Footer />
        </>
    );
};


const App: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <ProductProvider>
            <CartProvider>
                <HashRouter>
                    <ScrollToTop />
                    <Cart isOpen={isCartOpen} onClose={closeCart} />
                    <AppLayout openCart={openCart}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/produkty" element={<ProductsPage />} />
                            <Route path="/produkty/:id" element={<ProductDetailPage openCart={openCart} />} />
                            <Route path="/jak-to-funguje" element={<HowItWorksPage />} />
                            <Route path="/kontakt" element={<ContactPage />} />
                            <Route path="/pokladna" element={<CheckoutPage />} />
                            <Route path="/potvrzeni/:orderId" element={<ConfirmationPage />} />
                            <Route path="/obchodni-podminky" element={<TermsPage />} />
                            <Route path="/zasady-ochrany-udaju" element={<PrivacyPolicyPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Routes>
                    </AppLayout>
                </HashRouter>
            </CartProvider>
        </ProductProvider>
    );
};

export default App;
