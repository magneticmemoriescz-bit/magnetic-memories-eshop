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
    // Handles both 'name' (standard meta) and 'property' (OG tags) attributes
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
        let element = document.querySelector(`meta[${attr}="${key}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, key);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const currentUrl = window.location.href;

    // 3. Standard SEO
    setMetaTag('name', 'description', description);

    // 4. Open Graph (Facebook, LinkedIn, etc.)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:site_name', 'Magnetic Memories');
    setMetaTag('property', 'og:locale', 'cs_CZ');

    // 5. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setMetaTag('name', 'twitter:domain', window.location.hostname);
    setMetaTag('name', 'twitter:url', currentUrl);

    // 6. Structured Data (JSON-LD)
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

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

  }, [title, description, image, type, price, availability]);

  return null;
};
