
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
}

export const Seo: React.FC<SeoProps> = ({ title, description, image, url }) => {
    const siteName = "Magnetic Memories";
    const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
    const fullUrl = url ? `https://magneticmemories.cz${url}` : undefined;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {fullUrl && <meta property="og:url" content={fullUrl} />}
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};
