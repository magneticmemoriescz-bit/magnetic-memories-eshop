
import React from 'react';
import { Product } from './types';

// NOTE: Make.com webhook URL for invoice generation.
// This is a crucial part of the automated invoicing system. When an order is completed,
// the order data is sent to this URL, which triggers a scenario in Make.com
// to generate an invoice via an external service like Fakturoid.
export const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/ka7qi8xh2kear7rhbyg2re3eg83pfybn';

export const PRODUCTS: Product[] = [
  {
    id: 'magnetic-calendar',
    name: 'Magnetický kalendář',
    price: 350,
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
      { id: '8x10', name: '8x10 cm', photoCount: 12, price: 350 },
      { id: 'a5', name: 'A5', photoCount: 12, price: 600 },
      { id: 'a4', name: 'A4', photoCount: 12, price: 900 },
    ]
  },
  {
    id: 'wedding-announcement',
    name: 'Magnetická svatební oznámení',
    price: 400,
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
        // A5 Variants (Standard prices)
        { id: 'a5-10-pcs', name: '10 ks', photoCount: 1, price: 800 },
        { id: 'a5-20-pcs', name: '20 ks', photoCount: 1, price: 1550 },
        { id: 'a5-50-pcs', name: '50 ks', photoCount: 1, price: 3850 },
        { id: 'a5-100-pcs', name: '100 ks', photoCount: 1, price: 7650 },
        
        // A6 Variants (Half prices)
        { id: 'a6-10-pcs', name: '10 ks', photoCount: 1, price: 400 },
        { id: 'a6-20-pcs', name: '20 ks', photoCount: 1, price: 775 },
        { id: 'a6-50-pcs', name: '50 ks', photoCount: 1, price: 1925 },
        { id: 'a6-100-pcs', name: '100 ks', photoCount: 1, price: 3825 },
    ]
  },
  {
    id: 'photomagnets',
    name: 'Fotomagnety',
    price: 20,
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
      { id: '5x5', name: '5x5 cm', photoCount: 1, price: 20, imageUrl: 'https://i.imgur.com/1oIzU4r.jpeg' },
      { id: '7x7', name: '7x7 cm', photoCount: 1, price: 25, imageUrl: 'https://i.imgur.com/1oIzU4r.jpeg' },
      { id: '5x10', name: '5x10 cm', photoCount: 1, price: 25, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: '10x10', name: '10x10 cm', photoCount: 1, price: 30, imageUrl: 'https://i.imgur.com/7U3iv2e.jpeg' },
      { id: '9x13', name: '9x13 cm', photoCount: 1, price: 35, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a5-sheet', name: 'A5', photoCount: 1, price: 75, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a4-sheet', name: 'A4', photoCount: 1, price: 100, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'custom-a5', name: 'Libovolný rozměr < A5', photoCount: 1, price: 55, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
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

const IconSelect = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconOrder = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconEnjoy = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;

export const HOW_IT_WORKS_STEPS = [
    { title: '1. Vyberte produkt', description: 'Zvolte si z naší nabídky magnetických produktů.', icon: <IconSelect /> },
    { title: '2. Nahrajte fotografie', description: 'Přidejte vaše oblíbené fotky a upravte texty.', icon: <IconUpload /> },
    { title: '3. Objednejte', description: 'Vložte produkt do košíku a dokončete objednávku.', icon: <IconOrder /> },
    { title: '4. Těšte se!', description: 'Vaše vzpomínky vám doručíme až domů.', icon: <IconEnjoy /> },
];
