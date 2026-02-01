
import { Product } from '../types';

export const generateSitemapXml = (products: Product[]): string => {
  const baseUrl = 'https://www.magneticmemories.cz';
  const staticPages = ['', '/produkty', '/jak-to-funguje', '/kontakt', '/doprava'];
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Statické stránky
  staticPages.forEach(path => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += '  </url>\n';
  });

  // Produkty
  products.forEach(product => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/produkty/${product.id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

export const downloadSitemapXml = (products: Product[]) => {
  const xmlContent = generateSitemapXml(products);
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
