import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
                <Logo />
                <p className="mt-4 text-gray-400 text-base max-w-sm">
                    Vaše vzpomínky jsou to nejcennější. <br /> Magnetic Memories.
                </p>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Navigace</h3>
                <ul className="mt-4 space-y-4">
                    {NAV_LINKS.map(link => (
                        <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Právní</h3>
                <ul className="mt-4 space-y-4">
                    <li><Link to="/obchodni-podminky" className="text-base text-gray-300 hover:text-white">Obchodní podmínky</Link></li>
                    <li><Link to="/zasady-ochrany-udaju" className="text-base text-gray-300 hover:text-white">Zásady ochrany osobních údajů</Link></li>
                </ul>
            </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-500 xl:text-center">&copy; {new Date().getFullYear()} Magnetic Memories. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  );
};