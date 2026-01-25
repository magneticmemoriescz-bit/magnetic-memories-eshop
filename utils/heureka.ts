
import { Product } from '../types';

/**
 * Generuje XML feed pro Heureku podle oficiální specifikace.
 */
export const generateHeurekaXml = (products: Product[]): string => {
  const baseUrl = 'https://magneticmemories.cz/#/produkty/';
  
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<SHOP>\n';

  products.forEach((product) => {
    // Pro každou variantu vytvoříme samostatný ITEM, pokud existují, jinak hlavní produkt
    const itemsToExport = product.variants && product.variants.length > 0 
      ? product.variants.map(v => ({
          id: `${product.id}-${v.id}`,
          name: `${product.name} - ${v.name}`,
          price: v.price || product.price,
          url: `${baseUrl}${product.id}`,
          img: v.imageUrl || product.imageUrl
        }))
      : [{
          id: product.id,
          name: product.name,
          price: product.price,
          url: `${baseUrl}${product.id}`,
          img: product.imageUrl
        }];

    itemsToExport.forEach(item => {
      xml += '  <SHOPITEM>\n';
      xml += `    <ITEM_ID>${escapeXml(item.id)}</ITEM_ID>\n`;
      xml += `    <PRODUCTNAME>${escapeXml(item.name)}</PRODUCTNAME>\n`;
      xml += `    <PRODUCT>${escapeXml(item.name)}</PRODUCT>\n`;
      xml += `    <DESCRIPTION>${escapeXml(product.shortDescription + ' ' + product.description.replace(/<[^>]*>?/gm, ''))}</DESCRIPTION>\n`;
      xml += `    <URL>${item.url}</URL>\n`;
      xml += `    <IMGURL>${escapeXml(item.img)}</IMGURL>\n`;
      xml += `    <PRICE_VAT>${item.price}</PRICE_VAT>\n`;
      xml += `    <DELIVERY_DATE>5</DELIVERY_DATE>\n`; // Výroba 3-5 dní
      xml += `    <MANUFACTURER>Magnetic Memories</MANUFACTURER>\n`;
      
      // Doplnění kategorií pro lepší párování
      if (product.id === 'photomagnets') {
        xml += `    <CATEGORYTEXT>Dárky a dekorace | Magnety na lednici</CATEGORYTEXT>\n`;
      } else if (product.id === 'magnetic-calendar') {
        xml += `    <CATEGORYTEXT>Kancelářské potřeby | Kalendáře a diáře | Nástěnné kalendáře</CATEGORYTEXT>\n`;
      } else if (product.id === 'wedding-announcement') {
        xml += `    <CATEGORYTEXT>Ostatní | Svatební oznámení</CATEGORYTEXT>\n`;
      } else if (product.id === 'magnetic-merch') {
        xml += `    <CATEGORYTEXT>Dárky a dekorace | Magnety na lednici</CATEGORYTEXT>\n`;
      }

      // Definice dopravy pro Heureku
      xml += '    <DELIVERY>\n';
      xml += '      <DELIVERY_ID>ZASILKOVNA</DELIVERY_ID>\n';
      xml += '      <DELIVERY_PRICE>89</DELIVERY_PRICE>\n';
      xml += '    </DELIVERY>\n';
      xml += '    <DELIVERY>\n';
      xml += '      <DELIVERY_ID>CESKA_POSTA_ADRESA</DELIVERY_ID>\n';
      xml += '      <DELIVERY_PRICE>88</DELIVERY_PRICE>\n';
      xml += '    </DELIVERY>\n';
      
      xml += '  </SHOPITEM>\n';
    });
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
