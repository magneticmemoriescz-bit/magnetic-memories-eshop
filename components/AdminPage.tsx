import React, { useEffect, useState } from 'react';
import { Studio } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from 'sanity/vision';

// Klíče pro uložení přihlašovacích údajů v prohlížeči
const LS_PROJECT_ID = 'sanityProjectId';
const LS_DATASET = 'sanityDataset';

const AdminPage: React.FC = () => {
  const [config, setConfig] = useState<{ projectId: string; dataset: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tento efekt se spustí jen jednou po načtení stránky
    let projectId = localStorage.getItem(LS_PROJECT_ID);
    let dataset = localStorage.getItem(LS_DATASET);

    // Pokud údaje nejsou uloženy, zeptá se uživatele
    if (!projectId) {
      projectId = prompt("Prosím, zadejte vaše Sanity Project ID:", "a299n7va");
      if (projectId) localStorage.setItem(LS_PROJECT_ID, projectId);
    }

    if (!dataset) {
      dataset = prompt("Prosím, zadejte váš Sanity Dataset:", "production");
      if (dataset) localStorage.setItem(LS_DATASET, dataset);
    }

    if (projectId && dataset) {
      setConfig({ projectId, dataset });
    } else {
      // Pokud uživatel údaje nezadá, zobrazí se zpráva
      setError('Project ID a Dataset jsou povinné pro spuštění administrace. Obnovte prosím stránku a zadejte je.');
    }
  }, []);
  
  if (error) {
    return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>{error}</div>;
  }

  if (!config) {
    // Zobrazí načítací animaci, dokud není administrace připravena
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', flexDirection: 'column' }}>
            <div style={{ border: '8px solid #f3f3f3', borderTop: '8px solid #8D7EEF', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 2s linear infinite' }}></div>
            <p>Načítání administrace...</p>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
  }

  // Definice struktury produktů pro administraci
  const productSchema = {
      name: 'product',
      title: 'Produkt',
      type: 'document',
      fields: [
          { name: 'name', title: 'Název produktu', type: 'string', validation: (Rule: any) => Rule.required() },
          { name: 'orderRank', title: 'Pořadí zobrazení', type: 'string', description: 'Např. 1, 2, 3... Produkty se seřadí podle tohoto textu.' },
          { name: 'slug', title: 'URL (slug)', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (Rule: any) => Rule.required() },
          { name: 'mainImage', title: 'Hlavní obrázek', type: 'image', options: { hotspot: true }, validation: (Rule: any) => Rule.required() },
          { name: 'gallery', title: 'Galerie obrázků', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] },
          { name: 'price', title: 'Výchozí cena (Kč)', type: 'number', validation: (Rule: any) => Rule.required() },
          { name: 'shortDescription', title: 'Krátký popis', type: 'string', validation: (Rule: any) => Rule.required() },
          { name: 'description', title: 'Dlouhý popis', type: 'text', validation: (Rule: any) => Rule.required() },
          { name: 'requiredPhotos', title: 'Počet fotek (pokud nejsou varianty)', type: 'number' },
          {
              name: 'variants', title: 'Varianty produktu', type: 'array',
              of: [{
                  type: 'object', name: 'productVariant',
                  fields: [
                      { name: 'name', title: 'Název varianty (např. A5, 6 ks)', type: 'string', validation: (Rule: any) => Rule.required() },
                      { name: 'price', title: 'Cena varianty (Kč)', type: 'number', description: 'Pokud je prázdné, použije se výchozí cena.' },
                      { name: 'photoCount', title: 'Požadovaný počet fotek', type: 'number', validation: (Rule: any) => Rule.required() },
                      { name: 'image', title: 'Obrázek varianty (volitelné)', type: 'image', options: { hotspot: true } },
                  ]
              }]
          }
      ],
      orderings: [{ title: 'Podle pořadí', name: 'orderRankAsc', by: [{ field: 'orderRank', direction: 'asc' }] }]
  };

  // Finální konfigurace pro Sanity Studio
  const sanityConfig = {
    projectId: config.projectId,
    dataset: config.dataset,
    title: 'Magnetic Memories - Správa obsahu',
    basePath: '/admin',
    plugins: [deskTool(), visionTool()],
    schema: { types: [productSchema] },
  };

  return <Studio config={sanityConfig} />;
};

export default AdminPage;
