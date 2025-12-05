
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
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zásilkovna - Výdejní místo:</strong> 89 Kč (Doručení obvykle do 2 pracovních dnů od expedice)</li>
            <li><strong>Česká pošta - Doporučené psaní:</strong> 77 Kč (Ekonomická varianta pro menší zásilky do 1000 Kč, doručení do schránky)</li>
            <li><strong>Česká pošta - Balík Do ruky:</strong> 119 Kč (Doručení na Vaši adresu, obvykle do 2 pracovních dnů od expedice)</li>
            <li><strong>Osobní odběr - Turnov:</strong> Zdarma (Po předchozí domluvě)</li>
        </ul>
        <SectionTitle>Možnosti platby</SectionTitle>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Bankovním převodem:</strong> Po dokončení objednávky obdržíte platební údaje. (Zdarma)</li>
            <li><strong>Na dobírku:</strong> Platba při převzetí zboží. (Poplatek 20 Kč)</li>
        </ul>
    </PageWrapper>
);

export default ShippingPage;
