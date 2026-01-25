
import React from 'react';
import { Product } from './types';

// NOTE: Make.com webhook URL for invoice generation.
export const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/ka7qi8xh2kear7rhbyg2re3eg83pfybn';

export const PRODUCTS: Product[] = [
  {
    id: 'photomagnets',
    name: 'Fotomagnety',
    price: 25,
    shortDescription: 'Vaše fotky jako stylové magnety na lednici.',
    description: 'Vaše oblíbené fotografie ve formě magnetů. Ideální dárek nebo ozdoba pro každou lednici.',
    imageUrl: 'https://i.imgur.com/nPJfjfu.jpg',
    gallery: [
      'https://i.imgur.com/nPJfjfu.jpg',
      'https://i.imgur.com/rBJoZtS.jpg', // Nová fotka na 2. slotu
      'https://i.imgur.com/0pR9wnJ.jpg', 
      'https://i.imgur.com/frmYC1d.mp4',
      'https://i.imgur.com/SLHUTl7.mp4',
      'https://i.imgur.com/rbUQMY9.jpg',
    ],
    requiredPhotos: 1,
    variants: [
      { id: '5x5', name: '5x5 cm', photoCount: 1, itemCount: 1, price: 25, imageUrl: 'https://i.imgur.com/1oIzU4r.jpeg' },
      { id: '7x7', name: '7x7 cm', photoCount: 1, itemCount: 1, price: 30, imageUrl: 'https://i.imgur.com/1oIzU4r.jpeg' },
      { id: '5x10', name: '5x10 cm', photoCount: 1, itemCount: 1, price: 30, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: '10x10', name: '10x10 cm', photoCount: 1, itemCount: 1, price: 35, imageUrl: 'https://i.imgur.com/nPJfjfu.jpg' },
      { id: '9x13', name: '9x13 cm', photoCount: 1, itemCount: 1, price: 40, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a6', name: 'A6', photoCount: 1, itemCount: 1, price: 45, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a5-sheet', name: 'A5', photoCount: 1, itemCount: 1, price: 90, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a4-sheet', name: 'A4', photoCount: 1, itemCount: 1, price: 110, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
    ]
  },
  {
    id: 'wedding-announcement',
    name: 'Magnetické svatební oznámení',
    price: 45,
    shortDescription: 'Originální magnetická oznámení pro váš velký den.',
    description: 'Originální a nezapomenutelné svatební oznámení, které hosté neztratí z očí. Vzpomínka na váš velký den, co drží!',
    imageUrl: 'https://i.imgur.com/IGtS2eZ.jpg',
    gallery: [
      'https://i.imgur.com/IGtS2eZ.jpg', 
      'https://i.imgur.com/REYRIDJ.jpg',
      'https://i.imgur.com/ECKuK8M.jpg',
      'https://i.imgur.com/wIG8Nwe.jpg',
      'https://i.imgur.com/ZoBD3cv.jpg',
      'https://i.imgur.com/0qVMmVZ.jpg',
      'https://i.imgur.com/k7OafeN.jpg',
      'https://i.imgur.com/DCPuHNI.jpg',
      'https://i.imgur.com/3evEhfO.jpg',
      'https://i.imgur.com/h6UkoZf.jpg',
      'https://i.imgur.com/d5JWep1.jpg',
    ],
    requiredPhotos: 1,
    hasTextFields: true,
    variants: [
        { id: 'a6', name: 'A6 (10 x 15 cm)', photoCount: 1, itemCount: 1, price: 45 },
        { id: 'a5', name: 'A5 (15 x 21 cm)', photoCount: 1, itemCount: 1, price: 90 },
    ]
  },
  {
    id: 'pregnancy-announcement',
    name: 'Magnetické oznámení těhotenství',
    price: 45,
    shortDescription: 'Originální způsob, jak oznámit radostnou novinu.',
    description: 'Podělte se o své štěstí originálním magnetickým oznámením. Vaše rodina a přátelé si tuto krásnou zprávu mohou rovnou vystavit na lednici.',
    imageUrl: 'https://i.imgur.com/Gex3ZsN.jpg',
    gallery: [
      'https://i.imgur.com/Gex3ZsN.jpg',
      'https://i.imgur.com/3hgsy6d.jpg',
      'https://i.imgur.com/0WC6XzW.jpg',
      'https://i.imgur.com/RpKh8Vl.jpg',
      'https://i.imgur.com/YH8lkLp.jpg',
    ],
    requiredPhotos: 1,
    hasTextFields: true,
    variants: [
        { id: 'a6', name: 'A6 (10 x 15 cm)', photoCount: 1, itemCount: 1, price: 45 },
        { id: 'a5', name: 'A5 (15 x 21 cm)', photoCount: 1, itemCount: 1, price: 90 },
    ]
  },
  {
    id: 'in-love-magnets',
    name: 'Zamilované magnetky',
    price: 25,
    shortDescription: 'Romantické motivy, které řeknou vše za vás.',
    description: 'Dárková kolekce magnetek s láskyplnými motivy. Ideální k výročí, Valentýnu nebo jen tak z lásky. Vyberte si z našich připravených designů.',
    imageUrl: 'https://i.imgur.com/jdLvBVE.jpg',
    gallery: [
      'https://i.imgur.com/jdLvBVE.jpg', // Úvodní foto
      'https://i.imgur.com/7taClUR.jpg', // 100 jazyků lásky
      'https://i.imgur.com/XAXWhjc.jpg', // potřebuju tě
      'https://i.imgur.com/Gvj8548.jpg', // jsi můj vesmír
      'https://i.imgur.com/TUAxRBE.jpg', // srdce
      'https://i.imgur.com/sThMnIH.jpg', // cosmos
      'https://i.imgur.com/5jbjvQv.jpg', // vzkaz
      'https://i.imgur.com/0Q0B9tY.jpg', // kočička
      'https://i.imgur.com/2zaZy2p.jpg', // forever and always
      'https://i.imgur.com/dAW1KeU.jpg', // nápis I love you
      'https://i.imgur.com/2nDqxWz.jpg', // I love you
      'https://i.imgur.com/MBezi9I.jpg', // kočičky
      'https://i.imgur.com/AwsnHVo.jpg', // puzzle
      'https://i.imgur.com/40rE7KM.jpg', // honey bee mine
    ],
    requiredPhotos: 0, 
    variants: [
      { id: '5x5', name: '5x5 cm', photoCount: 0, itemCount: 1, price: 25 },
      { id: '7x7', name: '7x7 cm', photoCount: 0, itemCount: 1, price: 30 },
      { id: '10x10', name: '10x10 cm', photoCount: 0, itemCount: 1, price: 35 },
    ]
  },
  {
    id: 'magnetic-calendar',
    name: 'Magnetický kalendář',
    price: 350,
    shortDescription: 'Vytvořte si roční kalendář s vlastními fotografiemi.',
    description: 'Proměňte své nejoblíbenější momenty v praktický a krásný kalendář. Každý měsíc nová vzpomínka přímo na vaší lednici!',
    imageUrl: 'https://i.imgur.com/XrxO1dH.jpg',
    gallery: [
        'https://i.imgur.com/XrxO1dH.jpg',
        'https://i.imgur.com/m0OIhVk.jpg',
        // 'https://i.imgur.com/15AsAmb.mp4', // 3. slot odebrán podle požadavku
        'https://i.imgur.com/qukMjCt.mp4',
        'https://i.imgur.com/9hQdyx2.mp4',
        'https://i.imgur.com/df2j9WX.mp4',
    ],
    requiredPhotos: 12,
    variants: [
      { id: '8x10', name: '8x10 cm', photoCount: 12, itemCount: 1, price: 350 },
      { id: 'a6', name: 'A6', photoCount: 12, itemCount: 1, price: 550 },
      { id: 'a5', name: 'A5', photoCount: 12, itemCount: 1, price: 680 },
      { id: 'a4', name: 'A4', photoCount: 12, itemCount: 1, price: 900 },
    ]
  },
  {
    id: 'magnetic-merch',
    name: 'Magnetické logo / Merch',
    price: 25,
    shortDescription: 'Vaše firemní logo nebo grafika jako stylový magnetický merch.',
    description: 'Prezentujte svou značku originálně. Vyrobíme pro vás magnetky s logem, sloganem nebo jakoukoli firemní grafikou. Kvalitní provedení, které drží! Ideální jako dárek pro klienty nebo součást firemní identity.',
    imageUrl: 'https://i.imgur.com/TNmq31E.jpg',
    gallery: [
      'https://i.imgur.com/TNmq31E.jpg',
      'https://i.imgur.com/ef5fsG1.jpg',
      'https://i.imgur.com/g2kFSSS.jpg', // Přidána nová fotka na konec
    ],
    requiredPhotos: 1,
    variants: [
      { id: '5x5', name: '5x5 cm', photoCount: 1, itemCount: 1, price: 25, imageUrl: 'https://i.imgur.com/TNmq31E.jpg' },
      { id: '7x7', name: '7x7 cm', photoCount: 1, itemCount: 1, price: 30, imageUrl: 'https://i.imgur.com/TNmq31E.jpg' },
      { id: '5x10', name: '5x10 cm', photoCount: 1, itemCount: 1, price: 30, imageUrl: 'https://i.imgur.com/TNmq31E.jpg' },
      { id: '10x10', name: '10x10 cm', photoCount: 1, itemCount: 1, price: 35, imageUrl: 'https://i.imgur.com/TNmq31E.jpg' },
      { id: '9x13', name: '9x13 cm', photoCount: 1, itemCount: 1, price: 40, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a6', name: 'A6', photoCount: 1, itemCount: 1, price: 45, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a5-sheet', name: 'A5', photoCount: 1, itemCount: 1, price: 90, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
      { id: 'a4-sheet', name: 'A4', photoCount: 1, itemCount: 1, price: 110, imageUrl: 'https://i.imgur.com/miugWFP.jpg' },
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
