

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

        const cartItem = {
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
    const [zasilkovnaPoint, setZasilkovnaPoint] = useState('');
    const [notes, setNotes] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        if (state.items.length === 0) {
            navigate('/');
        }
    }, [state.items, navigate]);

    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const codFee = selectedPayment.codFee || 0;
    const total = subtotal + selectedShipping.price + codFee;

    const availablePaymentOptions = useMemo(() => {
        if (selectedShipping.id === 'personal') {
            return PAYMENT_OPTIONS.filter(p => p.id === 'cash' || p.id === 'transfer');
        }
        return PAYMENT_OPTIONS.filter(p => p.id !== 'cash');
    }, [selectedShipping]);

     useEffect(() => {
        if (!availablePaymentOptions.find(p => p.id === selectedPayment.id)) {
            setSelectedPayment(availablePaymentOptions[0]);
        }
    }, [availablePaymentOptions, selectedPayment.id]);

    const openPacketaWidget = () => {
        const apiKey = 'e630e635109b5559'; // Demo API key
        Packeta.Widget.pick(apiKey, (point: any) => {
            if (point) {
                setZasilkovnaPoint(point.name);
            }
        });
    };


    const handleCustomerInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    }
     const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedShipping.id === 'zasilkovna' && !zasilkovnaPoint) {
            alert('Prosím, vyberte výdejní místo Zásilkovny.');
            return;
        }
        setStep(3);
    }

    const handleSubmitOrder = () => {
        if (!agreedToTerms) {
            alert('Musíte souhlasit s obchodními podmínkami a GDPR.');
            return;
        }

        const orderId = `MM-${Date.now()}`;
        const order: Order = {
            id: orderId,
            customerInfo,
            shipping: selectedShipping,
            payment: selectedPayment,
            items: state.items,
            subtotal,
            shippingCost: selectedShipping.price,
            codFee,
            total,
            notes,
            zasilkovnaPoint: selectedShipping.id === 'zasilkovna' ? zasilkovnaPoint : undefined
        };

        // --- Simulace odeslání objednávky ---
        console.log("--- NOVÁ OBJEDNÁVKA (simulace) ---");
        const adminEmailBody = `
            Nová objednávka #${order.id}
            Zákazník: ${order.customerInfo.firstName} ${order.customerInfo.lastName} (${order.customerInfo.email})
            Doručení: ${order.customerInfo.street}, ${order.customerInfo.zip} ${order.customerInfo.city}
            Doprava: ${order.shipping.name} ${order.zasilkovnaPoint ? `(${order.zasilkovnaPoint})` : ''}
            Platba: ${order.payment.name}
            Poznámka: ${order.notes || 'Žádná'}
            Celkem: ${order.total} Kč
            Položky:
            ${order.items.map(item => `
            - ${item.product.name} (${item.variant?.name || ''}) x${item.quantity} - ${item.price} Kč
              Počet fotek: ${item.photos.length}
            `).join('')}
        `;
        console.log("E-mail pro admina (magnetic.memories.cz@gmail.com):", adminEmailBody);

        const customerEmailBody = `
            Děkujeme za vaši objednávku #${order.id}!
            Brzy vás budeme kontaktovat s potvrzením.
            Souhrn objednávky:
            Doprava: ${order.shipping.name}
            Platba: ${order.payment.name}
            Celkem: ${order.total} Kč
            ${order.payment.id === 'transfer' ? `
            Platební instrukce:
            Číslo účtu: 1562224019/3030
            Variabilní symbol: ${order.id.split('-')[1]}
            Částka: ${order.total} Kč
            ` : ''}
            Děkujeme,
            Tým Magnetic Memories
        `;
        console.log(`E-mail pro zákazníka (${order.customerInfo.email}):`, customerEmailBody);
        
        dispatch({ type: 'CLEAR_CART' });
        navigate(`/potvrzeni/${orderId}`, { state: { order } });
    };

    return (
        <div className="bg-light-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-extrabold text-center text-dark-gray mb-12">Pokladna</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <form onSubmit={handleCustomerInfoSubmit}>
                                <div className="bg-white p-8 shadow rounded-lg">
                                    <h2 className="text-xl font-semibold mb-6">Doručovací údaje</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <input required className="w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="text" placeholder="Jméno" value={customerInfo.firstName} onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})} />
                                        <input required className="w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="text" placeholder="Příjmení" value={customerInfo.lastName} onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})} />
                                        <input required className="sm:col-span-2 w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="email" placeholder="Email" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
                                        <input required className="sm:col-span-2 w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="text" placeholder="Ulice a č.p." value={customerInfo.street} onChange={e => setCustomerInfo({...customerInfo, street: e.target.value})} />
                                        <input required className="w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="text" placeholder="Město" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} />
                                        <input required className="w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray" type="text" placeholder="PSČ" value={customerInfo.zip} onChange={e => setCustomerInfo({...customerInfo, zip: e.target.value})} />
                                    </div>
                                    <button type="submit" className="mt-8 w-full bg-brand-purple text-white py-3 rounded-md hover:opacity-90">Pokračovat na dopravu</button>
                                </div>
                            </form>
                        )}
                        {step === 2 && (
                             <form onSubmit={handleShippingSubmit}>
                                <div className="bg-white p-8 shadow rounded-lg">
                                    <h2 className="text-xl font-semibold mb-6">Způsob dopravy</h2>
                                    <div className="space-y-4">
                                        {SHIPPING_OPTIONS.map(option => (
                                            <label key={option.id} className={`flex items-center p-4 border rounded-lg cursor-pointer ${selectedShipping.id === option.id ? 'border-brand-purple ring-2 ring-brand-purple' : 'border-gray-200'}`}>
                                                <input type="radio" name="shipping" value={option.id} checked={selectedShipping.id === option.id} onChange={() => setSelectedShipping(option)} className="h-4 w-4 text-brand-purple border-gray-300 focus:ring-brand-purple"/>
                                                <div className="ml-4 flex justify-between w-full">
                                                    <div>
                                                        <p className="font-medium">{option.name}</p>
                                                        <p className="text-sm text-gray-500">{option.description}</p>
                                                    </div>
                                                    <p className="font-semibold">{option.price > 0 ? `${option.price} Kč` : 'Zdarma'}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedShipping.id === 'zasilkovna' && (
                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-gray-700">Výdejní místo Zásilkovny</label>
                                            <button
                                                type="button"
                                                onClick={openPacketaWidget}
                                                className="mt-1 w-full text-left p-3 border border-gray-300 rounded-md shadow-sm bg-white text-dark-gray hover:bg-gray-50 flex justify-between items-center"
                                            >
                                                <span>{zasilkovnaPoint || 'Klikněte pro výběr výdejního místa'}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                             {zasilkovnaPoint && <p className="mt-2 text-sm text-green-600 font-medium">Vybráno: {zasilkovnaPoint}</p>}
                                        </div>
                                    )}
                                    <div className="flex justify-between mt-8">
                                        <button type="button" onClick={() => setStep(1)} className="text-gray-600 hover:text-black">Zpět</button>
                                        <button type="submit" className="bg-brand-purple text-white py-3 px-6 rounded-md hover:opacity-90">Pokračovat na platbu</button>
                                    </div>
                                </div>
                             </form>
                        )}
                        {step === 3 && (
                             <div>
                                <div className="bg-white p-8 shadow rounded-lg">
                                    <h2 className="text-xl font-semibold mb-6">Způsob platby</h2>
                                     <div className="space-y-4">
                                        {availablePaymentOptions.map(option => (
                                            <label key={option.id} className={`flex items-center p-4 border rounded-lg cursor-pointer ${selectedPayment.id === option.id ? 'border-brand-purple ring-2 ring-brand-purple' : 'border-gray-200'}`}>
                                                <input type="radio" name="payment" value={option.id} checked={selectedPayment.id === option.id} onChange={() => setSelectedPayment(option)} className="h-4 w-4 text-brand-purple border-gray-300 focus:ring-brand-purple"/>
                                                <div className="ml-4 flex justify-between w-full">
                                                    <div>
                                                        <p className="font-medium">{option.name}</p>
                                                        <p className="text-sm text-gray-500">{option.description}</p>
                                                    </div>
                                                    {option.codFee && <p className="font-semibold">+ {option.codFee} Kč</p>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-6">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Vaše poznámky k objednávce (volitelné)</label>
                                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-white text-dark-gray"></textarea>
                                    </div>
                                    <div className="mt-6">
                                        <label className="flex items-start">
                                            <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple mt-1" />
                                            <span className="ml-2 text-sm text-gray-600">Souhlasím s <Link to="/obchodni-podminky" target="_blank" rel="noopener noreferrer" className="underline text-brand-purple">obchodními podmínkami</Link> a <Link to="/zasady-ochrany-udaju" target="_blank" rel="noopener noreferrer" className="underline text-brand-purple">GDPR</Link>.</span>
                                        </label>
                                    </div>
                                     <div className="flex justify-between mt-8">
                                        <button type="button" onClick={() => setStep(2)} className="text-gray-600 hover:text-black">Zpět</button>
                                        <button type="button" onClick={handleSubmitOrder} disabled={!agreedToTerms} className="w-1/2 bg-brand-pink text-white py-3 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Objednat s povinností platby</button>
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 shadow rounded-lg sticky top-24">
                            <h2 className="text-xl font-semibold mb-6">Souhrn objednávky</h2>
                            <div className="space-y-4">
                                {state.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex items-center min-w-0">
                                            <img src={item.product.imageUrl} className="h-16 w-16 rounded-md object-cover mr-4" alt={item.product.name} />
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{item.product.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{item.variant?.name}</p>
                                            </div>
                                        </div>
                                        <p className="flex-shrink-0 ml-4">{item.price} Kč</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t my-6"></div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Mezisoučet</span><span>{subtotal} Kč</span></div>
                                <div className="flex justify-between"><span>Doprava ({selectedShipping.name})</span><span>{selectedShipping.price} Kč</span></div>
                                {codFee > 0 && <div className="flex justify-between"><span>Dobírka</span><span>{codFee} Kč</span></div>}
                                <div className="border-t my-2"></div>
                                <div className="flex justify-between font-bold text-lg"><span>Celkem</span><span>{total} Kč</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfirmationPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const location = useLocation();
    const order = location.state?.order as Order;

    const generateQrCodeUrl = () => {
        if (!order || order.payment.id !== 'transfer') return '';
        const vs = order.id.split('-')[1];
        const amount = order.total.toFixed(2);
        const iban = 'CZ5830300000001562224019'; // IBAN pro 1562224019/3030
        const spayd = `SPD*1.0*ACC:${iban}*AM:${amount}*X-VS:${vs}*MSG:Objednavka ${order.id}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(spayd)}`;
    };

    if (!order) {
        return (
             <div className="bg-white text-center py-20">
                <h1 className="text-2xl font-bold">Objednávka nenalezena</h1>
                <Link to="/" className="mt-4 inline-block text-brand-purple">Zpět na hlavní stránku</Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-4xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-full bg-green-100 text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-dark-gray">Děkujeme za vaši objednávku!</h1>
                    <p className="mt-4 text-lg text-gray-600">Brzy vás budeme kontaktovat s potvrzením. Číslo vaší objednávky je <span className="font-semibold text-brand-purple">#{order.id}</span>.</p>
                </div>
                
                <div className="mt-12 bg-light-gray p-8 rounded-lg border">
                     <h2 className="text-2xl font-semibold text-dark-gray mb-6">Souhrn objednávky</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                             <h3 className="text-lg font-semibold text-dark-gray mb-3 border-b pb-2">Doručovací adresa</h3>
                             <div className="text-gray-600 space-y-1 mt-3">
                                <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                <p>{order.customerInfo.street}</p>
                                <p>{order.customerInfo.zip} {order.customerInfo.city}</p>
                                <p>{order.customerInfo.email}</p>
                             </div>
                         </div>
                          <div>
                             <h3 className="text-lg font-semibold text-dark-gray mb-3 border-b pb-2">Doprava a platba</h3>
                             <div className="text-gray-600 space-y-1 mt-3">
                                <p><strong>Doprava:</strong> {order.shipping.name} {order.zasilkovnaPoint ? `(${order.zasilkovnaPoint})` : ''}</p>
                                <p><strong>Platba:</strong> {order.payment.name}</p>
                             </div>
                         </div>
                     </div>
                     <div className="border-t my-6"></div>
                      <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center min-w-0">
                                    <img src={item.product.imageUrl} className="h-16 w-16 rounded-md object-cover mr-4" alt={item.product.name} />
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{item.product.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{item.variant?.name}</p>
                                    </div>
                                </div>
                                <p className="flex-shrink-0 ml-4">{item.price} Kč</p>
                            </div>
                        ))}
                    </div>
                     <div className="border-t my-6"></div>
                      <div className="space-y-2 text-right">
                        <p>Mezisoučet: <span className="font-medium">{order.subtotal} Kč</span></p>
                        <p>Doprava: <span className="font-medium">{order.shippingCost} Kč</span></p>
                        {order.codFee > 0 && <p>Dobírka: <span className="font-medium">{order.codFee} Kč</span></p>}
                        <p className="font-bold text-lg mt-2 pt-2 border-t">Celkem: <span className="text-brand-purple">{order.total} Kč</span></p>
                    </div>
                </div>

                <div className="mt-12 p-6 border rounded-lg text-left bg-light-gray">
                    <h2 className="text-xl font-semibold text-dark-gray text-center mb-4">Platební instrukce</h2>
                    {order.payment.id === 'transfer' && (
                        <div className="sm:flex sm:items-center sm:space-x-8">
                                <div className="flex-1 space-y-2">
                                <p><strong>Číslo účtu:</strong> 1562224019/3030</p>
                                <p><strong>Částka:</strong> {order.total} Kč</p>
                                <p><strong>Variabilní symbol:</strong> {order.id.split('-')[1]}</p>
                            </div>
                            <div className="flex-shrink-0 mt-4 sm:mt-0">
                                <img src={generateQrCodeUrl()} alt="QR kód pro platbu" title="Naskenujte pro rychlou platbu" className="mx-auto"/>
                                <p className="text-xs text-center mt-1 text-gray-500">Naskenujte pro platbu</p>
                            </div>
                        </div>
                    )}
                     {order.payment.id === 'cod' && (
                        <p className="text-center text-gray-700">Objednávku zaplatíte v hotovosti nebo kartou dopravci při převzetí zásilky.</p>
                    )}
                     {order.payment.id === 'cash' && (
                        <p className="text-center text-gray-700">Objednávku zaplatíte v hotovosti při osobním převzetí v Turnově po předchozí domluvě.</p>
                    )}
                </div>

                <div className="text-center">
                    <Link to="/" className="mt-12 inline-block bg-brand-pink text-white font-bold py-3 px-8 rounded-md hover:opacity-90">
                        Zpět na hlavní stránku
                    </Link>
                </div>
            </div>
        </div>
    );
};

const LegalPage: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose lg:prose-xl">
            <h1>{title}</h1>
            {children}
        </div>
    </div>
);

const TermsPage: React.FC = () => (
    <LegalPage title="Obchodní podmínky">
        <p>Tyto obchodní podmínky platí pro nákup v internetovém obchodě Magnetic Memories. Podmínky blíže vymezují a upřesňují práva a povinnosti prodávajícího (provozovatel) a kupujícího (zákazník).</p>
        <h2>1. Objednávka a uzavření kupní smlouvy</h2>
        <p>Veškeré objednávky podané prostřednictvím internetového obchodu Magnetic Memories jsou závazné. Podáním objednávky kupující stvrzuje, že se seznámil s těmito obchodními podmínkami, jakož i s reklamačním řádem, a že s nimi souhlasí.</p>
        <h2>2. Reklamace a záruka</h2>
        <p>Případné reklamace budou vyřízeny v souladu s reklamačním řádem internetového obchodu Magnetic Memories a právním řádem platným v ČR. Zboží lze reklamovat u provozovatele dle podmínek reklamačního řádu na adrese uvedené v kontaktech.</p>
        <h2>3. Ochrana osobních údajů</h2>
        <p>Informace o zákaznících jsou uchovávány v souladu s platnými zákony České republiky, zejména se zákonem o ochraně osobních údajů č. 101/2000 Sb. ve znění pozdějších dodatků a předpisů. Více informací naleznete na stránce Zásady ochrany osobních údajů.</p>
    </LegalPage>
);

const PrivacyPage: React.FC = () => (
    <LegalPage title="Zásady ochrany osobních údajů (GDPR)">
        <h2>1. Správce údajů</h2>
        <p>Správcem Vašich osobních údajů je provozovatel tohoto e-shopu, Magnetic Memories (dále jen „správce“).</p>
        <h2>2. Rozsah zpracování osobních údajů</h2>
        <p>Zpracováváme pouze osobní údaje, které nám poskytnete v souvislosti s využíváním našich služeb (např. v rámci objednávky), a to: jméno, příjmení, e-mailová adresa, telefonní číslo, doručovací adresa.</p>
        <h2>3. Účel zpracování osobních údajů</h2>
        <p>Vaše osobní údaje zpracováváme za účelem vyřízení Vaší objednávky a řešení případných reklamací. Dále pro marketingové účely, pokud nám k tomu udělíte souhlas.</p>
        <h2>4. Vaše práva</h2>
        <p>Máte právo na přístup k Vašim osobním údajům, jejich opravu, výmaz, omezení zpracování, a právo vznést námitku proti zpracování.</p>
    </LegalPage>
);


const AppLayout: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const location = useLocation();
    // FIX: Changed from location.hash to location.pathname for correct routing with HashRouter
    const isAdminPage = location.pathname === '/admin';

    if (isAdminPage) {
        return <AdminPage />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header onCartClick={() => setIsCartOpen(true)} />
            <main className="flex-grow">
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/produkty" element={<ProductsPage />} />
                    <Route path="/produkty/:id" element={<ProductDetailPage openCart={() => setIsCartOpen(true)} />} />
                    <Route path="/jak-to-funguje" element={<HowItWorksPage />} />
                    <Route path="/kontakt" element={<ContactPage />} />
                    <Route path="/pokladna" element={<CheckoutPage />} />
                    <Route path="/potvrzeni/:orderId" element={<ConfirmationPage />} />
                    <Route path="/obchodni-podminky" element={<TermsPage />} />
                    <Route path="/zasady-ochrany-udaju" element={<PrivacyPage />} />
                </Routes>
            </main>
            <Footer />
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

const AppRoot: React.FC = () => (
    <ProductProvider>
        <CartProvider>
            <HashRouter>
                <AppLayout />
            </HashRouter>
        </CartProvider>
    </ProductProvider>
);

export default AppRoot;
