
import React from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper, SectionTitle } from '../components/layout/PageWrapper';

const WithdrawalPage: React.FC = () => (
    <PageWrapper title="Odstoupení od smlouvy">
        <SectionTitle>Podmínky pro odstoupení od smlouvy</SectionTitle>
        <div className="space-y-6">
            <p>
                Dle ustanovení § 1837 písm. d) občanského zákoníku nelze mimo jiné odstoupit od kupní smlouvy o dodávce zboží, které bylo upraveno podle přání spotřebitele nebo pro jeho osobu (zákazková výroba – např. produkty s vlastními fotografiemi nebo texty). 
                <strong> U těchto personalizovaných produktů lze od smlouvy odstoupit pouze do okamžiku zahájení jejich výroby, která započíná po připsání platby na účet prodávajícího.</strong> 
                Jakmile je zahájen proces výroby těchto produktů na míru, právo na odstoupení od smlouvy bez udání důvodu zaniká.
            </p>
            <p>
                Právo na odstoupení od smlouvy ve lhůtě 14 dnů bez udání důvodu v souladu s § 1829 odst. 1 občanského zákoníku se vztahuje pouze na nezakázkové produkty, které nebyly upraveny podle přání zákazníka (např. standardní motivy "Zamilovaných magnetů" bez vlastních úprav). V takovém případě musí být zboží vráceno nepoškozené a bez známek opotřebení.
            </p>
            
            <SectionTitle>Jak postupovat</SectionTitle>
            <p>
                V případě, že splňujete podmínky pro odstoupení od smlouvy, zašlete prosím žádost prostřednictvím našeho kontaktního formuláře. V žádosti nezapomeňte uvést <strong>číslo vaší objednávky</strong> a datum nákupu.
            </p>
            
            <div className="mt-8 flex justify-center">
                <Link 
                    to="/kontakt" 
                    className="bg-brand-purple text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
                >
                    Odstoupit od smlouvy
                </Link>
            </div>
        </div>
    </PageWrapper>
);

export default WithdrawalPage;
