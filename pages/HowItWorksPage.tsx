import React from 'react';
import { Link } from 'react-router-dom';
import { HOW_IT_WORKS_STEPS } from '../constants';

const HowItWorksPage: React.FC = () => {
    const iconColors = ['bg-brand-cyan', 'bg-brand-purple', 'bg-brand-pink', 'bg-brand-orange'];
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-brand-purple tracking-wide uppercase">Jak to funguje</h2>
                    <p className="mt-1 text-4xl font-extrabold text-dark-gray sm:text-5xl sm:tracking-tight lg:text-6xl">Vytvořte si své vzpomínky ve 4 krocích</p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Celý proces od výběru po objednávku je rychlý a jednoduchý.</p>
                </div>
                <div className="mt-20 grid md:grid-cols-2 gap-16">
                    {HOW_IT_WORKS_STEPS.map((step, index) => (
                         <div key={index} className="flex space-x-6 items-center">
                             <div className={`flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full ${iconColors[index]} text-white`}>
                                 {step.icon}
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-base text-gray-500">{step.description}</p>
                             </div>
                         </div>
                    ))}
                </div>
                
                <div className="mt-20 text-center">
                    <Link to="/produkty" className="inline-block bg-brand-pink text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-pink/50">
                        VYTVOŘIT VLASTNÍ MAGNETKU
                    </Link>
                </div>

                <div className="mt-24 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-dark-gray">Proč si zamilujete naše magnetky?</h2>
                    
                    <div className="mt-12 text-left grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h3 className="text-xl font-bold text-dark-gray">Originální dárek, který potěší</h3>
                            <p className="mt-2 text-gray-600">
                                Hledáte osobní dárek pro partnera, babičku nebo kamarádku? Magnetka se společnou vzpomínkou je sázka na jistotu, která zaručeně vykouzlí úsměv.
                            </p>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-dark-gray">Vaše vzpomínky stále na očích</h3>
                            <p className="mt-2 text-gray-600">
                                Připomeňte si každý den ty nejkrásnější momenty. Každý pohled na lednici vám připomene zážitky, které máte rádi.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-left">
                        <h3 className="text-xl font-bold text-dark-gray text-center mb-6">Ideální pro každou příležitost</h3>
                        <ul className="list-disc pl-6 space-y-4 max-w-2xl mx-auto text-gray-600">
                            <li><strong>Vzpomínky z cest:</strong> Vytvořte si sbírku magnetek z každé vaší dovolené.</li>
                            <li><strong>Rodinné okamžiky:</strong> Uchovejte si fotky dětí, rodinné oslavy nebo svatební den.</li>
                            <li><strong>Dárek z lásky:</strong> Perfektní maličkost k Valentýnu, výročí nebo jen tak pro radost.</li>
                            <li><strong>Pro domácí mazlíčky:</strong> Protože fotek roztomilých zvířátek není nikdy dost!</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold text-dark-gray">Připraveni oživit své fotky?</h3>
                    <p className="mt-2 text-gray-600">Nenechte své vzpomínky zapadnout. Stačí pár kliků a jsou na cestě k vám.</p>
                    <Link to="/produkty" className="mt-8 inline-block bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-orange text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-purple/50">
                        CHCI ZAČÍT TVOŘIT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;