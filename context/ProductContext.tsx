import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { sanityClient } from '../sanity/client';
import { Product } from '../types';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: Error | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// GROQ (GraphQL-like query language for JSON) dotaz pro načtení produktů
const productQuery = `*[_type == "product"] | order(orderRank) {
  _id,
  name,
  "id": slug.current,
  price,
  description,
  shortDescription,
  "imageUrl": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  requiredPhotos,
  hasTextFields,
  variants[] {
    _key,
    "id": _key,
    name,
    photoCount,
    price,
    "imageUrl": image.asset->url
  }
}`;


export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        sanityClient.fetch<Product[]>(productQuery)
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products from Sanity:", err);
                setError(err);
                setLoading(false);
            });
    }, []);

    return (
        <ProductContext.Provider value={{ products, loading, error }}>
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
