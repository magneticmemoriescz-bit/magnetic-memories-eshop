
export interface ProductVariant {
  id: string;
  name: string;
  photoCount: number;
  price?: number;
  imageUrl?: string;
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
}

export interface CartItem {
  id: string; // unique ID for the cart item, e.g., timestamp
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  photos: string[]; // array of base64 data URLs
  customText?: { [key: string]: string };
}

export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    country: string;
}

export interface ShippingOption {
    id: string;
    name: string;
    price: number;
    description: string;
}

export interface PaymentOption {
    id: string;
    name: string;
    description: string;
    codFee?: number;
}

export interface Order {
    id: string;
    customerInfo: CustomerInfo;
    shipping: ShippingOption;
    payment: PaymentOption;
    items: CartItem[];
    total: number;
    subtotal: number;
    shippingCost: number;
    codFee: number;
    notes?: string;
    zasilkovnaPoint?: string;
}