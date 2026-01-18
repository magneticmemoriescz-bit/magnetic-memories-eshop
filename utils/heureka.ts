
import { Product } from '../types';

/**
 * Generuje XML feed pro Heureku podle oficiální specifikace.
 * Dokumentace: https://sluzby.heureka.cz/napoveda/xml-feed/
 */
export const generateHeurekaXml = (products: Product[]): string => {
  const baseUrl = 'https://magneticmemories.cz/#/produkty/';
  const date = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<SHOP>\n';

  products.forEach((product) => {
    // Pro Heureku je lepší mít každý produkt jako samostatný shopitem.
    // Pokud má produkt varianty, Heureka doporučuje posílat varianty jako samostatné položky 
    // s tagem ITEMGROUP_ID, ale pro základní implementaci pošleme hlavní produkty.
    
    xml += '  <SHOPITEM>\n';
    xml += `    <ITEM_ID>${escapeXml(product.id)}</ITEM_ID>\n`;
    xml += `    <PRODUCTNAME>${escapeXml(product.name)}</PRODUCTNAME>\n`;
    xml += `    <PRODUCT>${escapeXml(product.name)}</PRODUCT>\n`;
    xml += `    <DESCRIPTION>${escapeXml(product.shortDescription + ' ' + product.description.replace(/<[^>]*>?/gm, ''))}</DESCRIPTION>\n`;
    xml += `    <URL>${baseUrl}${product.id}</URL>\n`;
    xml += `    <IMGURL>${escapeXml(product.imageUrl)}</IMGURL>\n`;
    xml += `    <PRICE_VAT>${product.price}</PRICE_VAT>\n`;
    // Delivery date: 0 = skladem, číslo = počet dnů. Naše výroba je 3-5 dní.
    xml += `    <DELIVERY_DATE>5</DELIVERY_DATE>\n`;
    xml += `    <MANUFACTURER>Magnetic Memories</MANUFACTURER>\n`;
    xml += '  </SHOPITEM>\n';
  });

  xml += '</SHOP>';
  return xml;
};

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
};

export const downloadHeurekaXml = (products: Product[]) => {
  const xmlContent = generateHeurekaXml(products);
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'heureka.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
