import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
      <CartProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </ProductProvider>
      </CartProvider>
  );
}

export default App;
