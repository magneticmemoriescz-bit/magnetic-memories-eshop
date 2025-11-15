
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { Product, ProductVariant, CartItem } from './types';
import { PRODUCTS, HOW_IT_WORKS_STEPS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FileUpload } from './components/FileUpload';

// Tell TypeScript that Packeta widget exists on the window object
declare global {
    interface Window {
        Packeta: any;
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
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-white">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover" src="https://i.imgur.com/vH40Y4d.jpg" alt="Lednice s magnety" />
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
                    <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                        {PRODUCTS.map((product, index) => (
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
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center">Všechny produkty</h1>
                <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                    {PRODUCTS.map((product, index) => (
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
    const product = PRODUCTS.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setUploadedFiles([]);
        setCustomText({});
        setSelectedVariant(product?.variants?.[0]);
        setOrientation('portrait');
        setError(null);
    }, [id, product?.variants]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const photoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const displayPrice = selectedVariant?.price ?? product.price;

    const isCalendar = product.id === 'magnetic-calendar';
    const displayImage = isCalendar
      ? (orientation === 'portrait' ? product.imageUrl_portrait : product.imageUrl_landscape) || product.imageUrl
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
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
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
                    {submitted ? (
                         <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-2xl font-semibold text-dark-gray">Děkujeme!</h3>
                            <p className="mt-2 text-gray-600">Vaše zpráva byla odeslána. Ozveme se vám co nejdříve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">Jméno</label>
                                <div className="mt-1"><input type="text" name="first-name" id="first-name" autoComplete="given-name" className={inputStyles} required /></div>
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                                <div className="mt-1"><input type="text" name="last-name" id="last-name" autoComplete="family-name" className={inputStyles} required /></div>
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
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        zip: '',
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    const sendEmailNotifications = (order: OrderDetails) => {
      const ownerEmail = 'provozovatel@magneticmemories.cz'; // Váš email

      let paymentDetailsHtml = '';
      if (order.payment === 'prevodem') {
        const vs = order.orderNumber.replace(/\D/g, '');
        paymentDetailsHtml = `
            <h2>Platební údaje</h2>
            <p>Prosíme, uhraďte částku <strong>${order.total} Kč</strong> na účet <strong>1562224019/3030</strong> s variabilním symbolem <strong>${vs}</strong>.</p>
        `;
      }

      const itemsHtml = order.items.map(item => `
          <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.price} Kč</td>
          </tr>
      `).join('');

      const customerEmailBody = `
          <div style="font-family: Arial, sans-serif; color: #333;">
              <h1>Děkujeme za Vaši objednávku!</h1>
              <p>Dobrý den ${order.contact.firstName},</p>
              <p>Vaše objednávka č. <strong>${order.orderNumber}</strong> byla přijata a brzy se pustíme do její výroby.</p>
              <h2>Souhrn objednávky</h2>
              <table style="width: 100%; border-collapse: collapse;">
                  <thead><tr>
                      <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: left;">Produkt</th>
                      <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: center;">Množství</th>
                      <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: right;">Cena</th>
                  </tr></thead>
                  <tbody>${itemsHtml}</tbody>
              </table>
              <p style="text-align: right; margin-top: 10px;">Mezisoučet: ${order.subtotal} Kč</p>
              <p style="text-align: right;">Doprava: ${order.shippingCost} Kč</p>
              <p style="text-align: right;">Platba: ${order.paymentCost} Kč</p>
              <h3 style="text-align: right; margin-top: 10px;">Celkem: ${order.total} Kč</h3>
              ${paymentDetailsHtml}
              <p>S pozdravem,<br>Váš tým Magnetic Memories</p>
          </div>
      `;

      const ownerEmailBody = `
          <h1>Nová objednávka č. ${order.orderNumber}</h1>
          <h2>Zákazník:</h2>
          <p>${order.contact.firstName} ${order.contact.lastName}<br>${order.contact.email}</p>
          <h2>Doručovací adresa:</h2>
          <p>${order.contact.street}<br>${order.contact.zip} ${order.contact.city}</p>
          <h2>Doprava a platba:</h2>
          <p>Doprava: ${order.shipping}</p>
          ${order.shipping === 'zasilkovna' && order.packetaPoint ? `<p>Výdejní místo: ${order.packetaPoint.name}, ${order.packetaPoint.street}, ${order.packetaPoint.city}</p>` : ''}
          <p>Platba: ${order.payment}</p>
          <h2>Položky:</h2>
          ${customerEmailBody.split('<h2>Souhrn objednávky</h2>')[1]}`
      ;

      console.log("--- SIMULACE ODESLÁNÍ EMAILU ZÁKAZNÍKOVI ---");
      console.log("Příjemce:", order.contact.email);
      console.log("Předmět:", `Potvrzení objednávky č. ${order.orderNumber}`);
      console.log("Tělo:", customerEmailBody);
      console.log("----------------------------------------------");

      console.log("--- SIMULACE ODESLÁNÍ EMAILU PROVOZOVATELI ---");
      console.log("Příjemce:", ownerEmail);
      console.log("Předmět:", `Nová objednávka č. ${order.orderNumber}`);
      console.log("Tělo:", ownerEmailBody);
      console.log("--------------------------------------------");
  };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
            const now = new Date();
            const orderNumber = `MM${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            
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
            
            sendEmailNotifications(orderDetails);
            setSubmittedOrder(orderDetails);
            dispatch({ type: 'CLEAR_CART' });
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
                    <p className="mt-2 text-gray-600 max-w-lg mx-auto">Vaše objednávka č. <strong className="text-dark-gray">{submittedOrder.orderNumber}</strong> byla úspěšně přijata. Potvrzení jsme Vám odeslali na email.</p>
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
                                <p className="text-lg font-semibold text-dark-gray">{submittedOrder.orderNumber.replace(/\D/g, '')}</p>
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
                             <h2 className="text-lg font-medium text-dark-gray">Kontaktní a doručovací údaje</h2>
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
                               <li key={item.id} className="flex py-6">
                                   <div className="flex-shrink-0">
                                       <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 rounded-md object-center object-cover" />
                                   </div>
                                   <div className="ml-4 flex-1 flex flex-col justify-between">
                                       <div>
                                           <h3 className="text-sm text-dark-gray">{item.product.name}</h3>
                                           {item.variant && <p className="mt-1 text-sm text-gray-500">{item.variant.name}{item.orientation === 'portrait' ? ' (na výšku)' : item.orientation === 'landscape' ? ' (na šířku)' : ''}</p>}
                                       </div>
                                       <div className="flex-1 flex items-end justify-between text-sm">
                                           <p className="text-gray-800 font-medium">{item.price} Kč</p>
                                           <div className="flex">
                                               <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-brand-purple hover:opacity-80">
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
                            <button type="submit" className="w-full bg-brand-pink border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink">
                                Odeslat objednávku
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


const AppLayout: React.FC = () => {
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
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
  return (
    <CartProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </CartProvider>
  );
}

export default App;
