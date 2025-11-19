
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  useEffect(() => {
      if (window.emailjs) {
          console.log("Initializing EmailJS...");
          window.emailjs.init({publicKey: 'sVd3x5rH1tZu6JGUR'});
      } else {
          console.error("EmailJS script not loaded.");
      }
  }, []);

  return (
    <HelmetProvider>
      <CartProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </ProductProvider>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
