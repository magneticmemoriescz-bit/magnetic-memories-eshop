
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
    document.title = title;

    const updateMeta = (selectorAttr: string, selectorValue: string, content: string) => {
        let element = document.querySelector(`meta[${selectorAttr}="${selectorValue}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(selectorAttr, selectorValue);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const updateLink = (rel: string, href: string, attributes?: {[key: string]: string}) => {
        let element = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            element.setAttribute('href', href);
            if (attributes) {
              Object.entries(attributes).forEach(([k, v]) => element!.setAttribute(k, v));
            }
            document.head.appendChild(element);
        }
    };

    const currentUrl = window.location.href;
    updateLink('canonical', currentUrl);

    // Standard SEO & Social
    updateMeta('name', 'description', description);
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', image);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:url', currentUrl);

    // Preload hlavního obrázku (LCP)
    if (image && type === 'product') {
        const existingPreload = document.querySelector('link[rel="preload"][as="image"]');
        if (existingPreload) existingPreload.remove();
        
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'image';
        preload.href = image;
        // @ts-ignore
        preload.fetchPriority = 'high';
        document.head.appendChild(preload);
    }

    // Structured Data (JSON-LD)
    const existingScript = document.querySelector('script[data-type="json-ld"]');
    if (existingScript) existingScript.remove();

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
      "brand": {
        "@type": "Brand",
        "name": "Magnetic Memories"
      }
    };

    if (type === 'product' && price) {
      schemaData["offers"] = {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "CZK",
        "availability": availability === 'InStock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": currentUrl
      };
    }

    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
        if (document.head.contains(script)) document.head.removeChild(script);
        const preload = document.querySelector('link[rel="preload"][as="image"]');
        if (preload) preload.remove();
    };

  }, [title, description, image, type, price, availability]);

  return null;
};
