import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CartItem } from '../types';
import { formatPrice } from '../utils/format';
import { Seo } from '../components/Seo';

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

const OrderConfirmationPage: React.FC = () => {
    const location = useLocation();
    const order = location.state?.order as OrderDetails | undefined;

    useEffect(() => {
        if (order) {
            if (typeof window.gtag === 'function') {
                // 1. GA4 Purchase Event (Standard)
                window.gtag('event', 'purchase', {
                    transaction_id: order.orderNumber,
                    value: order.total,
                    currency: 'CZK',
                    shipping: order.shippingCost,
                    items: order.items.map(item => ({
                        item_id: item.product.id,
                        item_name: item.product.name,
                        variant: item.variant?.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });

                // 2. Google Ads Conversion Event (Specific Label)
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-17736455369/-ppHCPrL-sIbEMmps4lC',
                    'value': order.total,
                    'currency': 'CZK',
                    'transaction_id': order.orderNumber
                });
            }
        }
    }, [order]);

    if (!order) {
        // Redirect to home if there is no order data, e.g., direct access to URL
        return <Navigate to="/" replace />;
    }

    return (
        <PageWrapper title="Objednávka dokončena!">
            <Seo title="Děkujeme za objednávku" description="Vaše objednávka byla úspěšně přijata." />
            <div className="text-center py-10 px-6 bg-green-50 rounded-lg">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-3xl font-semibold text-dark-gray">Děkujeme za Váš nákup!</h3>
                <p className="mt-2 text-gray-600 max-w-lg mx-auto">
                    Vaše objednávka č. <strong className="text-dark-gray">{order.orderNumber}</strong> byla úspěšně přijata. Potvrzení jsme Vám odeslali na email.
                </p>
            </div>

            {order.payment === 'prevodem' && (
                <div className="mt-10 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-dark-gray text-center mb-6">Platební údaje</h3>
                    <div className="space-y-4 text-center">
                        <p>Pro dokončení objednávky, prosím, proveďte platbu. Všechny potřebné informace jsme Vám zaslali do emailu.</p>
                        <div>
                            <p className="text-sm text-gray-500">Číslo účtu:</p>
                            <p className="text-lg font-semibold text-dark-gray">3524601011/3030</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Částka:</p>
                            <p className="text-lg font-semibold text-dark-gray">{formatPrice(order.total)} Kč</p>
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
};

export default OrderConfirmationPage;
