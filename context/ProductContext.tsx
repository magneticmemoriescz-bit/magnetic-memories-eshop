import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  updateProducts: (newProducts: Product[]) => void;
  exportProducts: () => void;
  importProducts: (file: File) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  }, []);

  const exportProducts = useCallback(() => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'magnetic-memories-products.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [products]);

  const importProducts = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          if (typeof text === 'string') {
            const importedProducts = JSON.parse(text);
            // Basic validation can be added here
            if (Array.isArray(importedProducts)) {
              updateProducts(importedProducts);
              resolve();
            } else {
              reject(new Error("Invalid file format: expected an array of products."));
            }
          }
        } catch (error) {
          console.error("Failed to parse imported file", error);
          reject(new Error("Failed to read or parse the imported file."));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }, [updateProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, updateProducts, exportProducts, importProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
