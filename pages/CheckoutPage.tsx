
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FormInput } from '../components/forms/FormInput';
import { RadioCard } from '../components/forms/RadioCard';
import { MAKE_WEBHOOK_URL } from '../constants';
import { formatPrice } from '../utils/format';

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
    marketingConsent: boolean;
}

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
        street: '',
        city: '',
        zip: '',
        additionalInfo: '',
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // New checkboxes state
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);

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
        const vs = order.orderNumber;
        const invoiceNoticeHtml = `<p style="margin-top:20px; color: #555;">Fakturu (daňový doklad) Vám zašleme v samostatném e-mailu.</p>`;
        
        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h2 style="border-bottom: 2px solid #8D7EEF; padding-bottom: 10px; margin-bottom: 20px;">Platební instrukce</h2>
                    <p>Pro dokončení objednávky prosím uhraďte částku <strong>${formatPrice(order.total)} Kč</strong> na níže uvedený účet.</p>
                    <table style="width: 100%; max-width: 400px; margin: 20px auto; text-align: left;">
                       <tr><td style="padding: 5px;">Číslo účtu:</td><td style="padding: 5px; font-weight: bold;">3524601011/3030</td></tr>
                       <tr><td style="padding: 5px;">Částka:</td><td style="padding: 5px; font-weight: bold;">${formatPrice(order.total)} Kč</td></tr>
                       <tr><td style="padding: 5px;">Variabilní symbol:</td><td style="padding: 5px; font-weight: bold;">${vs}</td></tr>
                    </table>
                </div>`;
        }
        
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">${item.product.name} ${item.variant ? `(${item.variant.name})` : ''} ${item.orientation ? `(${item.orientation === 'portrait' ? 'na výšku' : 'na šířku'})` : ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(item.price * item.quantity)} Kč</td>
            </tr>`).join('');
        
        const photosConfirmationHtml = order.items.some(item => item.photos && item.photos.length > 0) ? `<p style="margin-top: 20px;">Vaše fotografie byly úspěšně přijaty a budou použity pro výrobu.</p>` : '';
        const shippingMethodMap: {[key: string]: string} = { zasilkovna: 'Zásilkovna', posta: 'Česká pošta', osobne: 'Osobní odběr'};
        const paymentMethodMap: {[key: string]: string} = { prevodem: 'Bankovním převodem', dobirka: 'Na dobírku'};
        const additionalInfoHtml = order.contact.additionalInfo ? `<h3 style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">Doplňující informace od zákazníka:</h3><p style="padding: 10px; background-color: #f9f9f9; border-radius: 8px;">${order.contact.additionalInfo.replace(/\n/g, '<br>')}</p>` : '';
        
        const marketingConsentHtml = order.marketingConsent ? `<p style="margin-top: 10px; color: green;"><strong>Zákazník souhlasí se zveřejněním produktů pro reklamní účely.</strong></p>` : `<p style="margin-top: 10px; color: grey;">Zákazník nesouhlasí se zveřejněním produktů.</p>`;

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
            reply_to: 'objednavky@magnetify.cz', // When customer replies, it goes to you
            order_number: order.orderNumber,
            first_name: order.contact.firstName,
            items_html: itemsHtml,
            subtotal: formatPrice(order.subtotal),
            shipping_cost: formatPrice(order.shippingCost),
            payment_cost: formatPrice(order.paymentCost),
            total: formatPrice(order.total),
            photos_confirmation_html: photosConfirmationHtml,
            payment_details_html: paymentDetailsHtml + invoiceNoticeHtml,
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
                    : ``;

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
            // 'email' is usually mapped to 'To Email' in EmailJS template.
            // We use the domain email here as the destination.
            email: 'objednavky@magnetify.cz', 
            // 'reply_to' must be the customer's email so you can reply to them.
            reply_to: order.contact.email, 
            // 'from_name' helps avoid spam filters by identifying the system
            from_name: 'Magnetic Memories System',
            // 'to_name' helps identify the recipient
            to_name: 'Admin',
            
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
                    <p>Mezisoučet: ${formatPrice(order.subtotal)} Kč</p>
                    <p>Doprava: ${formatPrice(order.shippingCost)} Kč</p>
                    <p>Platba: ${formatPrice(order.paymentCost)} Kč</p>
                    <h3 style="margin-top: 5px;">Celkem: ${formatPrice(order.total)} Kč</h3>
                </div>`,
            photos_html: ownerPhotosSectionHtml,
            additional_info_html: additionalInfoHtml + marketingConsentHtml,
            invoice_html: invoiceNoticeHtml,
        };
        
        // Using Gmail service (service_2pkoish) because it works more reliably without advanced DNS setup
        try {
            await window.emailjs.send('service_2pkoish', 'template_8ax2a2w', ownerParams);
        } catch (e) {
            console.warn('Failed to send owner email notification', e);
        }
        await window.emailjs.send('service_2pkoish', 'template_1v2vxgh', customerParams);
    };
    
    const triggerMakeWebhook = (order: OrderDetails) => {
        if (!MAKE_WEBHOOK_URL) {
            console.warn("Make.com Webhook URL is not configured. Skipping invoice generation.");
            return;
        }

        // Create a lean, clean payload for Fakturoid
        const invoiceItems = order.items.map(item => ({
            name: `${item.product.name}${item.variant ? ` - ${item.variant.name}` : ''}`,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.price) || 0,
        }));

        if (order.shippingCost > 0) {
            invoiceItems.push({
                name: 'Doprava',
                quantity: 1,
                unit_price: Number(order.shippingCost),
            });
        }

        if (order.paymentCost > 0) {
            invoiceItems.push({
                name: 'Platba',
                quantity: 1,
                unit_price: Number(order.paymentCost),
            });
        }

        const payload = {
            orderNumber: order.orderNumber,
            contact: {
                firstName: order.contact.firstName,
                lastName: order.contact.lastName,
                email: order.contact.email,
                street: order.contact.street,
                city: order.contact.city,
                zip: order.contact.zip,
            },
            items: invoiceItems,
        };
        
        // Using keepalive: true to ensure the request completes even if the page unloads
        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(error => {
            console.error("Failed to send data to Make.com webhook:", error);
        });
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
        if (!termsAccepted) errors.terms = 'Musíte souhlasit s obchodními podmínkami.';
        
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
                orderNumber: orderNumber,
                marketingConsent: marketingConsent
            };
            
            try {
                await sendEmailNotifications(orderDetails);
                // Await the webhook trigger slightly to ensure browser processes it before navigation
                await triggerMakeWebhook(orderDetails);
                
                dispatch({ type: 'CLEAR_CART' });
                navigate('/dekujeme', { state: { order: orderDetails } });
            } catch (error: any) {
                console.error("Failed to send emails:", error);
                setSubmitError(`Odeslání objednávky se nezdařilo. Zkuste to prosím znovu. (Chyba: ${error.text || 'Neznámá chyba'})`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    if (items.length === 0) {
        return (
            <PageWrapper title="Nákupní košík">
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600">Váš košík je prázdný.</p>
                    <Link to="/produkty" className="mt-6 inline-block bg-brand-pink text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105">
                        Pokračovat v nákupu
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center mb-12">Váš nákupní košík</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7 bg-white p-8 rounded-lg shadow-lg">
                        <h2 id="contact-details-heading" className="text-2xl font-bold text-dark-gray mb-6">Kontaktní údaje</h2>
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <FormInput name="firstName" label="Křestní jméno" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} required />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} required />
                            <div className="sm:col-span-2">
                                <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} required />
                            </div>
                             <div className="sm:col-span-2">
                                <FormInput name="street" label="Ulice a č.p." value={formData.street} onChange={handleFormChange} error={formErrors.street} required />
                            </div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} error={formErrors.city} required />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} error={formErrors.zip} required />
                        </div>
                        
                        <div className="mt-8">
                            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Doplňující informace</label>
                            <textarea id="additionalInfo" name="additionalInfo" rows={3} value={formData.additionalInfo} onChange={handleFormChange} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm border-brand-purple/20 bg-brand-purple/10 placeholder-gray-500"></textarea>
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-dark-gray mb-6">Doprava</h2>
                            <div className="space-y-4">
                               <RadioCard name="shipping" value="zasilkovna" checked={shippingMethod === 'zasilkovna'} onChange={() => { setShippingMethod('zasilkovna'); setFormErrors(p => ({...p, shipping: ''})) }} title="Zásilkovna - Výdejní místo" price={`${shippingCosts.zasilkovna} Kč`} />
                                {shippingMethod === 'zasilkovna' && (
                                    <div className="pl-4">
                                        <button type="button" onClick={openPacketaWidget} className="text-brand-purple font-medium hover:opacity-80">
                                            {packetaPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
                                        </button>
                                        {packetaPoint && <p className="mt-2 text-sm text-gray-600">{packetaPoint.name}, {packetaPoint.street}, {packetaPoint.city}</p>}
                                        {formErrors.packetaPoint && <p className="text-sm text-red-500 mt-1">{formErrors.packetaPoint}</p>}
                                    </div>
                                )}
                                <RadioCard name="shipping" value="posta" checked={shippingMethod === 'posta'} onChange={() => { setShippingMethod('posta'); setFormErrors(p => ({...p, shipping: ''})) }} title="Česká pošta - Balík Do ruky" price={`${shippingCosts.posta} Kč`} />
                                <RadioCard name="shipping" value="osobne" checked={shippingMethod === 'osobne'} onChange={() => { setShippingMethod('osobne'); setFormErrors(p => ({...p, shipping: ''})) }} title="Osobní odběr - Turnov" price="Zdarma" />
                                {formErrors.shipping && <p className="text-sm text-red-500">{formErrors.shipping}</p>}
                            </div>
                        </div>

                        <div className="mt-8">
                             <h2 className="text-2xl font-bold text-dark-gray mb-6">Platba</h2>
                             <div className="space-y-4">
                                <RadioCard name="payment" value="prevodem" checked={paymentMethod === 'prevodem'} onChange={() => { setPaymentMethod('prevodem'); setFormErrors(p => ({...p, payment: ''})) }} title="Bankovním převodem" price="Zdarma" />
                                <RadioCard name="payment" value="dobirka" checked={paymentMethod === 'dobirka'} onChange={() => { setPaymentMethod('dobirka'); setFormErrors(p => ({...p, payment: ''})) }} title="Na dobírku" price={`${paymentCosts.dobirka} Kč`} />
                                {formErrors.payment && <p className="text-sm text-red-500">{formErrors.payment}</p>}
                            </div>
                        </div>
                        
                        {/* New Checkboxes Section */}
                        <div className="mt-8 space-y-4">
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => { setTermsAccepted(e.target.checked); setFormErrors(p => ({...p, terms: ''})) }}
                                        className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        Souhlasím s <Link to="/obchodni-podminky" target="_blank" className="text-brand-purple hover:text-brand-pink underline">obchodními podmínkami</Link> <span className="text-red-500">*</span>
                                    </label>
                                    {formErrors.terms && <p className="text-red-500 mt-1">{formErrors.terms}</p>}
                                </div>
                            </div>
                            
                            <div className="relative flex items-start">
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
                                    <label htmlFor="marketing" className="font-medium text-gray-700">
                                        Souhlasím se zveřejněním mnou objednaných produktů pro reklamní účely (dobrovolné)
                                    </label>
                                </div>
                            </div>
                        </div>

                    </section>
                    
                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-16 bg-light-gray rounded-lg shadow-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                        <h2 id="summary-heading" className="text-2xl font-bold text-dark-gray">Souhrn objednávky</h2>
                        <ul role="list" className="mt-6 divide-y divide-gray-200">
                            {items.map(item => (
                                <li key={item.id} className="flex py-6 space-x-6">
                                    <img src={item.product.imageUrl} alt={item.product.name} className="flex-none w-24 h-24 object-cover rounded-md"/>
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm"><Link to={`/produkty/${item.product.id}`} className="font-medium text-dark-gray hover:text-brand-purple">{item.product.name}</Link></h3>
                                            {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                                            {item.orientation && <p className="text-xs text-gray-500">{item.orientation === 'portrait' ? 'Na výšku' : 'Na šířku'}</p>}
                                        </div>
                                        <div className="flex items-center border border-gray-300 rounded-md w-fit mt-2">
                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-l-md">-</button>
                                            <span className="px-3 py-1 text-center text-sm">{item.quantity}</span>
                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-r-md">+</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col items-end justify-between">
                                        <p className="text-sm font-medium text-dark-gray">{formatPrice(item.price * item.quantity)} Kč</p>
                                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-xs font-medium text-brand-purple hover:opacity-80">Odstranit</button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Mezisoučet</dt><dd className="text-sm font-medium text-dark-gray">{formatPrice(subtotal)} Kč</dd></div>
                            <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Doprava</dt><dd className="text-sm font-medium text-dark-gray">{formatPrice(shippingCost)} Kč</dd></div>
                             <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Platba</dt><dd className="text-sm font-medium text-dark-gray">{formatPrice(paymentCost)} Kč</dd></div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4"><dt className="text-base font-medium text-dark-gray">Celkem</dt><dd className="text-base font-medium text-dark-gray">{formatPrice(total)} Kč</dd></div>
                        </dl>
                        
                        <div className="mt-6">
                            {submitError && <p className="text-red-500 text-sm text-center mb-4">{submitError}</p>}
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

export default CheckoutPage;
