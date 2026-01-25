
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { Logo } from '../components/Logo';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

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
            <section className="py-8 sm:py-12 bg-brand-pink/25 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Social Sidebar - Desktop */}
                    <div className="hidden lg:flex flex-col absolute right-0 top-1/2 -translate-y-1/2 space-y-6 z-10">
                        <a href="https://www.instagram.com/magnetic_memories_cz/" target="_blank" rel="noopener noreferrer" className="bg-white/50 backdrop-blur-sm p-3 rounded-l-xl text-gray-500 hover:text-brand-pink hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-x-1">
                            <InstagramIcon />
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61584044016506#" target="_blank" rel="noopener noreferrer" className="bg-white/50 backdrop-blur-sm p-3 rounded-l-xl text-gray-500 hover:text-brand-purple hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-x-1">
                            <FacebookIcon />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        {/* Left Column: Logo */}
                        <div className="flex justify-center md:col-span-4">
                            <Logo className="w-40 md:w-full md:max-w-xs h-auto drop-shadow-lg" />
                        </div>

                        {/* Right Column: Text & CTA */}
                        <div className="text-center md:text-left md:col-span-8">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-gray mb-4">Proměňte své fotky v magnetické produkty</h1>
                            <p className="mt-2 text-lg text-gray-700 font-medium leading-relaxed">
                                Máte telefon plný krásných fotek? Vytvořte si fotomagnetky pro radost nebo jako originální dárek.
                            </p>

                            <div className="mt-6 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <Link to="/produkty" className="inline-block bg-brand-pink text-white font-bold py-4 px-10 rounded-full shadow-xl hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-pink/50 text-lg">
                                    VYTVOŘIT MAGNETKY
                                </Link>
                                
                                {/* Social Links - Mobile only integration */}
                                <div className="flex lg:hidden space-x-4 mt-4 sm:mt-0 sm:ml-4">
                                    <a href="https://www.instagram.com/magnetic_memories_cz/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-pink transition-colors">
                                        <InstagramIcon />
                                    </a>
                                    <a href="https://www.facebook.com/profile.php?id=61584044016506#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-purple transition-colors">
                                        <FacebookIcon />
                                    </a>
                                </div>
                            </div>

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

            {/* Products Section */}
            <section className="pb-16 sm:pb-24 pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-dark-gray">Naše Produkty</h2>
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
