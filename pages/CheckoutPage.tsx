
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
        firstName: '', lastName: '', email: '', phone: '', street: '', city: '', zip: '', additionalInfo: '',
    });
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
    
    const generateOrderNumber = (): string => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        const vs = order.orderNumber;
        const currentDate = new Date().toLocaleDateString('cs-CZ');
        const styleTable = 'width: 100%; border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; font-size: 14px;';
        const styleTh = 'text-align: left; padding: 12px; background-color: #f3f4f6; color: #374151; border-bottom: 2px solid #e5e7eb; font-weight: bold;';
        const styleTd = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: top;';
        const styleTdPrice = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right; font-weight: bold; white-space: nowrap;';
        const styleBox = 'background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 20px;';
        const styleTdTotal = 'padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; background-color: #f9fafb;';

        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `<div style="${styleBox}"><h3 style="margin-top: 0; color: #8D7EEF; font-size: 16px;">Platební instrukce</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 4px 0; color: #6b7280;">Číslo účtu:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">3524601011/3030</td></tr><tr><td style="padding: 4px 0; color: #6b7280;">Částka:</td><td style="padding: 4px 0; font-weight: bold; color: #EA5C9D; font-size: 16px;">${formatPrice(order.total)} Kč</td></tr><tr><td style="padding: 4px 0; color: #6b7280;">Variabilní symbol:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">${vs}</td></tr></table></div>`;
        }

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
            let photosHtml = '<div style="margin-top: 12px;">';
            item.photos.forEach((photo, idx) => {
                photosHtml += `<div style="margin-bottom: 8px;"><a href="${photo.url}" target="_blank" style="display: inline-block; background-color: #8D7EEF; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: bold;">FOTKA ${idx + 1}</a></div>`;
            });
            photosHtml += '</div>';
            
            itemsHtml += `<tr><td style="${styleTd}"><strong style="color: #111827;">${item.product.name}</strong>${variantInfo}${photosHtml}</td><td style="${styleTd} text-align: center;">${item.quantity}</td><td style="${styleTdPrice}">${formatPrice(itemPriceTotal)} Kč</td></tr>`;
        });
        
        itemsHtml += `<tr><td style="${styleTdTotal}">CELKEM ZA ZBOŽÍ</td><td style="${styleTdTotal} text-align: center;">${totalItemsQuantity}</td><td style="${styleTdTotal} text-align: right;">${formatPrice(totalItemsPrice)} Kč</td></tr>`;
        
        let shippingPointInfo = '';
        if (order.shipping === 'zasilkovna_point' && order.packetaPoint) shippingPointInfo = ` (${order.packetaPoint.name})`;

        itemsHtml += `<tr><td style="${styleTd}">Doprava: ${order.shipping}${shippingPointInfo}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.shippingCost)} Kč</td></tr>`;
        itemsHtml += `<tr><td style="${styleTd}">Platba: ${order.payment}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.paymentCost)} Kč</td></tr>`;
        itemsHtml += `<tr style="background-color: #fdf2f8;"><td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold;">CELKEM K ÚHRADĚ</td><td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #831843;">${formatPrice(order.total)} Kč</td></tr></tbody></table>`;

        const fullName = `${order.contact.firstName} ${order.contact.lastName}`;
        const fullAddress = `${order.contact.street}, ${order.contact.city}, ${order.contact.zip}`;

        const templateParams = {
            subject: `Objednávka č. ${order.orderNumber}`,
            order_number: order.orderNumber,
            date: currentDate,
            to_name: fullName,
            to_email: order.contact.email, 
            email: order.contact.email, 
            total_price: formatPrice(order.total) + ' Kč',
            items_html: itemsHtml, 
            payment_details: paymentDetailsHtml,
            customer_header: `<div style="padding: 15px; background: #f3f4f6; border-left: 4px solid #EA5C9D; margin-bottom: 20px;"><strong>Zákazník:</strong> ${fullName}<br><strong>Email:</strong> ${order.contact.email}<br><strong>Telefon:</strong> ${order.contact.phone}<br><strong>Adresa:</strong> ${fullAddress}</div>`
        };
        
        try {
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER, templateParams);
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ADMIN, { ...templateParams, to_name: 'Admin', to_email: 'magnetic.memories.cz@gmail.com' });
        } catch (error) { console.error('Email failed:', error); }
    };
    
    const sendToMakeWebhook = async (order: OrderDetails) => {
        try {
            const payload = {
                orderNumber: order.orderNumber,
                email: order.contact.email,
                total: order.total,
                items: order.items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.price }))
            };
            await fetch(MAKE_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } catch (error) { console.error('Webhook failed:', error); }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: { [key: string]: string } = {};
        if (!formData.firstName) errors.firstName = 'Povinné';
        if (!formData.lastName) errors.lastName = 'Povinné';
        if (!formData.email) errors.email = 'Povinné';
        if (!formData.phone) errors.phone = 'Povinné';
        if (!shippingMethod) errors.shipping = 'Vyberte dopravu';
        if (shippingMethod === 'zasilkovna_point' && !packetaPoint) errors.packetaPoint = 'Vyberte místo';
        if (!termsAccepted) errors.terms = 'Souhlas s podmínkami';
        
        if (Object.keys(errors).length > 0) { setFormErrors(errors); window.scrollTo(0, 0); return; }

        setIsSubmitting(true);
        try {
            const orderNumber = generateOrderNumber();
            const orderDetails: OrderDetails = {
                contact: formData, shipping: shippingMethod!, payment: paymentMethod!, packetaPoint,
                items, total, subtotal, discountAmount, couponCode: appliedCoupon?.code, shippingCost, paymentCost, orderNumber, marketingConsent
            };
            await sendEmailNotifications(orderDetails);
            await sendToMakeWebhook(orderDetails);
            dispatch({ type: 'CLEAR_CART' });
            navigate('/dekujeme', { state: { order: orderDetails } });
        } catch (error) { setSubmitError('Chyba při odesílání.'); } finally { setIsSubmitting(false); }
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
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormInput name="firstName" label="Jméno" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} required />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} required />
                            <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} required />
                            <FormInput name="phone" label="Telefon" type="tel" value={formData.phone} onChange={handleFormChange} error={formErrors.phone} required />
                            <div className="sm:col-span-2">
                                <FormInput name="street" label="Ulice" value={formData.street} onChange={handleFormChange} required />
                            </div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} required />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} required />
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
                            <RadioCard name="shipping" value="osobne" title="Osobní odběr - Turnov (Po domluvě)" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={(e: any) => setShippingMethod(e.target.value)} />
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
                            <div className="flex space-x-2">
                                <input 
                                    type="text" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Kód" 
                                    className="flex-grow border border-gray-300 rounded-md py-2 px-3 focus:ring-brand-purple focus:border-brand-purple sm:text-sm uppercase"
                                />
                                <button type="button" onClick={handleApplyCoupon} className="bg-dark-gray text-white px-4 py-2 rounded-md hover:bg-black transition-colors">Uplatnit</button>
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

                        <div className="mt-8 space-y-3">
                             <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded" />
                                </div>
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                                    Souhlasím s <Link to="/obchodni-podminky" className="text-brand-purple hover:underline" target="_blank">obchodními podmínkami</Link>
                                </label>
                            </div>
                            {formErrors.terms && <p className="text-red-500 text-xs ml-7">{formErrors.terms}</p>}
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
