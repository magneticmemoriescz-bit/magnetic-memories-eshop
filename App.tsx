
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <ProductProvider>
          <HashRouter>
            <AppLayout />
          </HashRouter>
        </ProductProvider>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
