
export interface ProductVariant {
  id: string;
  name: string;
  photoCount: number;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  imageUrl: string;
  gallery: string[];
  variants?: ProductVariant[];
  requiredPhotos: number;
  hasTextFields?: boolean;
  imageUrl_portrait?: string;
  imageUrl_landscape?: string;
  gallery_portrait?: string[];
  gallery_landscape?: string[];
}

export interface CartItem {
  id: string; // unique ID for the cart item, e.g., timestamp
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  photos: string[]; // array of base64 data URLs
  customText?: { [key: string]: string };
  orientation?: 'portrait' | 'landscape';
}