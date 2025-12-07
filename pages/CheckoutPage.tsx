
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FormInput } from '../components/forms/FormInput';
import { RadioCard } from '../components/forms/RadioCard';
import { MAKE_WEBHOOK_URL } from '../constants';
import { formatPrice } from '../utils/format';

// --- KONFIGURACE EMAILJS ---
const EMAILJS_SERVICE_ID = 'service_2pkoish'; // Gmail Service

// ID šablony "Auto-Reply Magnetic Memories" (pro ZÁKAZNÍKA)
const EMAILJS_TEMPLATE_ID_USER = 'template_1v2vxgh'; 

// ID šablony "Order Confirmation" (pro VÁS/ADMINA)
const EMAILJS_TEMPLATE_ID_ADMIN = 'template_8ax2a2w'; 

interface OrderDetails {
    contact: { [key: string]: string };
    shipping: string;
    payment: string;
    packetaPoint: any | null;
    items: CartItem[];
    total: number;
    subtotal: number;
    discountAmount: number;
    couponCode?: string;
    shippingCost: number;
    paymentCost: number;
    orderNumber: string;
    marketingConsent: boolean;
}

const VALID_COUPONS: { [key: string]: number } = {
    'VANOCE10': 0.10,
    'LASKA10': 0.10
};

const FREE_SHIPPING_THRESHOLD = 800;

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const { items } = state;
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        additionalInfo: '',
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, rate: number} | null>(null);
    const [couponMessage, setCouponMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    // New checkboxes state
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Coupon Logic
    const handleApplyCoupon = () => {
        const normalizedCode = couponCode.trim().toUpperCase();
        if (!normalizedCode) return;

        if (VALID_COUPONS[normalizedCode]) {
            setAppliedCoupon({ code: normalizedCode, rate: VALID_COUPONS[normalizedCode] });
            setCouponMessage({ text: `Kód ${normalizedCode} byl úspěšně uplatněn.`, type: 'success' });
        } else {
            setAppliedCoupon(null);
            setCouponMessage({ text: 'Neplatný slevový kód.', type: 'error' });
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage(null);
    };

    const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.rate) : 0;
    const discountedSubtotal = subtotal - discountAmount;
    
    // Check for free shipping eligibility
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    // Shipping costs configuration
    const shippingCosts: { [key: string]: number } = {
        'zasilkovna': isFreeShipping ? 0 : 89,
        'posta': isFreeShipping ? 0 : 119,
        'doporucene': isFreeShipping ? 0 : 77,
        'osobne': 0
    };
    const paymentCosts: { [key: string]: number } = {
        'prevodem': 0,
        'dobirka': 20
    };

    // Only allow 'doporucene' if subtotal is less than 1000 CZK
    const isDoporuceneAvailable = subtotal < 1000;

    useEffect(() => {
        if (shippingMethod === 'doporucene' && !isDoporuceneAvailable) {
            setShippingMethod(null);
            setFormErrors(prev => ({ ...prev, shipping: 'Zvolený způsob dopravy již není dostupný pro tuto výši objednávky. Vyberte prosím jiný.' }));
        }
    }, [subtotal, shippingMethod, isDoporuceneAvailable]);

    const shippingCost = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const paymentCost = paymentMethod ? paymentCosts[paymentMethod] : 0;
    const total = discountedSubtotal + shippingCost + paymentCost;
    
    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const openPacketaWidget = () => {
        const PACKETA_API_KEY = '15e63288a4805214';
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
        const datePrefix = `${year}${month}`;

        const storageKey = `orderSequence_${datePrefix}`;
        let sequence = 1;

        try {
            const lastSequence = localStorage.getItem(storageKey);
            if (lastSequence) {
                sequence = parseInt(lastSequence, 10) + 1;
            }
            localStorage.setItem(storageKey, sequence.toString());
        } catch (error) {
            console.error("Could not access localStorage for order sequence.", error);
        }
        
        const sequenceString = sequence.toString().padStart(3, '0');
        return `${datePrefix}${sequenceString}`;
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        console.log("Starting email notifications...");
        const vs = order.orderNumber;
        const currentDate = new Date().toLocaleDateString('cs-CZ');
        
        // HTML pro platební instrukce
        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <br>
                <h3>Platební instrukce</h3>
                <p><strong>Číslo účtu:</strong> 3524601011/3030</p>
                <p><strong>Částka:</strong> ${formatPrice(order.total)} Kč</p>
                <p><strong>Variabilní symbol:</strong> ${vs}</p>
                <br>
                <p><em>Fakturu Vám zašleme po přijetí platby.</em></p>
            `;
        } else if (order.payment === 'dobirka') {
             paymentDetailsHtml = `
                <br>
                <p><strong>Zvolili jste platbu na dobírku.</strong></p>
                <p>Částku ${formatPrice(order.total)} Kč uhradíte při převzetí zásilky.</p>
             `;
        }

        // HTML pro seznam produktů
        let itemsHtml = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
        itemsHtml += '<tr style="background-color: #eee;"><th>Produkt</th><th>Množství</th><th>Cena</th></tr>';
        
        order.items.forEach(item => {
            let variantInfo = item.variant ? ` (${item.variant.name})` : '';
            
            // Generování odkazů na fotky
            let photosHtml = '';
            if (item.photos && item.photos.length > 0) {
                photosHtml = '<br><br><strong>Fotografie ke stažení:</strong><br>';
                item.photos.forEach((photo, index) => {
                     // Použijeme originální URL z Uploadcare
                     photosHtml += `<a href="${photo.url}" target="_blank" style="color: #8D7EEF; text-decoration: none;">Fotka ${index + 1}</a> &nbsp;`;
                });
            }

            itemsHtml += `<tr>
                <td>
                    <strong>${item.product.name}${variantInfo}</strong>
                    ${photosHtml}
                </td>
                <td style="text-align: center;">${item.quantity} ks</td>
                <td style="text-align: right;">${formatPrice(item.price * item.quantity)} Kč</td>
            </tr>`;
        });
        
        if (order.discountAmount > 0) {
             itemsHtml += `<tr style="color: green;">
                <td>Sleva (${order.couponCode})</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">-${formatPrice(order.discountAmount)} Kč</td>
            </tr>`;
        }
        
        // Doprava a platba do tabulky
        itemsHtml += `<tr>
            <td>Doprava: ${order.shipping}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">${formatPrice(order.shippingCost)} Kč</td>
        </tr>`;
        
        itemsHtml += `<tr>
            <td>Platba: ${order.payment}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">${formatPrice(order.paymentCost)} Kč</td>
        </tr>`;

        itemsHtml += `<tr style="font-weight: bold; background-color: #f9f9f9;">
            <td colspan="2">CELKEM K ÚHRADĚ</td>
            <td style="text-align: right;">${formatPrice(order.total)} Kč</td>
        </tr>`;

        itemsHtml += '</table>';

        const templateParams = {
            subject: `Objednávka č. ${order.orderNumber}`, // Předmět e-mailu pro zákazníka
            order_number: order.orderNumber,
            date: currentDate,
            to_name: `${order.contact.firstName} ${order.contact.lastName}`,
            to_email: order.contact.email, 
            email: order.contact.email, 
            from_name: 'Magnetic Memories',
            message: order.contact.additionalInfo || 'Bez poznámky',
            total_price: formatPrice(order.total) + ' Kč',
            subtotal: formatPrice(order.subtotal) + ' Kč',
            shipping_cost: formatPrice(order.shippingCost) + ' Kč',
            shipping_method: order.shipping,
            payment_method: order.payment,
            items_html: itemsHtml, 
            payment_details: paymentDetailsHtml,
            street: order.contact.street,
            city: order.contact.city,
            zip: order.contact.zip,
            phone: order.contact.phone,
            reply_to: 'magnetic.memories.cz@gmail.com'
        };
        
        // Parametry pro Admina (upravený předmět a příjemce)
        const adminTemplateParams = {
            ...templateParams,
            subject: `Nová objednávka: ${order.orderNumber} - ${order.contact.lastName} (${formatPrice(order.total)} Kč)`,
            to_name: 'Admin',
            to_email: 'magnetic.memories.cz@gmail.com', // Admin email
            email: order.contact.email // Email zákazníka (pro odpověď)
        };

        try {
            console.log("Sending Customer Email...");
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER, templateParams);
            
            console.log("Sending Admin Email...");
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ADMIN, adminTemplateParams);
            
            console.log("Emails sent successfully.");

        } catch (error: any) {
            console.error('Email sending failed:', error);
            alert(`CHYBA PŘI ODESÍLÁNÍ EMAILU: ${error.text || JSON.stringify(error)}\n\nUjistěte se, že v šabloně EmailJS používáte proměnné: {{order_number}}, {{{items_html}}}, {{total_price}} atd.`);
        }
    };
    
    const sendToMakeWebhook = async (order: OrderDetails) => {
        try {
            // Prepare items payload with discount as a negative line item if exists
            const webhookItems = order.items.map(item => ({
                id: item.product.id,
                name: item.product.name + (item.variant ? ` - ${item.variant.name}` : ''),
                quantity: Number(item.quantity),
                unit_price: Number(item.price), // FORCE NUMBER for Make.com
                vat_rate: 0, // Důležité pro Fakturoid
                price: Number(item.price),
                photos: item.photos.map(p => p.url)
            }));

            if (order.discountAmount > 0) {
                webhookItems.push({
                    id: 'discount',
                    name: `Sleva (${order.couponCode})`,
                    quantity: 1,
                    unit_price: Number(-order.discountAmount), // FORCE NUMBER
                    vat_rate: 0,
                    price: Number(-order.discountAmount),
                    photos: []
                });
            }

            const payload = {
                orderNumber: order.orderNumber,
                created: new Date().toISOString(),
                contact: {
                    ...order.contact,
                    name: `${order.contact.firstName} ${order.contact.lastName}`,
                    full_name: `${order.contact.firstName} ${order.contact.lastName}`, // Pro jistotu
                },
                // Rozšířené billing údaje pro lepší matching kontaktů ve Fakturoidu
                billing: {
                    name: `${order.contact.firstName} ${order.contact.lastName}`,
                    street: order.contact.street,
                    city: order.contact.city,
                    zip: order.contact.zip,
                    country: 'CZ',
                    email: order.contact.email, // Přidáno pro Fakturoid
                    phone: order.contact.phone  // Přidáno pro Fakturoid
                },
                shipping: {
                    method: order.shipping,
                    cost: Number(order.shippingCost),
                    packetaPoint: order.packetaPoint
                },
                payment: {
                    method: order.payment,
                    cost: Number(order.paymentCost)
                },
                items: webhookItems,
                totals: {
                    subtotal: Number(order.subtotal - order.discountAmount),
                    total: Number(order.total)
                }
            };
            
            console.log("Sending payload to Make:", payload);

            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                // Log only, don't throw to user
                console.warn(`Make webhook responded with status ${response.status}`);
            } else {
                console.log("Make webhook success");
            }
            
        } catch (error) {
            // We catch the error here so it doesn't block the user from seeing the Thank You page
            console.error('Webhook sending failed (non-critical for user flow):', error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        const errors: { [key: string]: string } = {};
        if (!formData.firstName) errors.firstName = 'Jméno je povinné';
        if (!formData.lastName) errors.lastName = 'Příjmení je povinné';
        if (!formData.email) errors.email = 'Email je povinný';
        if (!formData.phone) errors.phone = 'Telefon je povinný';
        if (!formData.street) errors.street = 'Ulice je povinná';
        if (!formData.city) errors.city = 'Město je povinné';
        if (!formData.zip) errors.zip = 'PSČ je povinné';
        if (!shippingMethod) errors.shipping = 'Vyberte způsob dopravy';
        if (!paymentMethod) errors.payment = 'Vyberte způsob platby';
        if (shippingMethod === 'zasilkovna' && !packetaPoint) errors.packetaPoint = 'Vyberte výdejní místo';
        if (!termsAccepted) errors.terms = 'Musíte souhlasit s obchodními podmínkami';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            window.scrollTo(0, 0); // Scroll to top to see errors
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const orderNumber = generateOrderNumber();
            const orderDetails: OrderDetails = {
                contact: formData,
                shipping: shippingMethod!,
                payment: paymentMethod!,
                packetaPoint,
                items,
                total,
                subtotal,
                discountAmount,
                couponCode: appliedCoupon?.code,
                shippingCost,
                paymentCost,
                orderNumber,
                marketingConsent
            };

            // 1. Send Emails (Independent try/catch inside)
            await sendEmailNotifications(orderDetails);
            
            // 2. Send to Make.com (Independent try/catch inside)
            await sendToMakeWebhook(orderDetails);
            
            // 3. Clear Cart & Redirect
            dispatch({ type: 'CLEAR_CART' });
            navigate('/dekujeme', { state: { order: orderDetails } });

        } catch (error) {
            console.error("Order submission critical failure:", error);
            setSubmitError('Omlouváme se, došlo k neočekávané chybě. Pokud se vám částka strhla, kontaktujte nás.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <PageWrapper title="Váš košík je prázdný">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-8">Vraťte se do obchodu a vyberte si z naší nabídky.</p>
                    <Link to="/produkty" className="inline-block bg-brand-purple text-white py-3 px-8 rounded-md hover:opacity-90">
                        Zpět k nákupu
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Dokončení objednávky">
            {submitError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {submitError}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* 1. Kontaktní údaje */}
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">1. Kontaktní a doručovací údaje</h2>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <FormInput name="firstName" label="Jméno" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} required />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} required />
                            <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} required />
                            <FormInput name="phone" label="Telefon" type="tel" value={formData.phone} onChange={handleFormChange} error={formErrors.phone} required placeholder="+420 777 777 777" />
                            <div className="sm:col-span-2">
                                <FormInput name="street" label="Ulice a číslo popisné" value={formData.street} onChange={handleFormChange} error={formErrors.street} required />
                            </div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} error={formErrors.city} required />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} error={formErrors.zip} required />
                            <div className="sm:col-span-2">
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Poznámka pro nás (volitelné)</label>
                                <textarea name="additionalInfo" id="additionalInfo" rows={3} value={formData.additionalInfo} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm placeholder-gray-500"></textarea>
                            </div>
                        </div>
                    </section>

                    {/* 2. Doprava */}
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">2. Doprava</h2>
                        <div className="space-y-4">
                            <RadioCard 
                                name="shipping" 
                                value="zasilkovna" 
                                title="Zásilkovna - Výdejní místo" 
                                price={shippingCosts['zasilkovna'] === 0 ? "Zdarma" : `${shippingCosts['zasilkovna']} Kč`} 
                                checked={shippingMethod === 'zasilkovna'} 
                                onChange={(e: any) => setShippingMethod(e.target.value)} 
                            />
                            {shippingMethod === 'zasilkovna' && (
                                <div className="ml-8 mt-2">
                                    <button type="button" onClick={openPacketaWidget} className="text-brand-purple hover:underline font-medium">
                                        {packetaPoint ? `Vybráno: ${packetaPoint.name}` : 'Vybrat výdejní místo'}
                                    </button>
                                    {formErrors.packetaPoint && <p className="text-red-500 text-sm mt-1">{formErrors.packetaPoint}</p>}
                                </div>
                            )}

                            {/* Only show 'doporucene' if eligible */}
                            {isDoporuceneAvailable && (
                                <RadioCard 
                                    name="shipping" 
                                    value="doporucene" 
                                    title="Česká pošta - Doporučené psaní (do schránky)" 
                                    price={shippingCosts['doporucene'] === 0 ? "Zdarma" : `${shippingCosts['doporucene']} Kč`} 
                                    checked={shippingMethod === 'doporucene'} 
                                    onChange={(e: any) => setShippingMethod(e.target.value)} 
                                />
                            )}
                            
                            <RadioCard 
                                name="shipping" 
                                value="posta" 
                                title="Česká pošta - Balík Do ruky" 
                                price={shippingCosts['posta'] === 0 ? "Zdarma" : `${shippingCosts['posta']} Kč`} 
                                checked={shippingMethod === 'posta'} 
                                onChange={(e: any) => setShippingMethod(e.target.value)} 
                            />
                            <RadioCard 
                                name="shipping" 
                                value="osobne" 
                                title="Osobní odběr (Turnov)" 
                                price="Zdarma" 
                                checked={shippingMethod === 'osobne'} 
                                onChange={(e: any) => setShippingMethod(e.target.value)} 
                            />
                        </div>
                        {formErrors.shipping && <p className="text-red-500 text-sm mt-2">{formErrors.shipping}</p>}
                        
                        {isFreeShipping ? (
                            <p className="mt-4 text-sm text-green-600 font-medium">✨ Máte dopravu zdarma!</p>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">Nakupte ještě za {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} Kč a máte dopravu zdarma.</p>
                        )}
                    </section>

                    {/* 3. Platba */}
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">3. Platba</h2>
                        <div className="space-y-4">
                            <RadioCard name="payment" value="prevodem" title="Bankovním převodem (předem)" price="Zdarma" checked={paymentMethod === 'prevodem'} onChange={(e: any) => setPaymentMethod(e.target.value)} />
                            <RadioCard name="payment" value="dobirka" title="Dobírkou (při převzetí)" price={`${paymentCosts['dobirka']} Kč`} checked={paymentMethod === 'dobirka'} onChange={(e: any) => setPaymentMethod(e.target.value)} />
                        </div>
                         {formErrors.payment && <p className="text-red-500 text-sm mt-2">{formErrors.payment}</p>}
                    </section>
                </div>

                {/* Summary Column */}
                <div className="lg:col-span-5 mt-10 lg:mt-0">
                    <div className="bg-gray-50 rounded-lg shadow-md p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-dark-gray mb-4">Souhrn objednávky</h2>
                        <ul className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <li key={item.id} className="py-4 flex">
                                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                        <img src={item.variant?.imageUrl || item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>{item.product.name}</h3>
                                                <p className="ml-4">{formatPrice(item.price * item.quantity)} Kč</p>
                                            </div>
                                            {item.variant && <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>}
                                        </div>
                                        <div className="flex-1 flex items-end justify-between text-sm">
                                            <p className="text-gray-500">Množství: {item.quantity}</p>
                                            <div className="flex">
                                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="font-medium text-brand-pink hover:text-brand-orange">Odstranit</button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Coupon Input */}
                        <div className="py-4 border-t border-gray-200">
                            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">Slevový kód</label>
                            <div className="mt-1 flex gap-2">
                                <input 
                                    type="text" 
                                    id="coupon" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={!!appliedCoupon}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                                    placeholder="Vložte kód"
                                />
                                {appliedCoupon ? (
                                    <button 
                                        type="button" 
                                        onClick={handleRemoveCoupon}
                                        className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                                    >
                                        Zrušit
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleApplyCoupon}
                                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                                    >
                                        Použít
                                    </button>
                                )}
                            </div>
                            {couponMessage && (
                                <p className={`mt-2 text-sm ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {couponMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Mezisoučet</p>
                                <p>{formatPrice(subtotal)} Kč</p>
                            </div>
                            
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <p>Sleva {Math.round(appliedCoupon.rate * 100)}% ({appliedCoupon.code})</p>
                                    <p>-{formatPrice(discountAmount)} Kč</p>
                                </div>
                            )}

                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Doprava</p>
                                <p>{shippingMethod ? `${shippingCost} Kč` : '–'}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Platba</p>
                                <p>{paymentMethod ? `${paymentCost} Kč` : '–'}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between text-xl font-bold text-gray-900">
                                <p>Celkem k úhradě</p>
                                <p>{formatPrice(total)} Kč</p>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="mt-6 space-y-3">
                             <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        Souhlasím s <Link to="/obchodni-podminky" target="_blank" className="text-brand-purple underline">obchodními podmínkami</Link> *
                                    </label>
                                    {formErrors.terms && <p className="text-red-500 text-xs mt-1">{formErrors.terms}</p>}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="marketing"
                                        name="marketing"
                                        type="checkbox"
                                        checked={marketingConsent}
                                        onChange={(e) => setMarketingConsent(e.target.checked)}
                                        className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="marketing" className="text-gray-500">
                                        Chci odebírat novinky a akce emailem (nepovinné)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-gradient-to-r from-brand-pink to-brand-orange border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Odesílám...' : 'Dokončit objednávku'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </PageWrapper>
    );
};

export default CheckoutPage;
