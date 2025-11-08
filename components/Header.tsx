import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';

export const CartIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { state } = useCart();
    const itemCount = state.items.length;
  
    return (
      <button onClick={onClick} className="relative text-gray-200 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-brand-pink to-brand-orange text-white text-xs font-bold">
            {itemCount}
          </span>
        )}
      </button>
    );
};

export const Header: React.FC<{ onCartClick: () => void }> = ({ onCartClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 transition-colors";
    const activeLinkClass = "block py-2 px-3 text-white rounded md:bg-transparent md:text-white md:p-0 font-bold";

    return (
        <header className="bg-black sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <NavLink to="/" className="flex items-center">
                       <Logo />
                    </NavLink>
                    <div className="hidden md:flex items-center space-x-8">
                        {NAV_LINKS.map(link => (
                            <NavLink key={link.name} to={link.path} className={({ isActive }) => isActive ? activeLinkClass : linkClass}>
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4">
                        <CartIcon onClick={onCartClick} />
                        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-black`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {NAV_LINKS.map(link => (
                        <NavLink key={link.name} to={link.path} className={({ isActive }) => isActive ? activeLinkClass : linkClass} onClick={() => setIsOpen(false)}>
                            {link.name}
                        </NavLink>
                    ))}
                </div>
            </div>
        </header>
    );
};