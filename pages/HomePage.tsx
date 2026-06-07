
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { Logo } from '../components/Logo';

const HOMEPAGE_FAQ = [
    {
        question: "Co jsou to fotomagnetky a z čeho jsou vyrobeny?",
        answer: "Naše fotomagnetky vyrábíme ručně z prvotřídního prémiového fotopapíru spojeného s flexibilní magnetickou fólií o tloušťce 0.8 mm. Jsou stálobarevné, pružné a perfektně drží na chladničkách, magnetických tabulích či jakémkoliv jiném kovovém povrchu."
    },
    {
        question: "Jak probíhá výroba magnetek z vlastních fotek z mobilu?",
        answer: "Celý proces zabere sotva minutu! V našem konfigurátoru si zvolíte požadovaný rozměr, nahrajete fotky přímo z telefonu či počítače, případně oříznete zobrazení, a vložíte do košíku. Každou fotografii před tiskem ručně kontrolujeme a upravujeme pro optimální výsledek."
    },
    {
        question: "Jaké rozměry fotomagnetek na lednici nabízíte?",
        answer: "Aktuálně nabízíme širokou škálu oblíbených rozměrů: od menších čtvercových 5x5 cm a 7x7 cm přes univerzální 10x10 cm nebo obdélník 5x10 cm a 9x13 cm až po velké formáty jako A6, A5 a A4."
    },
    {
        question: "Mohu si objednat svatební oznámení nebo oznámení těhotenství?",
        answer: "Ano, magnetická oznámení jsou obrovským hitem! Máme speciální šablony pro magnetické svatební oznámení a oznámení těhotenství, u kterých si můžete snadno upravit texty (jména, datum, vzkazy). Je to nádherná vzpomínka, kterou vaši blízcí neztratí z očí."
    },
    {
        question: "Kolik stojí doprava a kdy mi zásilka magnetek dorazí?",
        answer: "Standardní doba výroby a expedice je 3 až 5 pracovních dní. Nabízíme doručení přes oblíbené služby jako Zásilkovna (výdejní místa i samoobslužné boxy Z-BOX), Balíkovna a PPL ParcelShop. Při nákupu nad 800 Kč je doručení kompletně ZDARMA!"
    },
    {
        question: "Lze objednat výhodné dárkové sady magnetek?",
        answer: "Ano! Pro maximální výhodnost nabízíme předpřipravené sady fotomagnetek v různých počtech (například oblíbené dárkové sady po 9 ks, 15 ks nebo 30 ks) za mimořádně nízké ceny. Je to skvělý dárek k narozeninám, Vánocům či výročí."
    }
];

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
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [openHowItWorksFaqIndex, setOpenHowItWorksFaqIndex] = useState<number | null>(null);

    return (
        <>
            <Seo 
                title="Fotomagnety z vlastních fotek a originální dárky | MagneticMemories.cz"
                description="Proměňte své oblíbené fotografie v originální fotomagnetky na lednici, svatební oznámení nebo magnetické kalendáře. Snadné nahrání z mobilu, ruční výroba a doručení zdarma nad 800 Kč!"
                faq={HOMEPAGE_FAQ}
            />
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
                                 <p className="mt-2 text-base text-black font-light">{step.description}</p>
                             </div>
                        ))}
                    </div>

                    {/* Integrated FAQ Accordion */}
                    <div className="mt-20 max-w-4xl mx-auto pt-16 border-t border-gray-100">
                        <div className="text-center mb-10">
                            <span className="text-xs font-semibold text-brand-purple uppercase tracking-widest bg-brand-purple/5 px-2.5 py-1 rounded-full">Rychlé odpovědi</span>
                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl mt-3 font-sans">
                                Často kladené otázky k nákupu a výrobě
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 font-medium">
                                Vše, co potřebujete vědět o výrobě fotomagnetek na lednici a doručení.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {HOMEPAGE_FAQ.map((faq, index) => {
                                const isOpen = openHowItWorksFaqIndex === index;
                                return (
                                    <div 
                                        key={index} 
                                        className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? 'border-brand-purple/40 shadow-sm' : 'border-gray-100 hover:border-gray-200/80'}`}
                                    >
                                        <button
                                            onClick={() => setOpenHowItWorksFaqIndex(isOpen ? null : index)}
                                            className="w-full py-4 px-5 flex justify-between items-center text-left focus:outline-none"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="font-semibold text-gray-800 text-sm sm:text-base pr-4 font-sans leading-snug">
                                                {faq.question}
                                            </span>
                                            <span className="flex-shrink-0 ml-2">
                                                {isOpen ? (
                                                    <div className="w-7 h-7 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </span>
                                        </button>
                                        
                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3.5 font-normal">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Collapsible FAQ Accordion Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="text-xs font-semibold text-brand-purple uppercase tracking-widest bg-brand-purple/5 px-3 py-1.5 rounded-full">Odpovídáme na vaše dotazy</span>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mt-3 font-sans">
                            Často kladené otázky (FAQ)
                        </h2>
                        <p className="mt-2 text-base text-gray-500 font-normal">
                            Vše, co potřebujete vědět o výrobě fotomagnetek na lednici a doručení.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {HOMEPAGE_FAQ.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div 
                                    key={index} 
                                    className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? 'border-brand-purple/40 shadow-sm' : 'border-gray-100 hover:border-gray-200/80'}`}
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                        className="w-full py-4 px-5 flex justify-between items-center text-left focus:outline-none"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-semibold text-gray-800 text-sm sm:text-base pr-4 font-sans leading-snug">
                                            {faq.question}
                                        </span>
                                        <span className="flex-shrink-0 ml-2">
                                            {isOpen ? (
                                                <div className="w-7 h-7 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </span>
                                    </button>
                                    
                                    <div 
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3.5 font-normal">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;

