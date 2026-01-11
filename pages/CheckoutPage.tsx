
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
const EMAILJS_SERVICE_ID = 'service_2pkoish'; // Gmail Service
const EMAILJS_TEMPLATE_ID_USER = 'template_1v2vxgh'; // Pro zákazníka
const EMAILJS_TEMPLATE_ID_ADMIN = 'template_8ax2a2w'; // Pro admina

const DIRECT_MAILING_FEE = 100;

interface OrderDetails {
    contact: { [key: string]: string };
    shipping: string;
    payment: string;
    packetaPoint: any | null;
    balikovnaPoint: any | null;
    pplPoint: any | null;
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
    const [paymentMethod, setPaymentMethod] = useState<string | null>('prevodem'); 
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [balikovnaPoint, setBalikovnaPoint] = useState<any | null>(null);
    const [pplPoint, setPplPoint] = useState<any | null>(null);
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
        'balikovna_point': isFreeShipping ? 0 : 61,
        'balikovna_address': isFreeShipping ? 0 : 88,
        'zasilkovna_point': isFreeShipping ? 0 : 79,
        'zasilkovna_address': isFreeShipping ? 0 : 99,
        'ppl_point': isFreeShipping ? 0 : 79,
        'osobne': 0
    };
    
    const paymentCosts: { [key: string]: number } = {
        'prevodem': 0
    };

    const shippingCost = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const paymentCost = paymentMethod ? paymentCosts[paymentMethod] : 0;
    const total = discountedSubtotal + shippingCost + paymentCost;
    
    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

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

    const openBalikovnaWidget = () => {
        // Balíkovna widget někdy potřebuje chvíli na re-inicializaci po navigaci
        const widget = window.BalikovnaWidget || (window as any).balikovnaWidget;
        if (widget) {
            try {
                widget.open((point: any) => {
                    if (point) {
                        setBalikovnaPoint(point);
                        setFormErrors(prev => ({...prev, balikovnaPoint: ''}))
                    }
                });
            } catch (err) {
                console.error("Balikovna Widget error:", err);
                alert("Nepodařilo se otevřít výběr Balíkovny. Zkuste prosím stránku obnovit (F5).");
            }
        } else {
            alert("Widget Balíkovny nebyl načten. Prosím, obnovte stránku (F5).");
        }
    };

    const openPplWidget = () => {
        const widget = window.pplParcelShopWidget || (window as any).PPLWidget;
        if (widget) {
            try {
                // Novější verze PPL widgetu vyžaduje konfigurační objekt
                widget.open({
                    onSelected: (point: any) => {
                        if (point) {
                            setPplPoint(point);
                            setFormErrors(prev => ({...prev, pplPoint: ''}))
                        }
                    }
                });
            } catch (err) {
                console.error("PPL Widget error:", err);
                // Fallback pro starší verze volání
                try {
                    widget.open((point: any) => {
                        if (point) {
                            setPplPoint(point);
                            setFormErrors(prev => ({...prev, pplPoint: ''}))
                        }
                    });
                } catch (err2) {
                    alert("Nepodařilo se otevřít výběr PPL. Zkuste prosím stránku obnovit (F5).");
                }
            }
        } else {
            alert("Widget PPL nebyl načten. Prosím, obnovte stránku (F5).");
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
            paymentDetailsHtml = `<div style="${styleBox}"><h3 style="margin-top: 0; color: #8D7EEF; font-size: 16px;">Platební instrukce</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 4px 0; color: #6b7280;">Číslo účtu:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">3524601011/3030</td></tr><tr><td style="padding: 4px 0; color: #6b7280;">Částka:</td><td style="padding: 4px 0; font-weight: bold; color: #EA5C9D; font-size: 16px;">${formatPrice(order.total)} Kč</td></tr><tr><td style="padding: 4px 0; color: #6b7280;">Variabilní symbol:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">${vs}</td></tr></table><p style="margin: 12px 0 0 0; font-size: 12px; color: #9ca3af; font-style: italic;">Fakturu Vám zašleme po přijetí platby.</p></div>`;
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
            let mailingInfo = item.directMailing ? `<br><span style="font-size: 12px; color: #EA5C9D; font-weight: bold;">+ Rozesílka na adresy (${formatPrice(itemMailingFeeTotal)} Kč)</span>` : '';
            
            let photosHtml = '<div style="margin-top: 12px;">';
            item.photos.forEach((photo, idx) => {
                const url = photo.url;
                photosHtml += `<div style="margin-bottom: 8px;"><a href="${url}" target="_blank" style="display: inline-block; background-color: #8D7EEF; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #7c6fd0;">STÁHNOUT FOTKU ${idx + 1}</a></div>`;
            });
            photosHtml += '</div>';
            
            itemsHtml += `<tr><td style="${styleTd}"><strong style="color: #111827; font-size: 15px;">${item.product.name}</strong>${variantInfo}${mailingInfo}${photosHtml}</td><td style="${styleTd} text-align: center;">${item.quantity}</td><td style="${styleTdPrice}">${formatPrice(itemPriceTotal)} Kč</td></tr>`;
        });
        
        itemsHtml += `<tr><td style="${styleTdTotal}">CELKEM ZA ZBOŽÍ</td><td style="${styleTdTotal} text-align: center;">${totalItemsQuantity}</td><td style="${styleTdTotal} text-align: right;">${formatPrice(totalItemsPrice)} Kč</td></tr>`;

        if (order.discountAmount > 0) {
            itemsHtml += `<tr><td style="${styleTd} color: #059669;">Sleva (${order.couponCode})</td><td style="${styleTd} text-align: center;">-</td><td style="${styleTdPrice} color: #059669;">-${formatPrice(order.discountAmount)} Kč</td></tr>`;
        }
        
        let shippingPointInfo = '';
        if (order.shipping === 'zasilkovna_point' && order.packetaPoint) shippingPointInfo = ` (${order.packetaPoint.name})`;
        else if (order.shipping === 'balikovna_point' && order.balikovnaPoint) shippingPointInfo = ` (${order.balikovnaPoint.name})`;
        else if (order.shipping === 'ppl_point' && order.pplPoint) shippingPointInfo = ` (${order.pplPoint.name})`;

        itemsHtml += `<tr><td style="${styleTd}">Doprava: ${order.shipping}${shippingPointInfo}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.shippingCost)} Kč</td></tr>`;
        itemsHtml += `<tr><td style="${styleTd}">Platba: ${order.payment}</td><td style="${styleTd} text-align: center;">1</td><td style="${styleTdPrice}">${formatPrice(order.paymentCost)} Kč</td></tr>`;
        itemsHtml += `<tr style="background-color: #fdf2f8;"><td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold; color: #831843; border-top: 2px solid #EA5C9D;">CELKEM K ÚHRADĚ</td><td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #831843; border-top: 2px solid #EA5C9D; white-space: nowrap;">${formatPrice(order.total)} Kč</td></tr></tbody></table>`;

        const consentText = order.marketingConsent 
            ? '✅ Zákazník SOUHLASÍ se zveřejněním produktů pro reklamní účely'
            : '❌ Zákazník NESOUHLASÍ se zveřejněním produktů pro reklamní účely';

        const fullName = `${order.contact.firstName} ${order.contact.lastName}`;
        const fullAddress = `${order.contact.street}, ${order.contact.city}, ${order.contact.zip}`;

        const templateParams = {
            subject: `Objednávka č. ${order.orderNumber}`,
            order_number: order.orderNumber,
            date: currentDate,
            to_name: fullName,
            customer_name: fullName,
            customer_address: fullAddress,
            to_email: order.contact.email, 
            email: order.contact.email, 
            message: order.contact.additionalInfo || 'Bez poznámky',
            total_price: formatPrice(order.total) + ' Kč',
            items_html: itemsHtml, 
            payment_details: paymentDetailsHtml,
            street: order.contact.street,
            city: order.contact.city,
            zip: order.contact.zip,
            phone: order.contact.phone,
            reply_to: 'magnetic.memories.cz@gmail.com',
            marketing_consent: consentText,
            customer_info: `${fullName}\n${order.contact.email}\n${order.contact.phone}\n${fullAddress}`,
            customer_header: `<div style="padding: 15px; background: #f3f4f6; border-left: 4px solid #EA5C9D; margin-bottom: 20px;"><strong>Zákazník:</strong> ${fullName}<br><strong>Email:</strong> ${order.contact.email}<br><strong>Telefon:</strong> ${order.contact.phone}<br><strong>Adresa:</strong> ${fullAddress}</div>`
        };
        
        const adminTemplateParams = {
            ...templateParams,
            subject: `NOVÁ OBJEDNÁVKA: ${order.orderNumber} - ${order.contact.lastName} (${formatPrice(order.total)} Kč)`,
            to_name: fullName, 
            to_email: 'magnetic.memories.cz@gmail.com',
            email: order.contact.email
        };

        try {
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER, templateParams);
            await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ADMIN, adminTemplateParams);
        } catch (error: any) {
            console.error('Email failed:', error);
        }
    };
    
    const sendToMakeWebhook = async (order: OrderDetails) => {
        try {
            const fname = (order.contact['firstName'] || '').trim();
            const lname = (order.contact['lastName'] || '').trim();
            const fullName = `${fname} ${lname}`.trim() || 'Zákazník';

            const payload = {
                name: fullName,
                customer_name: fullName,
                email: order.contact['email'] || '',
                phone: order.contact['phone'] || '',
                street: order.contact['street'] || '',
                city: order.contact['city'] || '',
                zip: order.contact['zip'] || '',
                firstName: fname,
                lastName: lname,
                orderNumber: order.orderNumber,
                orderDate: new Date().toISOString(),
                shippingMethod: order.shipping,
                shippingCost: Number(order.shippingCost),
                packetaPoint: order.packetaPoint?.name || '',
                balikovnaPoint: order.balikovnaPoint?.name || '',
                pplPoint: order.pplPoint?.name || '',
                paymentMethod: order.payment,
                paymentCost: Number(order.paymentCost),
                total: Number(order.total),
                subtotal: Number(order.subtotal),
                discountAmount: Number(order.discountAmount),
                couponCode: order.couponCode || '',
                marketingConsent: order.marketingConsent,
                additionalInfo: order.contact['additionalInfo'] || '',
                items: order.items.map(item => {
                    const piecesInPackage = item.variant?.itemCount || 1;
                    const totalPieces = piecesInPackage * item.quantity;
                    const itemMailingFeeTotal = item.directMailing ? (DIRECT_MAILING_FEE * totalPieces) : 0;
                    const itemPriceTotal = (item.price * item.quantity) + itemMailingFeeTotal;
                    
                    return {
                        product_code: (item.product.id || 'PRODUCT') + (item.variant ? `-${item.variant.id}` : '') + (item.directMailing ? '-MAILING' : ''),
                        name: (item.product.name || 'Produkt') + (item.variant ? ` - ${item.variant.name}` : '') + (item.directMailing ? ' (+ Rozesílka)' : ''),
                        quantity: Number(item.quantity),
                        unit_price: Number(itemPriceTotal / item.quantity), 
                        vat_rate: 0,
                        photos: item.photos.map(p => p.url)
                    };
                })
            };

            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Make Webhook error response:', errorText);
            }
        } catch (error) {
            console.error('Make Webhook failed:', error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        
        if (shippingMethod === 'zasilkovna_point' && !packetaPoint) errors.packetaPoint = 'Vyberte výdejní místo';
        if (shippingMethod === 'balikovna_point' && !balikovnaPoint) errors.balikovnaPoint = 'Vyberte výdejní místo';
        if (shippingMethod === 'ppl_point' && !pplPoint) errors.pplPoint = 'Vyberte výdejní místo';

        if (!termsAccepted) errors.terms = 'Musíte souhlasit s obchodními podmínkami';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            window.scrollTo(0, 0);
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
                balikovnaPoint,
                pplPoint,
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

            await sendEmailNotifications(orderDetails);
            await sendToMakeWebhook(orderDetails);
            dispatch({ type: 'CLEAR_CART' });
            navigate('/dekujeme', { state: { order: orderDetails } });
        } catch (error) {
            setSubmitError('Neočekávaná chyba při odesílání objednávky.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <PageWrapper title="Váš košík je prázdný">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-8">Vraťte se do obchodu a vyberte si z naší nabídky.</p>
                    <Link to="/produkty" className="inline-block bg-brand-purple text-white py-3 px-8 rounded-md hover:opacity-90">Zpět k nákupu</Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Dokončení objednávky">
            {submitError && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{submitError}</div>}
            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-7 space-y-10">
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
                                <textarea 
                                    name="additionalInfo" 
                                    id="additionalInfo" 
                                    rows={3} 
                                    value={formData.additionalInfo} 
                                    onChange={handleFormChange} 
                                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm placeholder-gray-500 border-brand-purple/20 bg-white"
                                    placeholder="Zde nám můžete nechat vzkaz k objednávce..."
                                ></textarea>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">2. Doprava</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balíkovna</p>
                                <RadioCard name="shipping" value="balikovna_point" title="Na výdejní místo" price={shippingCosts['balikovna_point'] === 0 ? "Zdarma" : `${shippingCosts['balikovna_point']} Kč`} checked={shippingMethod === 'balikovna_point'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                                {shippingMethod === 'balikovna_point' && (
                                    <div className="ml-8 mt-2">
                                        <button type="button" onClick={openBalikovnaWidget} className="text-brand-purple hover:underline font-medium">{balikovnaPoint ? `Vybráno: ${balikovnaPoint.name}` : 'Vybrat výdejní místo Balíkovny'}</button>
                                        {formErrors.balikovnaPoint && <p className="text-red-500 text-sm mt-1">{formErrors.balikovnaPoint}</p>}
                                    </div>
                                )}
                                <RadioCard name="shipping" value="balikovna_address" title="Doručení na adresu" price={shippingCosts['balikovna_address'] === 0 ? "Zdarma" : `${shippingCosts['balikovna_address']} Kč`} checked={shippingMethod === 'balikovna_address'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zásilkovna</p>
                                <RadioCard name="shipping" value="zasilkovna_point" title="Na výdejní místo (Z-Point / Z-Box)" price={shippingCosts['zasilkovna_point'] === 0 ? "Zdarma" : `${shippingCosts['zasilkovna_point']} Kč`} checked={shippingMethod === 'zasilkovna_point'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                                {shippingMethod === 'zasilkovna_point' && (
                                    <div className="ml-8 mt-2">
                                        <button type="button" onClick={openPacketaWidget} className="text-brand-purple hover:underline font-medium">{packetaPoint ? `Vybráno: ${packetaPoint.name}` : 'Vybrat výdejní místo Zásilkovny'}</button>
                                        {formErrors.packetaPoint && <p className="text-red-500 text-sm mt-1">{formErrors.packetaPoint}</p>}
                                    </div>
                                )}
                                <RadioCard name="shipping" value="zasilkovna_address" title="Doručení na adresu" price={shippingCosts['zasilkovna_address'] === 0 ? "Zdarma" : `${shippingCosts['zasilkovna_address']} Kč`} checked={shippingMethod === 'zasilkovna_address'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PPL</p>
                                <RadioCard name="shipping" value="ppl_point" title="Na výdejní místo (Parcelshop / Parcelbox)" price={shippingCosts['ppl_point'] === 0 ? "Zdarma" : `${shippingCosts['ppl_point']} Kč`} checked={shippingMethod === 'ppl_point'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                                {shippingMethod === 'ppl_point' && (
                                    <div className="ml-8 mt-2">
                                        <button type="button" onClick={openPplWidget} className="text-brand-purple hover:underline font-medium">{pplPoint ? `Vybráno: ${pplPoint.name}` : 'Vybrat výdejní místo PPL'}</button>
                                        {formErrors.pplPoint && <p className="text-red-500 text-sm mt-1">{formErrors.pplPoint}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ostatní</p>
                                <RadioCard name="shipping" value="osobne" title="Osobní odběr (Turnov)" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={(e: any) => setShippingMethod(e.target.value)} />
                            </div>
                        </div>
                        {isFreeShipping ? <p className="mt-4 text-sm text-green-600 font-medium">✨ Máte dopravu zdarma!</p> : <p className="mt-2 text-sm text-gray-500">Nakupte ještě za {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} Kč a máte dopravu zdarma.</p>}
                    </section>
                    <section>
                        <h2 className="text-xl font-medium text-dark-gray mb-6 border-b pb-2">3. Platba</h2>
                        <div className="space-y-4">
                            <RadioCard name="payment" value="prevodem" title="Bankovním převodem (předem)" price="Zdarma" checked={paymentMethod === 'prevodem'} onChange={(e: any) => setPaymentMethod(e.target.value)} />
                        </div>
                        {formErrors.payment && <p className="text-red-500 text-sm mt-2">{formErrors.payment}</p>}
                    </section>
                </div>
                <div className="lg:col-span-5 mt-10 lg:mt-0">
                    <div className="bg-gray-50 rounded-lg shadow-md p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-dark-gray mb-4">Souhrn objednávky</h2>
                        <ul className="divide-y divide-gray-200">
                            {items.map((item) => {
                                const piecesInPackage = item.variant?.itemCount || 1;
                                const totalPieces = piecesInPackage * item.quantity;
                                const mailingFee = item.directMailing ? (DIRECT_MAILING_FEE * totalPieces) : 0;
                                const itemTotal = (item.price * item.quantity) + mailingFee;
                                
                                return (
                                    <li key={item.id} className="py-4 flex">
                                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden"><img src={item.variant?.imageUrl || item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" /></div>
                                        <div className="ml-4 flex-1 flex flex-col">
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3 className="pr-4">{item.product.name}</h3>
                                                <p className="ml-4 whitespace-nowrap">{formatPrice(itemTotal)} Kč</p>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between text-sm">
                                                <div className="text-gray-500 mt-1">
                                                    <p>Množství: {item.quantity}</p>
                                                    {item.variant && <p className="text-xs">Varianta: {item.variant.name}</p>}
                                                    {item.directMailing && <p className="text-xs text-brand-pink font-medium">+ Rozesílka na adresy</p>}
                                                </div>
                                                <div className="mt-2 text-right">
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="font-medium text-brand-pink hover:text-brand-orange">Odstranit</button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="py-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700">Slevový kód</label>
                            <div className="mt-1 flex gap-2">
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={!!appliedCoupon} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder="Vložte kód" />
                                {appliedCoupon ? <button type="button" onClick={handleRemoveCoupon} className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium">Zrušit</button> : <button type="button" onClick={handleApplyCoupon} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Použít</button>}
                            </div>
                            {couponMessage && <p className={`mt-2 text-sm ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMessage.text}</p>}
                        </div>
                        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Mezisoučet</span><span>{formatPrice(subtotal)} Kč</span></div>
                            {appliedCoupon && <div className="flex justify-between text-green-600"><span>Sleva {Math.round(appliedCoupon.rate * 100)}%</span><span>-{formatPrice(discountAmount)} Kč</span></div>}
                            <div className="flex justify-between"><span>Doprava</span><span>{shippingMethod ? `${shippingCost} Kč` : '–'}</span></div>
                            <div className="flex justify-between"><span>Platba</span><span>{paymentMethod ? `${paymentCost} Kč` : '–'}</span></div>
                            <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900"><span>Celkem k úhraně</span><span>{formatPrice(total)} Kč</span></div>
                        </div>
                        <div className="mt-6 space-y-3">
                             <div className="flex items-start">
                                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-brand-purple border-gray-300 rounded" />
                                <label htmlFor="terms" className="ml-3 text-sm font-medium text-gray-700">Souhlasím s <Link to="/obchodni-podminky" target="_blank" className="text-brand-purple underline">obchodními podmínkami</Link> *</label>
                            </div>
                            {formErrors.terms && <p className="text-red-500 text-xs">{formErrors.terms}</p>}
                            <div className="flex items-start">
                                <input id="marketing" type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="h-4 w-4 text-brand-purple border-gray-300 rounded" />
                                <label htmlFor="marketing" className="ml-3 text-sm text-gray-500">
                                    Souhlasím se zveřejněním produktů pro reklamní účely (např. na sociálních sítích)
                                </label>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r from-brand-pink to-brand-orange rounded-md shadow-sm py-3 text-base font-medium text-white hover:opacity-90 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
