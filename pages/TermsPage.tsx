import React from 'react';
import { PageWrapper, SectionTitle } from '../components/layout/PageWrapper';

const TermsPage: React.FC = () => (
    <PageWrapper title="Obchodní podmínky">
        <SectionTitle>1. Úvodní ustanovení</SectionTitle>
        <p>Tyto obchodní podmínky platí pro nákup v internetovém obchodě Magnetic Memories. Podmínky blíže vymezují a upřesňují práva a povinnosti prodávajícího (provozovatel) a kupujícího (zákazník).</p>
        <SectionTitle>2. Objednávka a uzavření kupní smlouvy</SectionTitle>
        <p>Veškeré objednávky podané prostřednictvím internetového obchodu jsou závazné. Podáním objednávky kupující stvrzuje, že se seznámil s těmito obchodními podmínkami a že s nimi souhlasí. Smlouva je uzavřena okamžikem potvrzení objednávky ze strany prodávajícího.</p>
        <SectionTitle>3. Cena a platební podmínky</SectionTitle>
        <p>Všechny ceny jsou uvedeny v Kč včetně DPH. Platbu je možné provést online platební kartou nebo bankovním převodem. Zboží je expedováno po připsání platby na náš účet.</p>
        <SectionTitle>4. Odstoupení od smlouvy</SectionTitle>
        <p>Vzhledem k tomu, že se jedná o zboží upravené na přání spotřebitele (personalizované produkty s vlastními fotografiemi), nelze od kupní smlouvy odstoupit ve lhůtě 14 dnů bez udání důvodu, jak je tomu u běžného zboží.</p>
        <SectionTitle>5. Reklamace</SectionTitle>
        <p>Případné reklamace vyřídíme v souladu s platným právním řádem České republiky. Zjevné vady je nutné reklamovat ihned při převzetí zboží. Na pozdější reklamace zjevných vad nebude brán zřetel.</p>
    </PageWrapper>
);

export default TermsPage;
