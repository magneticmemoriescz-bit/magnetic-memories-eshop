import React from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';

const buttonStyles = [
    { gradient: 'bg-gradient-to-r from-brand-cyan to-brand-purple', focusRing: 'focus:ring-brand-purple/50' },
    { gradient: 'bg-gradient-to-r from-brand-purple to-brand-pink', focusRing: 'focus:ring-brand-pink/50' },
    { gradient: 'bg-gradient-to-r from-brand-pink to-brand-orange', focusRing: 'focus:ring-brand-orange/50' },
];

const ProductsPage: React.FC = () => {
    const { products } = useProducts();
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center">Všechny produkty</h1>
                <div className="mt-12 grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                    {products.map((product, index) => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            buttonStyle={buttonStyles[index % buttonStyles.length]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
