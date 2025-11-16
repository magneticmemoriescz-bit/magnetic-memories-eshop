import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FormInput } from '../components/forms/FormInput';
import { RadioCard } from '../components/forms/RadioCard';

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
        if (!window.jspdf) {
            throw new Error("jsPDF library is not loaded.");
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        };

        try {
            const fontUrl = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';
            const response = await fetch(fontUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch font: ${response.statusText}`);
            }
            const fontBuffer = await response.arrayBuffer();
            const fontBase64 = arrayBufferToBase64(fontBuffer);
            
            doc.addFileToVFS('DejaVuSans.ttf', fontBase64);
            doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
            doc.setFont('DejaVuSans');
        } catch (error) {
            console.error("CRITICAL: Failed to load custom font for PDF.", error);
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

        doc.setFontSize(22);
        doc.text('Faktura - daňový doklad', col1, y);
        y += 15;

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

        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        doc.text(`Číslo faktury: ${order.orderNumber}`, col1, y);
        doc.text(`Variabilní symbol: ${order.orderNumber}`, col1, y + 5);
        
        const issueDate = new Date().toLocaleDateString('cs-CZ');
        const dueDate = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('cs-CZ');
        doc.text(`Datum vystavení: ${issueDate}`, col2, y);
        doc.text(`Datum splatnosti: ${dueDate}`, col2, y + 5);
        
        y += 15;
        checkY(0);

        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        
        doc.setFontSize(10);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, pageWidth - (2 * margin), 8, 'F');
        doc.text('Popis položky', col1 + 2, y);
        doc.text('Počet', 130, y, { align: 'center' });
        doc.text('Cena/ks', 155, y, { align: 'right' });
        doc.text('Celkem', pageWidth - margin - 2, y, { align: 'right' });
        
        y += 10;
        
        order.items.forEach(item => {
            checkY(10);
            const itemName = `${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}`;
            const lines = doc.splitTextToSize(itemName, 90);
            doc.text(lines, col1 + 2, y);
            doc.text(item.quantity.toString(), 130, y, { align: 'center' });
            doc.text(`${item.price} Kč`, 155, y, { align: 'right' });
            doc.text(`${item.price * item.quantity} Kč`, pageWidth - margin - 2, y, { align: 'right' });
            const lineIncrement = lines.length * 5;
            y += (lineIncrement > 10 ? lineIncrement : 10);
        });

        checkY(5);

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
        y += 6;

        checkY(6);
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

        paymentDetailsHtml += invoiceDownloadLinkHtml;

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
            payment_details_html: paymentDetailsHtml,
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
                console.error("Failed to send emails:", error);
                setSubmitError(`Odeslání objednávky se nezdařilo. Zkuste to prosím znovu. Pokud problém přetrvává, kontaktujte nás. (Chyba: ${error.text || error.message || 'Neznámá chyba'})`);
            } finally {
                setIsSubmitting(false);
            }
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
                    <p className="mt-2 text-gray-600 max-w-lg mx-auto">Vaše objednávka č. <strong className="text-dark-gray">{submittedOrder.orderNumber}</strong> byla úspěšně přijata. Potvrzení s odkazem na fakturu jsme Vám odeslali na email.</p>
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
                                <p className="text-lg font-semibold text-dark-gray">{submittedOrder.orderNumber}</p>
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
                               <RadioCard name="payment" value="dobirka" checked={paymentMethod === 'dobirka'} onChange={(e) => setPaymentMethod(e.target.value)} title="Na dobírku" price="20 Kč"/>
                            </div>
                        </div>
                    </section>

                    {/* Order summary */}
                    <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                        <h2 className="text-lg font-medium text-dark-gray">Souhrn objednávky</h2>
                        <ul role="list" className="divide-y divide-gray-200">
                           {items.map(item => (
                               <li key={item.id} className="flex py-6 space-x-4">
                                   <img src={item.product.imageUrl} alt={item.product.name} className="flex-none w-24 h-24 rounded-md object-cover" />
                                   <div className="flex flex-col justify-between flex-auto">
                                       <div>
                                           <h3 className="font-medium text-dark-gray">{item.product.name}</h3>
                                           <p className="text-sm text-gray-500">
                                               {item.variant?.name}
                                               {item.orientation === 'portrait' ? ' (na výšku)' : item.orientation === 'landscape' ? ' (na šířku)' : ''}
                                           </p>
                                       </div>
                                       <div className="flex items-baseline justify-between mt-2">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                               <button
                                                   type="button"
                                                   onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                   className="px-3 py-1 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-l-md"
                                                   aria-label={`Snížit počet kusů ${item.product.name}`}
                                               >
                                                   -
                                               </button>
                                               <span className="px-4 py-1 text-center text-dark-gray font-medium">{item.quantity}</span>
                                               <button
                                                   type="button"
                                                   onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                   className="px-3 py-1 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-r-md"
                                                   aria-label={`Zvýšit počet kusů ${item.product.name}`}
                                               >
                                                   +
                                               </button>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-medium text-dark-gray">{item.price * item.quantity} Kč</p>
                                               <button onClick={() => handleRemoveItem(item.id)} type="button" className="text-sm font-medium text-brand-purple hover:opacity-80">
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
                            {submitError && <p className="text-red-600 text-sm text-center mb-4">{submitError}</p>}
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
