
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, FOOTER_INFO_LINKS, FOOTER_LEGAL_LINKS } from '../constants';
import { Logo } from './Logo';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
                <Logo />
                <p className="mt-4 text-gray-400 text-base max-w-sm">
                    Vaše vzpomínky jsou to nejcennější. <br /> Magnetic Memories.
                </p>
                <div className="mt-6 flex space-x-6 text-gray-400">
                    <a href="https://www.instagram.com/magnetic_memories_cz/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
                        <span className="sr-only">Instagram</span>
                        <InstagramIcon />
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61584044016506#" target="_blank" rel="noopener noreferrer" className="hover:text-brand-purple transition-colors">
                        <span className="sr-only">Facebook</span>
                        <FacebookIcon />
                    </a>
                </div>
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
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Informace</h3>
                <ul className="mt-4 space-y-4">
                    {FOOTER_INFO_LINKS.map(link => (
                        <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                    {FOOTER_LEGAL_LINKS.map(link => (
                         <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-base text-gray-500 text-center sm:text-left">&copy; {new Date().getFullYear()} Magnetic Memories. Všechna práva vyzrazena.</p>
             <div className="text-center sm:text-right mt-4 sm:mt-0">
                <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">Administrace</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};
