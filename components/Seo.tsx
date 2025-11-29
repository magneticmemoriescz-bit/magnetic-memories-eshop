
import React, { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product';
  price?: number;
  availability?: 'InStock' | 'OutOfStock';
}

export const Seo: React.FC<SeoProps> = ({ 
  title = 'Magnetky z vlastních fotek | Originální dárek | MagneticMemories.cz', 
  description = 'Proměňte své fotografie v jedinečné magnetické vzpomínky. Ideální jako originální dárek pro vaše blízké. Snadná online objednávka a rychlé dodání.',
  image = 'https://i.imgur.com/gkmFoKx.png',
  type = 'website',
  price,
  availability
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to update meta tags
    const updateMeta = (selectorAttr: string, selectorValue: string, content: string) => {
        let element = document.querySelector(`meta[${selectorAttr}="${selectorValue}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(selectorAttr, selectorValue);
            document.head.appendChild(element);
        }
        // Always update content
        element.setAttribute('content', content);
    };

    const currentUrl = window.location.href;

    // 3. Standard SEO
    updateMeta('name', 'description', description);

    // 4. Open Graph (Facebook, LinkedIn, etc.)
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', image);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:url', currentUrl);
    updateMeta('property', 'og:site_name', 'Magnetic Memories');
    updateMeta('property', 'og:locale', 'cs_CZ');

    // 5. Twitter Card
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', image);
    updateMeta('name', 'twitter:url', currentUrl);

    // 6. Structured Data (JSON-LD)
    // Remove existing script to prevent duplicates if navigating back and forth
    const existingScript = document.querySelector('script[data-type="json-ld"]');
    if (existingScript) {
        existingScript.remove();
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-type', 'json-ld');
    
    const schemaData: any = {
      "@context": "https://schema.org",
      "@type": type === 'product' ? "Product" : "WebSite",
      "name": title,
      "description": description,
      "image": image,
      "url": currentUrl,
    };

    if (type === 'product' && price) {
      schemaData["offers"] = {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "CZK",
        "availability": availability === 'InStock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      };
    }

    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup function not strictly necessary for meta tags as we overwrite them, 
    // but good for the script tag.
    return () => {
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
    };

  }, [title, description, image, type, price, availability]);

  return null;
};
