
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Product, ProductVariant, CartItem } from './types';
import { HOW_IT_WORKS_STEPS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FileUpload } from './components/FileUpload';
import { Logo } from './components/Logo';

// Tell TypeScript that external library objects exist on the window object
declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        QRCode: any;
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
            <section className="relative bg-white flex items-end justify-center min-h-screen text-white p-4 sm:p-6 lg:p-8 pb-72 sm:pb-80">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover" src="https://i.imgur.com/xZl1oox.jpeg" alt="Lednice s magnety" />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>

                <div className="absolute top-0 left-0 p-4 sm:p-6 lg:p-8">
                    <Logo className="h-36 sm:h-56 w-auto" />
                </div>

                <div className="relative z-10 max-w-2xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed">
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
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedFiles([]);
            setCustomText({});
            setSelectedVariant(currentProduct.variants?.[0]);
            setOrientation('portrait');
            setError(null);
        }
    }, [id, products]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const photoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const displayPrice = selectedVariant?.price ?? product.price;

    const isCalendar = product.id === 'magnetic-calendar';
    
    const variantImage = selectedVariant?.imageUrl;

    const displayImage = variantImage ? variantImage : 
        isCalendar ? 
            (orientation === 'portrait' ? product.imageUrl_portrait : product.imageUrl_landscape) || product.imageUrl 
        : product.imageUrl;
      
    const displayGallery = isCalendar
        ? (orientation === 'portrait' ? product.gallery_portrait : product.gallery_landscape) || product.gallery
        : product.gallery;

    const handleFilesChange = (files: string[]) => {
        setUploadedFiles(files);
        if (files.length === photoCount) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        if (uploadedFiles.length !== photoCount) {
            setError(`Prosím, nahrajte přesně ${photoCount} fotografií.`);
            return;
        }

        setError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${isCalendar ? orientation : ''}-${Date.now()}`,
            product,
            quantity: 1,
            price: displayPrice,
            variant: selectedVariant,
            photos: uploadedFiles,
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
        setUploadedFiles([]);
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
                                    <FileUpload maxFiles={photoCount} onFilesChange={handleFilesChange} uploadedFiles={uploadedFiles} />
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
                if (formRef.current) formRef.current.reset();
            }, (error: any) => {
                console.error('FAILED to send contact form:', error);
                const detailedError = error.text || (typeof error === 'object' ? JSON.stringify(error) : 'Zkuste to prosím znovu.');
                setErrorMessage(`Odeslání zprávy se nezdařilo: ${detailedError}`);
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
                        <div className="text-center py-10 px-4 bg-green-50 rounded-md">
                            <h3 className="text-2xl font-bold text-green-700">Zpráva odeslána!</h3>
                            <p className="mt-2 text-gray-600">Děkujeme, brzy se vám ozveme.</p>
                        </div>
                    ) : (
                        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label htmlFor="first_name" className="sr-only">Křestní jméno</label>
                                <input type="text" name="first_name" id="first_name" autoComplete="given-name" placeholder="Křestní jméno" required className={inputStyles} />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="sr-only">Příjmení</label>
                                <input type="text" name="last_name" id="last_name" autoComplete="family-name" placeholder="Příjmení" required className={inputStyles} />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" placeholder="Emailová adresa" required className={inputStyles} />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="sr-only">Zpráva</label>
                                <textarea id="message" name="message" rows={4} placeholder="Vaše zpráva" required className={inputStyles}></textarea>
                            </div>
                            <div className="sm:col-span-2">
                                 {status === 'error' && <p className="text-red-600 text-sm text-center mb-4">{errorMessage}</p>}
                                <button type="submit" disabled={status === 'sending'} className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-pink hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:bg-gray-400">
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

const LegalPage: React.FC<{ title: string, content: React.ReactNode }> = ({ title, content }) => {
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose lg:prose-xl">
                <h1>{title}</h1>
                {content}
            </div>
        </div>
    );
};

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();
    const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', street: '', city: '', zip: '' });
    const [shipping, setShipping] = useState('');
    const [payment, setPayment] = useState('');
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = shipping === 'zasilkovna' ? 72 : shipping === 'posta' ? 119 : 0;
    const paymentCost = payment === 'dobirka' ? 20 : 0;
    const total = subtotal + shippingCost + paymentCost;
    
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContact(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const openPacketaWidget = () => {
        window.Packeta.Widget.pick(
            '8a0ed357e6261a8f', 
            (point: any) => {
                if (point) setPacketaPoint(point);
            }, 
            {
                language: 'cs',
                country: 'cz',
            }
        );
    };
    
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!contact.firstName) newErrors.firstName = 'Křestní jméno je povinné.';
        if (!contact.lastName) newErrors.lastName = 'Příjmení je povinné.';
        if (!contact.email) newErrors.email = 'Email je povinný.';
        if (!shipping) newErrors.shipping = 'Vyberte způsob dopravy.';
        if (shipping === 'zasilkovna' && !packetaPoint) newErrors.packeta = 'Vyberte výdejní místo Zásilkovny.';
        if ((shipping === 'posta' || shipping === 'zasilkovna-adresa') && (!contact.street || !contact.city || !contact.zip)) {
            if (!contact.street) newErrors.street = 'Ulice a č.p. jsou povinné.';
            if (!contact.city) newErrors.city = 'Město je povinné.';
            if (!contact.zip) newErrors.zip = 'PSČ je povinné.';
        }
        if (!payment) newErrors.payment = 'Vyberte způsob platby.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const sendEmailNotifications = async (orderDetails: OrderDetails) => {
        const { contact, shipping, payment, packetaPoint, items, total, subtotal, shippingCost, paymentCost, orderNumber } = orderDetails;

        const items_html = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    ${item.product.name}
                    ${item.variant ? `<br><small>${item.variant.name}</small>` : ''}
                    ${item.orientation ? `<br><small>${item.orientation === 'portrait' ? 'Na výšku' : 'Na šířku'}</small>` : ''}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price} Kč</td>
            </tr>
        `).join('');

        const items_html_with_total = `
            <table style="width: 100%; border-collapse: collapse;">
                ${items_html}
                <tfoot>
                    <tr><td colspan="3" style="padding: 10px; text-align: right;">Mezisoučet: ${subtotal} Kč</td></tr>
                    <tr><td colspan="3" style="padding: 10px; text-align: right;">Doprava: ${shippingCost} Kč</td></tr>
                    <tr><td colspan="3" style="padding: 10px; text-align: right;">Platba: ${paymentCost} Kč</td></tr>
                    <tr><td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">Celkem: ${total} Kč</td></tr>
                </tfoot>
            </table>
        `;
        
        let payment_details_html = '';
        if (payment === 'prevodem') {
            const qrCodeDataURL = await new Promise<string>((resolve, reject) => {
                window.QRCode.toDataURL(
                    `SPD*1.0*ACC:CZ3030300000001562224019*AM:${total}*CC:CZK*MSG:Objednavka ${orderNumber}*VS:${orderNumber.replace('MM', '')}`, 
                    { errorCorrectionLevel: 'H' }, 
                    (err: Error, url: string) => {
                        if (err) reject(err);
                        else resolve(url);
                    }
                );
            });
            payment_details_html = `
                <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
                    <h2 style="border-bottom: 2px solid #8D7EEF; padding-bottom: 10px; margin-bottom: 20px;">Platební instrukce</h2>
                    <p>Pro dokončení objednávky prosím uhraďte částku <strong>${total} Kč</strong> na níže uvedený účet.</p>
                    <table style="width: 100%; max-width: 400px; margin: 20px auto; text-align: left;">
                        <tr><td style="padding: 5px; color: #555;">Číslo účtu:</td><td style="padding: 5px; font-weight: bold;">1562224019/3030</td></tr>
                        <tr><td style="padding: 5px; color: #555;">Částka:</td><td style="padding: 5px; font-weight: bold;">${total} Kč</td></tr>
                        <tr><td style="padding: 5px; color: #555;">Variabilní symbol:</td><td style="padding: 5px; font-weight: bold;">${orderNumber.replace('MM', '')}</td></tr>
                    </table>
                    <p style="margin-top: 20px;">Pro rychlou platbu můžete naskenovat následující QR kód:</p>
                    <div style="margin-top: 15px;"><img src="${qrCodeDataURL}" alt="QR kód pro platbu" style="width: 180px; height: 180px; margin: auto; display: block;"></div>
                    <p style="font-size: 12px; color: #777; margin-top: 20px;">Po připsání platby na náš účet začneme s výrobou Vaší objednávky.</p>
                </div>`;
        } else {
             payment_details_html = `<p style="margin-top: 30px;">Objednávku uhradíte při převzetí.</p>`;
        }
        
        const photos_html = items.flatMap(item => item.photos).map((url, i) => `<p>Fotografie ${i + 1}: <a href="${url}" target="_blank">${url}</a></p>`).join('');
        const photos_confirmation_html = items.flatMap(item => item.photos).length > 0 ? `<p style="margin-top:30px;">Vaše fotografie jsme v pořádku obdrželi a pustíme se do práce.</p>` : '';
        const shipping_address = shipping === 'osobne' ? 'Osobní odběr v Turnově' : `${contact.street}<br>${contact.zip} ${contact.city}`;
        const packeta_point_html = packetaPoint ? `<strong>Výdejní místo:</strong> ${packetaPoint.name}, ${packetaPoint.street}, ${packetaPoint.city}` : '';

        const customerParams = {
            to_email: contact.email,
            first_name: contact.firstName,
            order_number: orderNumber,
            items_html,
            subtotal,
            shipping_cost: shippingCost,
            payment_cost: paymentCost,
            total,
            payment_details_html,
            photos_confirmation_html
        };

        const adminParams = {
            order_number: orderNumber,
            customer_name: `${contact.firstName} ${contact.lastName}`,
            customer_email: contact.email,
            shipping_address,
            shipping_method: shipping,
            payment_method: payment,
            packeta_point_html,
            items_html_with_total,
            photos_html
        };

        const customerEmailPromise = window.emailjs.send('service_2pkoish', 'template_1v2vxgh', customerParams);
        const adminEmailPromise = window.emailjs.send('service_2pkoish', 'template_8ax2a2w', adminParams);
        
        return Promise.all([customerEmailPromise, adminEmailPromise]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setStatus('processing');
        setErrorMessage('');
        
        const orderNumber = `MM${Date.now()}`;
        const orderDetails: OrderDetails = { contact, shipping, payment, packetaPoint, items: state.items, total, subtotal, shippingCost, paymentCost, orderNumber };

        try {
            await sendEmailNotifications(orderDetails);
            dispatch({ type: 'CLEAR_CART' });
            navigate('/potvrzeni-objednavky', { state: orderDetails });
        } catch (error: any) {
            console.error('Failed to send order emails:', error);
            const detailedError = error.text || (typeof error === 'object' ? JSON.stringify(error) : 'Zkuste to prosím znovu.');
            setErrorMessage(`Odeslání objednávky se nezdařilo: ${detailedError}`);
            setStatus('error');
        }
    };
    
    if (state.items.length === 0) {
        return (
            <div className="text-center py-20 bg-white">
                <h1 className="text-2xl font-bold">Váš košík je prázdný.</h1>
                <Link to="/produkty" className="mt-4 inline-block bg-brand-pink text-white font-bold py-3 px-6 rounded-md shadow-lg hover:opacity-90">
                    Zpět k produktům
                </Link>
            </div>
        );
    }

    const FormInput = ({ name, label, error, ...props }: any) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input id={name} name={name} onChange={handleContactChange} value={contact[name] || ''} {...props} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${error ? 'border-red-500 bg-red-50' : 'border-brand-purple/20 bg-brand-purple/10 focus:ring-brand-purple focus:border-brand-purple'}`} />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
    
    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-center text-dark-gray">Dokončení objednávky</h1>
                <form onSubmit={handleSubmit} className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Contact Info */}
                        <div className="p-8 border rounded-lg shadow-sm bg-gray-50">
                            <h2 className="text-xl font-semibold mb-6">Kontaktní údaje</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput name="firstName" label="Křestní jméno" error={errors.firstName} required />
                                <FormInput name="lastName" label="Příjmení" error={errors.lastName} required />
                                <div className="sm:col-span-2">
                                <FormInput name="email" label="Email" error={errors.email} type="email" required />
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="p-8 border rounded-lg shadow-sm bg-gray-50">
                             <h2 className="text-xl font-semibold mb-6">Doprava</h2>
                             <div className="space-y-4">
                                <div className="flex items-center"><input type="radio" id="zasilkovna" name="shipping" value="zasilkovna" onChange={e => setShipping(e.target.value)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300" /><label htmlFor="zasilkovna" className="ml-3 block text-sm font-medium text-gray-700">Zásilkovna - Výdejní místo (72 Kč)</label></div>
                                {shipping === 'zasilkovna' && <button type="button" onClick={openPacketaWidget} className="text-sm text-brand-purple hover:underline">{packetaPoint ? `${packetaPoint.name}, ${packetaPoint.city}` : 'Vybrat výdejní místo'}</button>}
                                {errors.packeta && <p className="text-sm text-red-600">{errors.packeta}</p>}
                                <div className="flex items-center"><input type="radio" id="posta" name="shipping" value="posta" onChange={e => setShipping(e.target.value)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300" /><label htmlFor="posta" className="ml-3 block text-sm font-medium text-gray-700">Česká pošta - Balík Do ruky (119 Kč)</label></div>
                                <div className="flex items-center"><input type="radio" id="osobne" name="shipping" value="osobne" onChange={e => setShipping(e.target.value)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300" /><label htmlFor="osobne" className="ml-3 block text-sm font-medium text-gray-700">Osobní odběr - Turnov (Zdarma)</label></div>
                                {errors.shipping && <p className="text-sm text-red-600">{errors.shipping}</p>}
                             </div>
                             {(shipping === 'posta' || shipping === 'zasilkovna-adresa') && (
                                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                                    <div className="sm:col-span-2"><FormInput name="street" label="Ulice a č.p." error={errors.street} required /></div>
                                    <div><FormInput name="city" label="Město" error={errors.city} required /></div>
                                    <div><FormInput name="zip" label="PSČ" error={errors.zip} required /></div>
                                </div>
                             )}
                        </div>

                         {/* Payment */}
                         <div className="p-8 border rounded-lg shadow-sm bg-gray-50">
                            <h2 className="text-xl font-semibold mb-6">Platba</h2>
                            <div className="space-y-4">
                                <div className="flex items-center"><input type="radio" id="prevodem" name="payment" value="prevodem" onChange={e => setPayment(e.target.value)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300" /><label htmlFor="prevodem" className="ml-3 block text-sm font-medium text-gray-700">Bankovním převodem (Zdarma)</label></div>
                                <div className="flex items-center"><input type="radio" id="dobirka" name="payment" value="dobirka" onChange={e => setPayment(e.target.value)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300" /><label htmlFor="dobirka" className="ml-3 block text-sm font-medium text-gray-700">Dobírka (20 Kč)</label></div>
                                {errors.payment && <p className="text-sm text-red-600">{errors.payment}</p>}
                            </div>
                        </div>
                    </div>
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="p-8 border rounded-lg shadow-sm bg-gray-50 sticky top-24">
                           <h2 className="text-xl font-semibold mb-6">Souhrn</h2>
                           <div className="space-y-4">
                               {state.items.map(item => (
                                   <div key={item.id} className="flex justify-between text-sm">
                                       <span>{item.product.name} {item.variant ? `- ${item.variant.name}` : ''}</span>
                                       <span>{item.price} Kč</span>
                                   </div>
                               ))}
                               <hr/>
                               <div className="flex justify-between text-sm"><span>Mezisoučet</span><span>{subtotal} Kč</span></div>
                               <div className="flex justify-between text-sm"><span>Doprava</span><span>{shippingCost} Kč</span></div>
                               <div className="flex justify-between text-sm"><span>Platba</span><span>{paymentCost} Kč</span></div>
                               <hr/>
                               <div className="flex justify-between text-base font-bold"><span>Celkem</span><span>{total} Kč</span></div>
                           </div>
                           {status === 'error' && <p className="text-red-600 text-sm text-center my-4">{errorMessage}</p>}
                           <button type="submit" disabled={status === 'processing'} className="w-full mt-6 bg-brand-pink border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:bg-gray-400">
                               {status === 'processing' ? 'Odesílám...' : 'Odeslat objednávku'}
                           </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const OrderConfirmationPage: React.FC = () => {
    const location = useLocation();
    const orderDetails = location.state as OrderDetails;

    if (!orderDetails) {
        return <Navigate to="/" replace />;
    }
    
    return (
         <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-green-600">Děkujeme za objednávku!</h1>
                <p className="mt-4 text-lg text-gray-600">Vaše objednávka č. <strong>{orderDetails.orderNumber}</strong> byla přijata.</p>
                <p className="mt-2 text-gray-500">Souhrn a další informace jsme vám odeslali na email <strong>{orderDetails.contact.email}</strong>.</p>
                <Link to="/" className="mt-8 inline-block bg-brand-purple text-white font-bold py-3 px-8 rounded-md shadow-lg hover:opacity-90">
                    Zpět na hlavní stránku
                </Link>
            </div>
        </div>
    );
};


const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAdminAuthenticated') === 'true');
    
    const login = (password: string) => {
        if (password === 'Adrianka06') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout };
};

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
};

const AdminLoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            onLogin();
        } else {
            setError('Nesprávné heslo');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-gray">Přihlášení do administrace</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password-admin" className="sr-only">Heslo</label>
                            <input id="password-admin" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark-gray rounded-md focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm" placeholder="Heslo" />
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-purple hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple">
                            Přihlásit se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40">
                <h1 className="text-xl font-bold">Administrace</h1>
                <button onClick={handleLogout} className="text-sm font-medium text-brand-pink hover:opacity-80">Odhlásit se</button>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const { products, updateProducts, exportProducts, importProducts } = useProducts();
    const navigate = useNavigate();
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = (productId: string) => {
        if (window.confirm('Opravdu chcete smazat tento produkt?')) {
            const newProducts = products.filter(p => p.id !== productId);
            updateProducts(newProducts);
        }
    };
    
    const handleImportClick = () => {
        importInputRef.current?.click();
    };
    
    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await importProducts(file);
                alert("Produkty byly úspěšně naimportovány.");
            } catch (error) {
                console.error(error);
                alert(`Chyba při importu: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-2xl font-bold text-dark-gray">Správa produktů</h1>
                 <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center gap-x-4">
                    <button onClick={() => navigate('/admin/produkt/novy')} className="px-4 py-2 bg-brand-purple text-white rounded-md shadow-sm hover:opacity-90">Přidat nový produkt</button>
                </div>
            </div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                 <button onClick={exportProducts} className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700">Exportovat data</button>
                 <button onClick={handleImportClick} className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700">Importovat data</button>
                 <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200">
                    {products.map(product => (
                        <li key={product.id} className="p-4 sm:p-6 flex items-center justify-between">
                           <div className="flex items-center">
                               <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover rounded-md mr-4"/>
                               <div>
                                   <p className="text-lg font-medium text-brand-purple">{product.name}</p>
                                   <p className="text-sm text-gray-500">{product.price} Kč</p>
                               </div>
                           </div>
                           <div className="flex items-center space-x-4">
                               <button onClick={() => navigate(`/admin/produkt/${product.id}`)} className="text-sm font-medium text-brand-purple hover:opacity-80">Upravit</button>
                               <button onClick={() => handleDelete(product.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Smazat</button>
                           </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const AdminProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products, updateProducts } = useProducts();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Partial<Product>>({});
    const isNew = id === undefined;

    useEffect(() => {
        if (!isNew) {
            const existingProduct = products.find(p => p.id === id);
            if (existingProduct) {
                setProduct(JSON.parse(JSON.stringify(existingProduct))); // Deep copy
            }
        }
    }, [id, products, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setProduct(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };
    
    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newVariants = [...(product.variants || [])];
        const isNumber = type === 'number';
        (newVariants[index] as any)[name] = isNumber ? Number(value) : value;
        setProduct(p => ({ ...p, variants: newVariants }));
    };
    
    const addVariant = () => {
        const newVariant = { id: `v${Date.now()}`, name: '', photoCount: 1, price: 0, imageUrl: ''};
        setProduct(p => ({...p, variants: [...(p.variants || []), newVariant]}));
    };
    
    const removeVariant = (index: number) => {
        setProduct(p => ({...p, variants: p.variants?.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newProducts = [...products];
        if (isNew) {
            const newProduct: Product = { ...(product as Product), id: product.id || `prod_${Date.now()}`};
            newProducts.push(newProduct);
        } else {
            newProducts = newProducts.map(p => p.id === id ? (product as Product) : p);
        }
        updateProducts(newProducts);
        navigate('/admin');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-dark-gray mb-8">{isNew ? 'Přidat nový produkt' : 'Upravit produkt'}</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
                 <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6"><label>Název</label><input name="name" value={product.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-3"><label>ID (unikátní, bez mezer, např. 'muj-produkt')</label><input name="id" value={product.id || ''} onChange={handleChange} disabled={!isNew} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100" /></div>
                    <div className="sm:col-span-3"><label>Cena (Kč)</label><input name="price" type="number" value={product.price || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-6"><label>Krátký popis</label><input name="shortDescription" value={product.shortDescription || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-6"><label>Dlouhý popis</label><textarea name="description" value={product.description || ''} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-6"><label>URL hlavního obrázku</label><input name="imageUrl" value={product.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                     <div className="sm:col-span-3"><label>URL obr. na výšku (kalendář)</label><input name="imageUrl_portrait" value={product.imageUrl_portrait || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-3"><label>URL obr. na šířku (kalendář)</label><input name="imageUrl_landscape" value={product.imageUrl_landscape || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="sm:col-span-3"><label>Požadovaný počet fotek</label><input name="requiredPhotos" type="number" value={product.requiredPhotos || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                </div>

                <div>
                    <h3 className="text-lg font-medium leading-6 text-dark-gray">Varianty produktu</h3>
                    <div className="mt-4 space-y-4">
                        {product.variants?.map((variant, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-md">
                                <div className="col-span-3"><label>Název varianty</label><input name="name" value={variant.name} onChange={e => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                                <div className="col-span-3"><label>Cena (Kč)</label><input name="price" type="number" value={variant.price || 0} onChange={e => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                                <div className="col-span-2"><label>Počet fotek</label><input name="photoCount" type="number" value={variant.photoCount || 1} onChange={e => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                                <div className="col-span-3"><label>URL obrázku varianty</label><input name="imageUrl" value={variant.imageUrl || ''} onChange={e => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                                <div className="col-span-1 flex items-end"><button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-600 hover:text-red-800">Smazat</button></div>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addVariant} className="mt-4 px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Přidat variantu</button>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-200 text-dark-gray rounded-md shadow-sm hover:bg-gray-300">Zrušit</button>
                    <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md shadow-sm hover:opacity-90">Uložit produkt</button>
                </div>
            </form>
        </div>
    );
};

function App() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/admin');
  };

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produkty" element={<ProductsPage />} />
          <Route path="/produkty/:id" element={<ProductDetailPage />} />
          <Route path="/jak-to-funguje" element={<HowItWorksPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/kosik" element={<CheckoutPage />} />
          <Route path="/potvrzeni-objednavky" element={<OrderConfirmationPage />} />
          
          <Route path="/obchodni-podminky" element={<LegalPage title="Obchodní podmínky" content={<p>Zde budou obchodní podmínky...</p>} />} />
          <Route path="/ochrana-udaju" element={<LegalPage title="Ochrana osobních údajů (GDPR)" content={<p>Zde bude text o ochraně osobních údajů...</p>} />} />
          <Route path="/doprava" element={<LegalPage title="Doprava a platba" content={
                <div>
                    <h3>Způsoby dopravy</h3>
                    <ul>
                        <li><strong>Zásilkovna - Výdejní místo:</strong> 72 Kč</li>
                        <li><strong>Česká pošta - Balík Do ruky:</strong> 119 Kč</li>
                        <li><strong>Osobní odběr (Turnov):</strong> Zdarma (po předchozí domluvě)</li>
                    </ul>
                    <h3 className="mt-6">Způsoby platby</h3>
                    <ul>
                        <li><strong>Bankovním převodem:</strong> Zdarma</li>
                        <li><strong>Dobírka:</strong> 20 Kč</li>
                    </ul>
                </div>
            } />} />

          <Route path="/admin/login" element={<AdminLoginPage onLogin={handleLogin} />} />
          <Route element={<ProtectedRoute />}>
             <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/produkt/novy" element={<AdminProductEditPage />} />
                <Route path="/admin/produkt/:id" element={<AdminProductEditPage />} />
             </Route>
          </Route>

        </Routes>
      </main>
      <Footer />
    </>
  );
}

const AppWrapper: React.FC = () => {
    // Initialize EmailJS
    useEffect(() => {
        const publicKey = "sVd3x5rH1tZu6JGUR";
        if (publicKey) {
            window.emailjs.init({ publicKey });
        }
    }, []);

    return (
        <HashRouter>
            <ProductProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </ProductProvider>
        </HashRouter>
    );
};

export default AppWrapper;
