
import React from 'react';
import { PageWrapper, SectionTitle } from '../components/layout/PageWrapper';

const ShippingPage: React.FC = () => (
    <PageWrapper title="Doprava a platba">
        <SectionTitle>Doba výroby</SectionTitle>
        <p>Každý produkt je vyráběn na zakázku s maximální péčí. Doba výroby je obvykle 3-5 pracovních dnů od přijetí platby. Po dokončení výroby je zásilka předána dopravci.</p>
        
        <div className="my-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-bold text-green-800 text-center">DOPRAVA ZDARMA při nákupu nad 800 Kč!</p>
        </div>

        <SectionTitle>Možnosti dopravy</SectionTitle>
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-dark-gray mb-2">Balíkovna</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Na výdejní místo: <strong>61 Kč</strong></li>
                    <li>Doručení na adresu: <strong>88 Kč</strong></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-dark-gray mb-2">Zásilkovna</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Na výdejní místo (Z-Point / Z-Box): <strong>79 Kč</strong></li>
                    <li>Doručení na adresu: <strong>99 Kč</strong></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-dark-gray mb-2">PPL</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Na výdejní místo (Parcelshop / Parcelbox): <strong>79 Kč</strong></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-dark-gray mb-2">Ostatní</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Osobní odběr - Turnov:</strong> Zdarma (Po předchozí domluvě)</li>
                </ul>
            </div>
        </div>

        <SectionTitle>Možnosti platby</SectionTitle>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Bankovním převodem (předem):</strong> Po dokončení objednávky obdržíte platební údaje do emailu. (Zdarma)</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500 italic">Poznámka: Momentálně nepřijímáme platby na dobírku.</p>
    </PageWrapper>
);

export default ShippingPage;
