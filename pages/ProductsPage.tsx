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
                {/* FIX: Changed from grid to a centered flex layout */}
                <div className="mt-12 flex flex-wrap justify-center gap-8">
                    {products.map((product, index) => (
                        <div key={product.id} className="w-full max-w-sm flex">
                            <ProductCard 
                                product={product}
                                buttonStyle={buttonStyles[index % buttonStyles.length]}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
