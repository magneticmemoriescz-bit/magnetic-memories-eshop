import React from 'react';
import { PageWrapper, SectionTitle } from '../components/layout/PageWrapper';

const PrivacyPage: React.FC = () => (
    <PageWrapper title="Ochrana osobních údajů">
        <SectionTitle>1. Správce osobních údajů</SectionTitle>
        <p>Správcem Vašich osobních údajů je společnost Magnetic Memories s.r.o. (dále jen "správce").</p>
        <SectionTitle>2. Jaké údaje zpracováváme</SectionTitle>
        <p>Zpracováváme údaje, které nám poskytnete při vytváření objednávky (jméno, adresa, e-mail, telefon) a fotografie, které nahrajete pro výrobu produktů. Tyto fotografie jsou po výrobě a doručení objednávky bezpečně smazány.</p>
        <SectionTitle>3. Účel zpracování</SectionTitle>
        <p>Údaje jsou zpracovávány za účelem vyřízení Vaší objednávky, komunikace ohledně stavu objednávky a pro plnění zákonných povinností (např. účetnictví).</p>
        <SectionTitle>4. Vaše práva</SectionTitle>
        <p>Máte právo na přístup ke svým osobním údajům, jejich opravu, výmaz, omezení zpracování, a právo vznést námitku proti zpracování.</p>
        <SectionTitle>5. Cookies</SectionTitle>
        <p>Náš web používá soubory cookies pro zajištění funkčnosti webu a pro analytické účely. Používáním webu souhlasíte s jejich ukládáním.</p>
    </PageWrapper>
);

export default PrivacyPage;
