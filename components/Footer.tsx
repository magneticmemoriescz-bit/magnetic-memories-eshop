
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, FOOTER_INFO_LINKS, FOOTER_LEGAL_LINKS } from '../constants';
import { Logo } from './Logo';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="min-w-0">
                <Logo className="h-16 w-auto" />
                <p className="mt-2 text-gray-400 text-xs max-w-sm">
                    Vaše vzpomínky jsou to nejcennější. <br /> Magnetic Memories.
                </p>
            </div>
            
            <div className="flex flex-col items-start md:items-center gap-2">
                <h3 className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">Sledujte nás</h3>
                <div className="flex space-x-4 text-gray-400">
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

            <div className="flex gap-10 sm:gap-14">
                <div>
                    <h3 className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">Navigace</h3>
                    <ul className="mt-1.5 space-y-1">
                        {NAV_LINKS.map(link => (
                            <li key={link.name}>
                                <Link to={link.path} className="text-xs text-gray-400 hover:text-white transition-colors">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">Informace</h3>
                    <ul className="mt-1.5 space-y-1">
                        {FOOTER_INFO_LINKS.map(link => (
                            <li key={link.name}>
                                <Link to={link.path} className="text-xs text-gray-400 hover:text-white transition-colors">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                        {FOOTER_LEGAL_LINKS.map(link => (
                             <li key={link.name}>
                                <Link to={link.path} className="text-xs text-gray-400 hover:text-white transition-colors">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-base text-gray-500 text-center sm:text-left">&copy; {new Date().getFullYear()} Magnetic Memories. Všechna práva vyhrazena.</p>
             <div className="text-center sm:text-right mt-4 sm:mt-0 flex items-center gap-4">
                <a 
                  href="http://budumitweb.cz/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-semibold text-brand-pink hover:text-white transition-all underline decoration-brand-pink/50 hover:decoration-white underline-offset-4"
                >
                  Designed by BuduMítWeb
                </a>
                <span className="text-gray-800">|</span>
                <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">Administrace</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};
