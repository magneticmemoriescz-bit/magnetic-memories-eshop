import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Logo } from '../components/Logo';
import { Seo } from '../components/Seo';

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
            <Seo 
                title="Magnetky z vlastních fotek | Originální dárky" 
                description="Vytvořte si jedinečné fotomagnety, kalendáře nebo svatební oznámení. Rychlá výroba, špičková kvalita a radost na každé lednici."
            />
            {/* Hero Section */}
            <section className="relative bg-white flex items-center justify-center min-h-screen text-white p-4 sm:p-6 lg:p-8">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover blur-[1px]" src="https://i.imgur.com/xZl1oox.jpeg" alt="Lednice s magnety" />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>

                <div className="absolute top-0 left-0 p-4 sm:p-6 lg:p-8">
                    <Logo className="h-36 sm:h-56 w-auto" />
                </div>

                <div className="relative z-10 max-w-2xl text-center transform translate-y-40">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-normal [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed">
                        Vaše vzpomínky jsou to nejcennější.
                    </h1>
                    <Link to="/produkty" className="mt-8 inline-block bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-purple/50">
                        Prohlédnout produkty
                    </Link>
                </div>
            </section>
            
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold text-dark-gray">Proměňte své fotky v jedinečné magnetické vzpomínky</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Máte telefon plný krásných fotek z dovolené, oslav nebo všedních okamžiků? Nenechávejte je jen v digitální podobě! Vytvořte si kvalitní fotomagnetky, které vám budou dělat radost každý den na lednici, magnetické tabuli nebo jako originální dárek pro vaše blízké.
                    </p>
                </div>
            </section>

            {/* Product Overview Section */}
            <section className="py-16 sm:py-24">
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
                </div>
            </section>

             {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-white">
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
