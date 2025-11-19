import React from 'react';
import { Helmet } from 'react-helmet-async';

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

  // Structured Data (JSON-LD) for Google Rich Snippets
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

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
