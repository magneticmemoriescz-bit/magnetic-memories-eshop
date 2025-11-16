
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Product, ProductVariant, CartItem, UploadedPhoto } from './types';
// FIX: Added DEJAVU_SANS_BASE64 to imports to use it for PDF generation.
import { HOW_IT_WORKS_STEPS, DEJAVU_SANS_BASE64 } from './constants';
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

// --- Static Page Components ---
const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center mb-12">{title}</h1>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
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
        <p>Všechny ceny jsou uvedeny v Kč. Nejsem plátce DPH. Platbu je možné provést bankovním převodem nebo na dobírku. Zboží je expedováno po připsání platby na náš účet (v případě bankovního převodu) nebo ihned (v případě dobírky).</p>
        <SectionTitle>4. Odstoupení od smlouvy</SectionTitle>
        <p>Vzhledem k tomu, že se jedná o zboží upravené na přání spotřebitele (personalizované produkty s vlastními fotografiemi), nelze od kupní smlouvy odstoupit ve lhůtě 14 dnů bez udání důvodu, jak je tomu u běžného zboží.</p>
        <SectionTitle>5. Reklamace</SectionTitle>
        <p>Případné reklamace vyřídíme v souladu s platným právním řádem České republiky. Zjevné vady je nutné reklamovat ihned při převzetí zboží. Na pozdější reklamace zjevných vad nebude brán zřetel.</p>
    </PageWrapper>
);

const PrivacyPage: React.FC = () => (
    <PageWrapper title="Ochrana osobních údajů">
        <SectionTitle>1. Správce osobních údajů</SectionTitle>
        <p>Správcem Vašich osobních údajů je Natálie Väterová, IČO: 01764365 (dále jen "správce").</p>
        <SectionTitle>2. Jaké údaje zpracováváme</SectionTitle>
        <p>Zpracováváme údaje, které nám poskytnete při vytváření objednávky (jméno, adresa, e-mail, telefon) a fotografie, které nahrajete pro výrobu produktů. Tyto fotografie jsou po výrobě a doručení objednávky bezpečně smazány.</p>
        <SectionTitle>3. Účel zpracování</SectionTitle>
        <p>Údaje jsou zpracovávány za účelem vyřízení Vaší objednávky, komunikace ohledně stavu objednávky a pro plnění zákonných povinností (např. účetnictví).</p>
        <SectionTitle>4. Vaše práva</SectionTitle>
        <p>Máte právo na přístup ke svým osobním údajům, jejich opravu, výmaz, omezení zpracování, a právo vznést námitku proti zpracování.</p>
        <SectionTitle>5. Cookies</SectionTitle>
        <p>Náš web používá soubory cookies pro zajištění funkčnosti webu. Používáním webu souhlasíte s jejich ukládáním.</p>
    </PageWrapper>
);

const ShippingPage: React.FC = () => (
    <PageWrapper title="Doprava a platba">
        <SectionTitle>Doba výroby</SectionTitle>
        <p>Každý produkt je vyráběn na zakázku s maximální péčí. Doba výroby je obvykle 3-5 pracovních dnů od přijetí platby (v případě platby převodem). Po dokončení výroby je zásilka předána dopravci.</p>
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
        if (!window.jspdf) throw new Error("jsPDF library is not loaded.");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
        // FIX: Reverted to using the reliable base64-encoded font from constants.tsx
        // instead of fetching from an external URL, which was causing failures.
        try {
            // Use the base64 font from constants.tsx
            doc.addFileToVFS('DejaVuSans.ttf', DEJAVU_SANS_BASE64);
            doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
            doc.setFont('DejaVuSans');
        } catch (error) {
            console.error("CRITICAL: Failed to load custom font for PDF from base64.", error);
            throw new Error(`Font loading failed, cannot generate invoice. Reason: ${error instanceof Error ? error.message : String(error)}`);
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
        y += 8;

        checkY(8);
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
        let invoiceGenerationFailed = false;

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
             invoiceGenerationFailed = true;
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
            payment_details_html: paymentDetailsHtml + invoiceDownloadLinkHtml,
            shipping_method: shippingMethodMap[order.shipping],
            shipping_address_html: customerShippingAddressHtml,
        };
        
        const ownerPhotosHtml = order.items
            .filter(item => item.photos && item.photos.length > 0)
            .map(item => {
                const photoListHtml = `<ol style="margin-top: 10px; padding-left: 20px; font-size: 13px; color: #555; line-height: 1.6;">` +
                    item.photos.map((photo, index) => `<li><strong>${index + 1}.</strong> ${photo.name}</li>`).join('') +
                    `</ol>`;

                const photoManagementHtml = item.photoGroupId 
                    ? `<p style="margin-top: 15px;">
                        <a href="https://uploadcare.com/app/projects/aa96da339a5d48983ea2/groups/${item.photoGroupId}/" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #8D7EEF; color: white; text-decoration: none; border-radius: 5px;">
                            Zobrazit fotografie v Uploadcare &raquo;
                        </a>
                       </p>`
                    : `<p style="margin-top: 15px; color: #777; font-size: 12px;">(Fotografie nebyly nahrány jako skupina)</p>`;

                return `
                    <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; background-color: #fafafa;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                            Fotografie pro: ${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}
                        </h4>
                        ${photoListHtml}
                        ${photoManagementHtml}
                    </div>`;
            }).join('');

        const ownerPhotosSectionHtml = ownerPhotosHtml ? 
            `<div style="margin-top: 20px;">
                <h2 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Přiložené fotografie</h2>
                ${ownerPhotosHtml}
                <p style="font-size: 12px; color: #777; margin-top: 10px;">
                    Seznam souborů je v pořadí, v jakém je zákazník nahrál (a seřadil).
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
        
        if (invoiceGenerationFailed) {
            // This allows us to show the warning on the confirmation page
            // even if emails were sent successfully.
            throw new Error("Fakturu se nepodařilo automaticky vygenerovat. Bude Vám zaslána dodatečně.");
        }
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
                const isInvoiceError = error.message.includes("Fakturu se nepodařilo");
                if (isInvoiceError) {
                    // It's just a warning about the invoice, the order itself went through.
                    // We need to show the success page with the warning.
                    const orderWithWarning = { ...orderDetails, invoiceError: error.message };
                    setSubmittedOrder(orderWithWarning as any);
                    dispatch({ type: 'CLEAR_CART' });
                } else {
                    console.error("Failed to send emails:", error);
                    setSubmitError(`Odeslání objednávky se nezdařilo. Zkuste to prosím znovu. Pokud problém přetrvává, kontaktujte nás. (Chyba: ${error.text || error.message || 'Neznámá chyba'})`);
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    if (submittedOrder) {
        const order = submittedOrder as OrderDetails & { invoiceError?: string };
        return (
            <PageWrapper title="Objednávka dokončena!">
                <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-3xl font-semibold text-dark-gray">Děkujeme za Váš nákup!</h3>
                    <p className="mt-2 text-gray-600 max-w-lg mx-auto">Vaše objednávka č. <strong className="text-dark-gray">{order.orderNumber}</strong> byla úspěšně přijata. Potvrzení jsme Vám odeslali na email.</p>
                </div>

                {order.invoiceError && (
                     <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        {order.invoiceError}
                    </div>
                )}

                {order.payment === 'prevodem' && (
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
                                <p className="text-lg font-semibold text-dark-gray">{order.total} Kč</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Variabilní symbol:</p>
                                <p className="text-lg font-semibold text-dark-gray">{order.orderNumber}</p>
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
                               <RadioCard name="payment" value="dobirka" checked={paymentMethod === 'dobirka'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentMethod(e.target.value)} title="Na dobírku" price="20 Kč"/>
                            </div>
                        </div>
                    </section>
                    {/* Order summary */}
                    <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                        <h2 className="text-lg font-medium text-dark-gray">Souhrn objednávky</h2>
                        <ul className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                    <div className="flex-shrink-0">
                                        <img src={item.photos[0]?.url ? `${item.photos[0].url}-/preview/100x100/` : item.product.imageUrl} alt={item.product.name} className="w-24 h-24 rounded-md object-cover sm:w-32 sm:h-32"/>
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-dark-gray">
                                                <h3>{item.product.name}</h3>
                                                <p className="ml-4">{item.price * item.quantity} Kč</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{item.variant?.name}</p>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between text-sm">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md" aria-label={`Snížit počet kusů ${item.product.name}`}>-</button>
                                                <span className="px-4 py-1">{item.quantity}</span>
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md" aria-label={`Zvýšit počet kusů ${item.product.name}`}>+</button>
                                            </div>
                                            <div className="flex">
                                                <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-red-600 hover:text-red-500">Odstranit</button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <dl className="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm">Mezisoučet</dt>
                                <dd className="text-sm font-medium text-dark-gray">{subtotal} Kč</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-sm">Doprava</dt>
                                <dd className="text-sm font-medium text-dark-gray">{shippingCost} Kč</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-sm">Platba</dt>
                                <dd className="text-sm font-medium text-dark-gray">{paymentCost} Kč</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                <dt className="text-base font-medium">Celkem</dt>
                                <dd className="text-base font-medium text-dark-gray">{total} Kč</dd>
                            </div>
                        </dl>
                        <div className="mt-6">
                            {submitError && <p className="text-red-600 text-sm text-center mb-4">{submitError}</p>}
                            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-pink border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-50">
                                {isSubmitting ? 'Odesílám objednávku...' : `Objednat a zaplatit ${total} Kč`}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

// FIX: Add Layout and App components to provide routing and a default export.
const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans text-dark-gray">
            <ScrollToTop />
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <ProductProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="produkty" element={<ProductsPage />} />
              <Route path="produkty/:id" element={<ProductDetailPage />} />
              <Route path="jak-to-funguje" element={<HowItWorksPage />} />
              <Route path="kontakt" element={<ContactPage />} />
              <Route path="kosik" element={<CheckoutPage />} />
              <Route path="doprava" element={<ShippingPage />} />
              <Route path="obchodni-podminky" element={<TermsPage />} />
              <Route path="ochrana-udaju" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </CartProvider>
    </ProductProvider>
  );
};

export default App;
