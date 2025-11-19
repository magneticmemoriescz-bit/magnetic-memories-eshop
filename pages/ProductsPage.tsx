
import React from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';

const buttonStyles = [
    { gradient: 'bg-gradient-to-r from-brand-cyan to-brand-purple', focusRing: 'focus:ring-brand-purple/50' },
    { gradient: 'bg-gradient-to-r from-brand-purple to-brand-pink', focusRing: 'focus:ring-brand-pink/50' },
    { gradient: 'bg-gradient-to-r from-brand-pink to-brand-orange', focusRing: 'focus:ring-brand-orange/50' },
];

const ProductsPage: React.FC = () => {
    const { products } = useProducts();
    return (
        <div className="bg-white">
            <Seo title="Všechny produkty | Magnetic Memories" description="Prohlédněte si naši nabídku magnetických produktů z vlastních fotek." />
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

                <div className="mt-16 text-center border-t border-gray-200 pt-8">
                    <p className="text-lg text-gray-600 mb-4">
                        Hledáte dárek pro vaše klienty nebo reklamní merch?
                    </p>
                    <a
                        href="https://magnetify.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 transition-colors"
                    >
                        Navštívit Magnetify.cz
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
