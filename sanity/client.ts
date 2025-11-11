import { createClient } from '@sanity/client';

// Podrobnosti o konfiguraci naleznete zde: https://www.sanity.io/docs/the-sanity-client
export const sanityClient = createClient({
  /**
   * Najděte si své ID projektu na sanity.io/manage nebo spuštěním `sanity manage` ve vaší složce projektu
   * Zkopírujte a vložte ho sem.
   **/
  projectId: 'a299n7va', 
  dataset: 'production', // nebo název vašeho datasetu
  useCdn: process.env.NODE_ENV === 'production', // `false` pokud chcete zajistit vždy čerstvá data
  apiVersion: '2024-06-12', // použijte datum ve formátu YYYY-MM-DD
});