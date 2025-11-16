import React from 'react';
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'magnetic-calendar',
    name: 'Magnetický kalendář',
    price: 990,
    shortDescription: 'Vytvořte si roční kalendář s vlastními fotografiemi.',
    description: 'Proměňte své nejoblíbenější momenty v praktický a krásný kalendář. Každý měsíc nová vzpomínka přímo na vaší lednici!',
    imageUrl: 'https://i.imgur.com/Yy9Rf5y.jpg',
    gallery: [
        'https://i.imgur.com/Yy9Rf5y.jpg',
    ],
    imageUrl_portrait: 'https://i.imgur.com/Yy9Rf5y.jpg',
    gallery_portrait: [
        'https://i.imgur.com/Yy9Rf5y.jpg',
    ],
    imageUrl_landscape: 'https://i.imgur.com/eA3L9fo.jpg',
    gallery_landscape: [
        'https://i.imgur.com/eA3L9fo.jpg',
    ],
    requiredPhotos: 12,
    variants: [
      { id: 'a5', name: 'A5', photoCount: 12, price: 990 },
      { id: 'a4', name: 'A4', photoCount: 12, price: 1800 },
    ]
  },
  {
    id: 'wedding-announcement',
    name: 'Svatební oznámení',
    price: 800,
    shortDescription: 'Originální magnetická oznámení pro váš velký den.',
    description: 'Originální a nezapomenutelné svatební oznámení, které hosté neztratí z očí. Vzpomínka na váš velký den, co drží!',
    imageUrl: 'https://i.imgur.com/ZteI9PG.jpeg',
    gallery: [
      'https://i.imgur.com/ZteI9PG.jpeg',
      'https://i.imgur.com/oP9wB1V.jpeg',
      'https://i.imgur.com/9iF8zUu.jpeg',
    ],
    requiredPhotos: 1,
    hasTextFields: false,
    variants: [
        { id: '10-pcs', name: '10 ks', photoCount: 1, price: 800 },
        { id: '20-pcs', name: '20 ks', photoCount: 1, price: 1550 },
        { id: '50-pcs', name: '50 ks', photoCount: 1, price: 3850 },
        { id: '100-pcs', name: '100 ks', photoCount: 1, price: 7650 },
    ]
  },
  {
    id: 'photomagnets',
    name: 'Fotomagnety',
    price: 100,
    shortDescription: 'Vaše fotky jako stylové magnety na lednici.',
    description: 'Vaše oblíbené fotografie ve formě magnetů. Ideální dárek nebo ozdoba pro každou lednici.',
    imageUrl: 'https://i.imgur.com/7U3iv2e.jpeg',
    gallery: [
      'https://i.imgur.com/uD4fN2y.jpeg',
      'https://i.imgur.com/wE5nF8Q.jpeg',
      'https://i.imgur.com/sS8tT7s.jpeg',
    ],
    requiredPhotos: 6, // Default, will be updated by variant
    variants: [
      { id: '6-large', name: '6 ks (10x10 cm)', photoCount: 6, price: 100, imageUrl: 'https://i.imgur.com/7U3iv2e.jpeg' },
      { id: '12-small', name: '12 ks (5x5 cm)', photoCount: 12, price: 180, imageUrl: 'https://i.imgur.com/1oIzU4r.jpeg' },
    ]
  }
];

export const NAV_LINKS = [
    { name: 'Domů', path: '/' },
    { name: 'Produkty', path: '/produkty' },
    { name: 'Jak to funguje', path: '/jak-to-funguje' },
    { name: 'Kontakt', path: '/kontakt' }
];

export const FOOTER_LEGAL_LINKS = [
    { name: 'Obchodní podmínky', path: '/obchodni-podminky' },
    { name: 'Ochrana osobních údajů', path: '/ochrana-udaju' },
];

export const FOOTER_INFO_LINKS = [
    { name: 'Doprava a platba', path: '/doprava' },
];

export const HOW_IT_WORKS_STEPS = [
    { title: '1. Vyberte produkt', description: 'Zvolte si z naší nabídky magnetických produktů.', icon: <IconSelect /> },
    { title: '2. Nahrajte fotografie', description: 'Přidejte vaše oblíbené fotky a upravte texty.', icon: <IconUpload /> },
    { title: '3. Objednejte', description: 'Vložte produkt do košíku a dokončete objednávku.', icon: <IconOrder /> },
    { title: '4. Těšte se!', description: 'Vaše vzpomínky vám doručíme až domů.', icon: <IconEnjoy /> },
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