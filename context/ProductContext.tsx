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
      const storedProductsJSON = localStorage.getItem('products');
      const initialProductsMap = new Map(INITIAL_PRODUCTS.map(p => [p.id, p]));
      let finalProducts: Product[] = [];
      let needsUpdateInStorage = false;

      if (storedProductsJSON) {
        const storedProducts: Product[] = JSON.parse(storedProductsJSON);
        const processedIds = new Set<string>();

        // Iterate stored products to preserve user changes and order
        for (const storedProduct of storedProducts) {
            const initialProduct = initialProductsMap.get(storedProduct.id);
            if (initialProduct) {
                // Product is defined in code. Sync its variants.
                // This preserves any other edits (price, name, etc.) from the admin panel.
                if (JSON.stringify(storedProduct.variants) !== JSON.stringify(initialProduct.variants)) {
                    storedProduct.variants = initialProduct.variants;
                    needsUpdateInStorage = true;
                }
                finalProducts.push(storedProduct);
            } else {
                // This is a custom product created by the user via admin, keep it.
                finalProducts.push(storedProduct);
            }
            processedIds.add(storedProduct.id);
        }

        // Add any new products from the code that weren't in storage yet
        for (const [id, initialProduct] of initialProductsMap.entries()) {
            if (!processedIds.has(id)) {
                finalProducts.push(initialProduct);
                needsUpdateInStorage = true;
            }
        }
      } else {
        // No products in storage, so we use the initial list.
        finalProducts = INITIAL_PRODUCTS;
        needsUpdateInStorage = true; // Needs to be saved to localStorage for the first time
      }

      if (needsUpdateInStorage) {
        localStorage.setItem('products', JSON.stringify(finalProducts));
      }
      
      setProducts(finalProducts);

    } catch (error) {
      console.error("Failed to load or migrate products from localStorage", error);
      // In case of any error, fallback to the default products from the code.
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []); // The empty dependency array ensures this logic runs only once on initial app load.

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
