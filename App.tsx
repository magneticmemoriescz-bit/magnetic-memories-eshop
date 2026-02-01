
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AppLayout } from './components/layout/AppLayout';

function App() {
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
