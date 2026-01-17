
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FormInput } from '../components/forms/FormInput';
import { RadioCard } from '../components/forms/RadioCard';
import { MAKE_WEBHOOK_URL } from '../constants';
import { formatPrice } from '../utils/format';

// --- KONFIGURACE EMAILJS ---
const EMAILJS_SERVICE_ID = 'service_2pkoish'; 
const EMAILJS_TEMPLATE_ID_USER = 'template_1v2vxgh'; 
const EMAILJS_TEMPLATE_ID_ADMIN = 'template_8ax2a2w'; 

const DIRECT_MAILING_FEE = 100;

interface OrderDetails {
    contact: { [key: string]: string };
    ico?: string;
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
    additionalInfo: string;
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
        firstName: '', lastName: '', email: '', phone: '', street: '', city: '', zip: '', ico: '', additionalInfo: '',
    });
    const [isCompany, setIsCompany] = useState(false);
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>('prevodem'); 
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, rate: number} | null>(null);
    const [couponMessage, setCouponMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = items.reduce((acc, item) => {
        const itemBasePrice = item.price * item.quantity;
        const piecesInPackage = item.variant?.itemCount || 1;
        const totalPieces = piecesInPackage * item.quantity;
        const mailingFee = item.directMailing ? (DIRECT_MAILING_FEE * totalPieces) : 0;
        return acc + itemBasePrice + mailingFee;
    }, 0);

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
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    const shippingCosts: { [key: string]: number } = {
        'balikovna_address': isFreeShipping ? 0 : 88,
        'zasilkovna_point': isFreeShipping ? 0 : 79,
        'zasilkovna_address': isFreeShipping ? 0 : 99,
        'osobne': 0
    };
    
    const paymentCosts: { [key: string]: number } = { 'prevodem': 0 };

    const shippingCost = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const paymentCost = paymentMethod ? paymentCosts[paymentMethod] : 0;
    const total = discountedSubtotal + shippingCost + paymentCost;
    
    const openPacketaWidget = () => {
        const PACKETA_API_KEY = '15e63288a4805214';
        if (window.Packeta && window.Packeta.Widget) {
            window.Packeta.Widget.pick(PACKETA_API_KEY, (point: any) => {
                if (point) {
                    setPacketaPoint(point);
                    setFormErrors(prev => ({...prev, packetaPoint: ''}))
                }
            }, { country: 'cz', language: 'cs' });
        } else {
            alert("Widget Zásilkovny se nepodařilo načíst. Zkuste prosím obnovit stránku.");
        }
    };
    
    /**
     * Generuje unikátní chronologické číslo objednávky.
     * Formát: YYMMDDHHMM (Rok, Měsíc, Den, Hodina, Minuta)
     */
    const generateOrderNumber = (): string => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}`;
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        const vs = order.orderNumber;
        const currentDate = new Date().toLocaleDateString('cs-CZ');
        
        // CSS styly pro email
        const styleTable = 'width: 100%; border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; font-size: 14px;';
        const styleTh = 'text-align: left; padding: 12px; background-color: #f3f4f6; color: #374151; border-bottom: 2px solid #e5e7eb; font-weight: bold;';
        const styleTd = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: top;';
        const styleTdPrice = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right; font-weight: bold; white-space: nowrap;';
        const styleBox = 'background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
        const styleTdTotal = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; background-color: #f9fafb;';

        // Platební instrukce
        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <div style="${styleBox}">
                    <h3 style="margin-top: 0; color: #8D7EEF; font-size: 18px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Platební instrukce</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #6b7280;">Číslo účtu:</td><td style="padding: 8px 0; font-weight: bold; color: #111827; font-size: 16px;">3524601011/3030</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Částka k úhradě:</td><td style="padding: 8px 0; font-weight: bold; color: #EA5C9D; font-size: 20px;">${formatPrice(order.total)} Kč</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Variabilní symbol:</td><td style="padding: 8px 0; font-weight: bold; color: #111827; font-size: 18px;">${vs}</td></tr>
                    </table>
                </div>`;
        }

        // Seznam produktů
        let totalItemsQuantity = 0;
        let totalItemsPrice = 0;
        let itemsHtml = `<table style="${styleTable}"><thead><tr><th style="${styleTh}">Produkt</th><th style="${styleTh} text-align: center;">Ks</th><th style="${styleTh} text-align: right;">Cena</th></tr></thead><tbody>`;
        
        order.items.forEach(item => {
            const piecesInPackage = item.variant?.itemCount || 1;
            const totalPieces = piecesInPackage * item.quantity;
            const itemMailingFeeTotal = item.directMailing ? (DIRECT_MAILING_FEE * totalPieces) : 0;
            const itemPriceTotal = (item.price * item.quantity) + itemMailingFeeTotal;
            totalItemsQuantity += item.quantity;
            totalItemsPrice += itemPriceTotal;

            let variantInfo = item.variant ? `<br><span style="font-size: 12px; color: #6b7280;">Varianta: ${item.variant.name}</span>` : '';
            let photosHtml = '<div style="margin-top: 10px;">';
            item.photos.forEach((photo, idx) => {
                photosHtml += `<div style="margin-bottom: 5px;"><a href="${photo.url}" target="_blank" style="display: inline-block; background-color: #8D7EEF; color: #ffffff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;">ODKAZ NA FOTKU ${idx + 1}</a></div>`;
            });
            photosHtml += '</div>';
            
            itemsHtml += `<tr><td style="${styleTd}"><strong style="color: #111827;">${item.product.name}</strong>${variantInfo}${photosHtml}</td><td style="${styleTd} text-align: center;">${item.quantity}</td><td style="${styleTdPrice}">${formatPrice(itemPriceTotal)} Kč</td></tr>`;
        });
        
        itemsHtml += `<tr><td style="${styleTdTotal}">CELKEM ZA ZBOŽÍ</td><td style="${styleTdTotal} text-align: center;">${totalItemsQuantity}</td><td style="${styleTdTotal} text-align: right;">${formatPrice(totalItemsPrice)} Kč</td></tr>`;
        
        let shippingPointInfo = '';
        if (order.shipping === 'zasilkovna_point' && order.packetaPoint) {
            shippingPointInfo = `<br><span style="color: #8D7EEF; font-weight: bold;">Výdejní místo:</span> ${order.packetaPoint.name}<br><span style="color: #8D7EEF; font-weight: bold;">Adresa:</span> ${order.packetaPoint.street}, ${order.packetaPoint.city}`;
        }

        itemsHtml += `<tr><td style="${styleTd}">Doprava: ${order.shipping}${shippingPointInfo}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.shippingCost)} Kč</td></tr>`;
        itemsHtml += `<tr><td style="${styleTd}">Platba: ${order.payment}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.paymentCost)} Kč</td></tr>`;
        itemsHtml += `<tr style="background-color: #fdf2f8;"><td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold;">CELKEM K ÚHRADĚ</td><td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 20px; color: #831843;">${formatPrice(order.total)} Kč</td></tr></tbody></table>`;

        // Kontaktní údaje a adresa
        const fullName = `${order.contact.firstName} ${order.contact.lastName}`;
        const fullAddress = `${order.contact.street}, ${order.contact.city}, ${order.contact.zip}`;
        const shippingNameMap: {[key: string]: string} = {
            'balikovna_address': 'Česká pošta - Doručení na adresu',
            'zasilkovna_point': 'Zásilkovna - Výdejní místo',
            'zasilkovna_address': 'Zásilkovna - Doručení na adresu',
            'osobne': 'Osobní odběr (Liberec nebo Turnov - dle individuální domluvy)'
        };

        const customerInfoHtml = `
            <div style="${styleBox}">
                <h3 style="margin-top: 0; color: #EA5C9D; font-size: 18px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 15px;">Údaje o doručení a zákazníkovi</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 160px;"><strong>Jméno a příjmení:</strong></td>
                        <td style="padding: 6px 0; color: #111827; font-weight: bold;">${fullName}</td>
                    </tr>
                    ${order.ico ? `<tr><td style="padding: 6px 0; color: #6b7280;"><strong>IČO (Firma):</strong></td><td style="padding: 6px 0; color: #111827; font-weight: bold;">${order.ico}</td></tr>` : ''}
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td>
                        <td style="padding: 6px 0; color: #111827;">${order.contact.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;"><strong>Telefon:</strong></td>
                        <td style="padding: 6px 0; color: #111827;">${order.contact.phone}</td>
                    </tr>
                    <tr><td colspan="2" style="padding: 10px 0;"><hr style="border: 0; border-top: 1px solid #e5e7eb;"></td></tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;"><strong>Adresa doručení:</strong></td>
                        <td style="padding: 6px 0; color: #111827; font-weight: bold;">${fullAddress}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;"><strong>Způsob dopravy:</strong></td>
                        <td style="padding: 6px 0; color: #111827;">${shippingNameMap[order.shipping] || order.shipping} ${order.shipping === 'zasilkovna_point' && order.packetaPoint ? `(${order.packetaPoint.name})` : ''}</td>
                    </tr>
                    <tr><td colspan="2" style="padding: 10px 0;"><hr style="border: 0; border-top: 1px solid #e5e7eb;"></td></tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280;"><strong>Souhlas se zveřejněním:</strong></td>
                        <td style="padding: 6px 0; font-weight: bold; color: ${order.marketingConsent ? '#059669' : '#dc2626'};">
                            ${order.marketingConsent ? 'SOUHLASÍM (ANO)' : 'NESOUHLASÍM (NE)'}
                        </td>
                    </tr>
                    ${order.additionalInfo ? `
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280; vertical-align: top;"><strong>Poznámka:</strong></td>
                        <td style="padding: 10px 0; color: #4b5563; background-color: #fff9fc; border: 1px dashed #EA5C9D; padding: 10px; border-radius: 4px;">${order.additionalInfo}</td>
                    </tr>` : ''}
                </table>
            </div>
        `;

        const templateParams = {
            subject: `Objednávka č. ${order.orderNumber} - Magnetic Memories`,
            order_number: order.orderNumber,
            date: currentDate,
            to_name: fullName,
            to_email: order.contact.email, 
            customer_name: fullName,
            customer_email: order.contact.email,
            customer_phone: order.contact.phone,
            customer_address: fullAddress,
            customer_ico: order.ico || 'Není uvedeno',
            shipping_method: shippingNameMap[order.shipping] || order.shipping,
            payment_method: order.payment,
            total_price: formatPrice(order.total) + ' Kč',
            marketing_consent: order.marketingConsent ? 'ANO' : 'NE',
            note: order.additionalInfo || 'Žádná poznámka',
            items_html: itemsHtml, 
            payment_details: paymentDetailsHtml,
            customer_header: customerInfoHtml
        };
        
        try {
            // Odeslání zákazníkovi
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER, templateParams);
            // Odeslání adminovi (obsahuje stejné params)
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ADMIN, { 
                ...templateParams, 
                to_name: 'Admin Magnetic Memories', 
                to_email: 'magnetic.memories.cz@gmail.com' 
            });
        } catch (error) { 
            console.error('Odeslání emailu selhalo:', error); 
        }
    };
    
    const sendToMakeWebhook = async (order: OrderDetails) => {
        try {
            const payload = {
                orderNumber: order.orderNumber,
                name: `${order.contact.firstName} ${order.contact.lastName}`,
                email: order.contact.email,
                ico: order.ico,
                total: order.total,
                marketingConsent: order.marketingConsent,
                additionalInfo: order.additionalInfo,
                shipping: order.shipping,
                address: `${order.contact.street}, ${order.contact.city}, ${order.contact.zip}`,
                items: order.items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.price }))
            };
            await fetch(MAKE_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } catch (error) { console.error('Make.com Webhook failed:', error); }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: { [key: string]: string } = {};
        if (!formData.firstName) errors.firstName = 'Povinné';
        if (!formData.lastName) errors.lastName = 'Povinné';
        if (!formData.email) errors.email = 'Povinné';
        if (!formData.phone) errors.phone = 'Povinné';
        if (!formData.street) errors.street = 'Povinné';
        if (!formData.city) errors.city = 'Povinné';
        if (!formData.zip) errors.zip = 'Povinné';
        if (isCompany && !formData.ico) errors.ico = 'Povinné při nákupu na IČO';
        
        if (!shippingMethod) errors.shipping = 'Vyberte dopravu';
        if (shippingMethod === 'zasilkovna_point' && !packetaPoint) errors.packetaPoint = 'Vyberte místo';
        if (!termsAccepted) errors.terms = 'Souhlas s podmínkami';
        
        if (Object.keys(errors).length > 0) { setFormErrors(errors); window.scrollTo(0, 0); return; }

        setIsSubmitting(true);
        try {
            const orderNumber = generateOrderNumber();
            const orderDetails: OrderDetails = {
                contact: formData, ico: isCompany ? formData.ico : undefined, shipping: shippingMethod!, payment: paymentMethod!, packetaPoint,
                items, total, subtotal, discountAmount, couponCode: appliedCoupon?.code, shippingCost, paymentCost, orderNumber, 
                marketingConsent,
                additionalInfo: formData.additionalInfo
            };
            await sendEmailNotifications(orderDetails);
            await sendToMakeWebhook(orderDetails);
            dispatch({ type: 'CLEAR_CART' });
            navigate('/dekujeme', { state: { order: orderDetails } });
        } catch (error) { setSubmitError('Chyba při odesílání objednávky. Zkuste to prosím znovu.'); } finally { setIsSubmitting(false); }
    };

    if (items.length === 0) {
        return (
            <PageWrapper title="Váš košík je prázdný">
                <div className="text-center">
                    <Link to="/produkty" className="inline-block bg-brand-purple text-white py-3 px-8 rounded-md">Zpět k nákupu</Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Dokončení objednávky">
            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                <div className="lg:col-span-7 space-y-10">
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">1. Kontaktní údaje</h2>
                        
                        <div className="mb-8 p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-lg">
                            <div className="flex items-center h-5">
                                <input id="isCompany" type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded" />
                                <label htmlFor="isCompany" className="ml-3 text-sm font-medium text-gray-700">Nakupuji na IČO</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {isCompany && (
                                <div className="sm:col-span-2 animate-in fade-in duration-300">
                                    <FormInput name="ico" label="IČO" value={formData.ico} onChange={handleFormChange} error={formErrors.ico} required />
                                </div>
                            )}
                            <FormInput name="firstName" label="Jméno" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} required />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} required />
                            <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} required />
                            <FormInput name="phone" label="Telefon" type="tel" value={formData.phone} onChange={handleFormChange} error={formErrors.phone} required />
                            <div className="sm:col-span-2">
                                <FormInput name="street" label="Ulice a č.p." value={formData.street} onChange={handleFormChange} error={formErrors.street} required />
                            </div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} error={formErrors.city} required />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} error={formErrors.zip} required />
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Poznámka k objednávce (volitelné)</label>
                                <textarea name="additionalInfo" rows={3} value={formData.additionalInfo} onChange={handleFormChange} className="mt-1 block w-full border border-brand-purple/20 bg-brand-purple/10 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-brand-purple/10 placeholder-gray-500" placeholder="Máte speciální přání?" />
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">2. Doprava</h2>
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase">Česká pošta</p>
                            <RadioCard name="shipping" value="balikovna_address" title="Doporučeně (Doručení na adresu)" price={shippingCosts['balikovna_address'] === 0 ? "Zdarma" : `${shippingCosts['balikovna_address']} Kč`} checked={shippingMethod === 'balikovna_address'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                            
                            <p className="text-xs font-bold text-gray-400 uppercase pt-4">Zásilkovna</p>
                            <RadioCard name="shipping" value="zasilkovna_point" title="Na výdejní místo (Z-Point / Z-Box)" price={shippingCosts['zasilkovna_point'] === 0 ? "Zdarma" : `${shippingCosts['zasilkovna_point']} Kč`} checked={shippingMethod === 'zasilkovna_point'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                            {shippingMethod === 'zasilkovna_point' && (
                                <div className="ml-8 mt-2">
                                    <button type="button" onClick={openPacketaWidget} className="text-brand-purple hover:underline font-bold text-left">
                                        {packetaPoint ? `Vybráno: ${packetaPoint.name}` : 'Klikněte pro výběr Zásilkovny'}
                                    </button>
                                    {formErrors.packetaPoint && <p className="text-red-500 text-sm mt-1">{formErrors.packetaPoint}</p>}
                                </div>
                            )}
                            <RadioCard name="shipping" value="zasilkovna_address" title="Doručení na adresu" price={shippingCosts['zasilkovna_address'] === 0 ? "Zdarma" : `${shippingCosts['zasilkovna_address']} Kč`} checked={shippingMethod === 'zasilkovna_address'} onChange={(e: any) => setShippingMethod(e.target.value)} />

                            <p className="text-xs font-bold text-gray-400 uppercase pt-4">Ostatní</p>
                            <RadioCard name="shipping" value="osobne" title="Osobní odběr - Liberec nebo Turnov (Dle domluvy)" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                        </div>
                    </section>
                </div>
                <div className="lg:col-span-5 mt-10">
                    <div className="bg-gray-50 rounded-lg p-6 border shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold mb-4">Souhrn</h2>
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Mezisoučet</span><span>{formatPrice(subtotal)} Kč</span></div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Sleva ({appliedCoupon?.code})</span>
                                    <span>-{formatPrice(discountAmount)} Kč</span>
                                </div>
                            )}
                            <div className="flex justify-between"><span>Doprava</span><span>{shippingMethod ? `${shippingCost} Kč` : '–'}</span></div>
                            <div className="border-t pt-4 flex justify-between text-xl font-bold"><span>Celkem</span><span>{formatPrice(total)} Kč</span></div>
                        </div>

                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slevový kód</label>
                            <div className="flex items-stretch rounded-md overflow-hidden border border-brand-purple/20 bg-brand-purple/10 shadow-sm focus-within:ring-2 focus-within:ring-brand-purple focus-within:border-brand-purple transition-all">
                                <input 
                                    type="text" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="ZADEJTE KÓD" 
                                    className="flex-grow bg-transparent border-none py-2 px-3 focus:ring-0 sm:text-sm uppercase placeholder-gray-400 min-w-0"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleApplyCoupon} 
                                    className="bg-brand-purple text-white px-4 py-2 text-sm font-bold hover:bg-opacity-90 transition-colors flex-shrink-0 whitespace-nowrap"
                                >
                                    UPLATNIT
                                </button>
                            </div>
                            {couponMessage && (
                                <p className={`mt-2 text-xs font-medium ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {couponMessage.text}
                                </p>
                            )}
                            {appliedCoupon && (
                                <button type="button" onClick={handleRemoveCoupon} className="mt-1 text-xs text-red-500 hover:underline">Odstranit kód</button>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                             <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded" />
                                </div>
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                                    Souhlasím s <Link to="/obchodni-podminky" className="text-brand-purple hover:underline" target="_blank">obchodními podmínkami</Link> <span className="text-red-500">*</span>
                                </label>
                            </div>
                            {formErrors.terms && <p className="text-red-500 text-xs ml-7">{formErrors.terms}</p>}

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="marketing" type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded" />
                                </div>
                                <label htmlFor="marketing" className="ml-3 text-sm text-gray-600">
                                    Zákazník SOUHLASÍ se zveřejněním produktů pro reklamní účely
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-brand-pink py-4 rounded-md text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg shadow-md">
                            {isSubmitting ? 'Odesílám...' : 'Dokončit nákup'}
                        </button>
                        {submitError && <p className="mt-4 text-red-600 text-center text-sm font-medium">{submitError}</p>}
                    </div>
                </div>
            </form>
        </PageWrapper>
    );
};

export default CheckoutPage;
