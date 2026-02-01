
/**
 * Utility pro optimalizaci obrázků pomocí Cloudinary.
 * Přidává parametry pro automatický formát (f_auto) a kvalitu (q_auto).
 */
export const optimizeCloudinaryUrl = (url: string | undefined, width?: number, height?: number): string => {
  if (!url) return '';
  
  // Pokud obrázek není z Cloudinary, vrátíme původní URL
  if (!url.includes('cloudinary.com')) return url;

  // Základní optimalizace: auto formát (WebP/AVIF) a inteligentní komprese
  let transform = 'f_auto,q_auto:good';
  
  if (width && height) {
    transform += `,w_${width},h_${height},c_fill,g_auto`;
  } else if (width) {
    transform += `,w_${width},c_limit`;
  }

  // Vložíme transformace do URL za /upload/
  return url.replace('/upload/', `/upload/${transform}/`);
};

export const getThumbnailUrl = (url: string | undefined): string => {
  return optimizeCloudinaryUrl(url, 600, 600);
};
