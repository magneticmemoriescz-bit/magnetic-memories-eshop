
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { Logo } from '../components/Logo';

const buttonStyles = [
    { gradient: 'bg-gradient-to-r from-brand-cyan to-brand-purple', focusRing: 'focus:ring-brand-purple/50' },
    { gradient: 'bg-gradient-to-r from-brand-purple to-brand-pink', focusRing: 'focus:ring-brand-pink/50' },
    { gradient: 'bg-gradient-to-r from-brand-pink to-brand-orange', focusRing: 'focus:ring-brand-orange/50' },
];

const HomePage: React.FC = () => {
    const { products } = useProducts();
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];

    return (
        <>
            <Seo />
            {/* Hero Section */}
            {/* Reduced padding (py-8 sm:py-12) and increased pink opacity (bg-brand-pink/25) */}
            <section className="py-8 sm:py-12 bg-brand-pink/25">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Reduced gap (gap-8) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        {/* Left Column: Big Logo - takes 4/12 columns (33%) */}
                        <div className="flex justify-center md:col-span-4">
                            {/* Mobile: significantly smaller (w-40), Desktop: max-w-xs */}
                            <Logo className="w-40 md:w-full md:max-w-xs h-auto drop-shadow-lg" />
                        </div>

                        {/* Right Column: Text & Icons - takes 8/12 columns (66%) */}
                        <div className="text-center md:text-left md:col-span-8">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-gray mb-4">Proměňte své fotky v jedinečné magnetické produkty</h1>
                            <p className="mt-2 text-lg text-gray-700 font-medium leading-relaxed">
                                Máte telefon plný krásných fotek telefonu nebo PC? Vytvořte si fotomagnetky pro radost nebo jako originální dárek.
                            </p>

                            {/* Main CTA Button - High Visibility - Changed to Pink and reduced margins */}
                            <div className="mt-6 mb-8">
                                <Link to="/produkty" className="inline-block bg-brand-pink text-white font-bold py-4 px-10 rounded-full shadow-xl hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-pink/50 text-lg">
                                    VYTVOŘIT MAGNETKY
                                </Link>
                            </div>

                            {/* Process Icons Mini-row with Labels - Only first 3 steps */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                {HOW_IT_WORKS_STEPS.slice(0, 3).map((step, index) => (
                                    <div key={index} className="flex flex-col items-center w-24">
                                        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${iconColors[index]} text-white shadow-md mb-2`} title={step.title}>
                                            <div className="transform scale-75">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-800 text-center leading-tight">
                                            {step.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            <p className="mt-6 text-xl sm:text-2xl font-bold text-brand-pink">
                                Celý proces je snadný a zabere jen chvilku.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Overview Section */}
            <section className="pb-16 sm:pb-24 pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-dark-gray">Naše Produkty</h2>
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
            </section>

             {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-dark-gray">Jak to funguje?</h2>
                    <div className="mt-12 grid md:grid-cols-4 gap-10">
                        {HOW_IT_WORKS_STEPS.map((step, index) => (
                             <div key={index} className="text-center">
                                 <div className={`flex items-center justify-center h-20 w-20 mx-auto rounded-full ${iconColors[index]} text-white`}>
                                     {step.icon}
                                 </div>
                                 <h3 className="mt-6 text-lg font-medium text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-base text-gray-500">{step.description}</p>
                             </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;
