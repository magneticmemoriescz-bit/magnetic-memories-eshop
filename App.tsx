import React from 'react';
import { HashRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <CartProvider>
      <ProductProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </ProductProvider>
    </CartProvider>
  );
}

export default App;
