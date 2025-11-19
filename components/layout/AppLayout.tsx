import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ProtectedRoute } from '../auth/ProtectedRoute';

// Import pages
import HomePage from '../../pages/HomePage';
import ProductsPage from '../../pages/ProductsPage';
import ProductDetailPage from '../../pages/ProductDetailPage';
import HowItWorksPage from '../../pages/HowItWorksPage';
import ContactPage from '../../pages/ContactPage';
import CheckoutPage from '../../pages/CheckoutPage';
import OrderConfirmationPage from '../../pages/OrderConfirmationPage';
import TermsPage from '../../pages/TermsPage';
import PrivacyPage from '../../pages/PrivacyPage';
import ShippingPage from '../../pages/ShippingPage';
import AdminLoginPage from '../../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import AdminProductEditPage from '../../pages/admin/AdminProductEditPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppLayout: React.FC = () => {
    const { loading } = useProducts();

    useEffect(() => {
        if (window.emailjs) {
            window.emailjs.init({publicKey: 'sVd3x5rH1tZu6JGUR'});
        } else {
            console.error("EmailJS script not loaded.");
        }
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Načítání...</div>;
    }

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
                    <Route path="/dekujeme" element={<OrderConfirmationPage />} />
                    <Route path="/obchodni-podminky" element={<TermsPage />} />
                    <Route path="/ochrana-udaju" element={<PrivacyPage />} />
                    <Route path="/doprava" element={<ShippingPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<ProtectedRoute />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="product/:id" element={<AdminProductEditPage />} />
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    );
}