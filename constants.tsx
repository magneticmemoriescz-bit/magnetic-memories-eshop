import React from 'react';
import { ShippingOption, PaymentOption } from './types';

export const NAV_LINKS = [
    { name: 'Domů', path: '/' },
    { name: 'Produkty', path: '/produkty' },
    { name: 'Jak to funguje', path: '/jak-to-funguje' },
    { name: 'Kontakt', path: '/kontakt' }
];

export const HOW_IT_WORKS_STEPS = [
    { title: '1. Vyberte produkt', description: 'Zvolte si z naší nabídky magnetických produktů.', icon: <IconSelect /> },
    { title: '2. Nahrajte fotografie', description: 'Přidejte vaše oblíbené fotky a upravte texty.', icon: <IconUpload /> },
    { title: '3. Objednejte', description: 'Vložte produkt do košíku a dokončete objednávku.', icon: <IconOrder /> },
    { title: '4. Těšte se!', description: 'Vaše vzpomínky vám doručíme až domů.', icon: <IconEnjoy /> },
];

export const SHIPPING_OPTIONS: ShippingOption[] = [
    { id: 'zasilkovna', name: 'Zásilkovna (výdejní místo)', price: 65, description: 'Doručení na vámi zvolené místo' },
    { id: 'cpost', name: 'Česká pošta (balík na adresu)', price: 100, description: 'Doručení přímo k vám domů' },
    { id: 'personal', name: 'Osobní odběr (Turnov)', price: 0, description: 'Vyzvednutí po předchozí domluvě' },
];

export const PAYMENT_OPTIONS: PaymentOption[] = [
    { id: 'transfer', name: 'Bankovní převod', description: 'Platba klasickým převodem' },
    { id: 'cod', name: 'Dobírka', description: 'Platba dopravci při převzetí', codFee: 30 },
    { id: 'cash', name: 'Hotově', description: 'Při osobním odběru' },
];

function IconSelect() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
    );
}

function IconUpload() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    );
}

function IconOrder() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function IconEnjoy() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}