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
    // Update Title
    document.title = title;

    // Update Meta Tags helper
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateOgMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateOgMeta('og:title', title);
    updateOgMeta('og:description', description);
    updateOgMeta('og:image', image);
    updateOgMeta('og:type', type);
    updateOgMeta('og:url', window.location.href);

    // Structured Data (JSON-LD)
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
      "url": window.location.href,
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