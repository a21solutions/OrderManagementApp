export interface Product {
  id: string;
  name: string;
  nameMr: string;
  sequence: number;
  // Optional ecommerce fields
  sku?: string;
  price?: number; // unit price in smallest currency unit or base currency
  currency?: string; // e.g., 'INR'
  quantity?: number;
}
