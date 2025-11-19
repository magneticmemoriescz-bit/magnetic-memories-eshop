import React, { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  type?: 'website' | 'product';
  price?: number;
  currency?: string;
}

export const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  imageUrl = 'https://i.imgur.com/xZl1oox.jpeg', 
  url = window.location.href,
  type = 'website',
  price,
  currency = 'CZK'
}) => {
  const siteName = 'Magnetic Memories';
  const fullTitle = `${title} | ${siteName}`;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, attribute: string = 'name') => {
        let element = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('description', description);

    // Open Graph
    updateMeta('og:type', type, 'property');
    updateMeta('og:url', url, 'property');
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', imageUrl, 'property');
    updateMeta('og:site_name', siteName, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', imageUrl);

    // JSON-LD Structured Data
    const structuredData = type === 'product' && price ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": title,
        "image": [imageUrl],
        "description": description,
        "brand": {
        "@type": "Brand",
        "name": siteName
        },
        "offers": {
        "@type": "Offer",
        "url": url,
        "priceCurrency": currency,
        "price": price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
        }
    } : {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteName,
        "url": "https://www.magnetify.cz",
        "logo": "https://i.imgur.com/gkmFoKx.png"
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

  }, [fullTitle, description, imageUrl, url, type, price, currency]);

  return null;
};
