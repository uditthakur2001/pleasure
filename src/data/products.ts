export type ProductCategory = "Injection" | "Bolus" | "Powder" | "Syrup";

export interface ProductVariant {
  size: string;
  images: string[];
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  images: string[];
  composition: string;
  indications: string[];
  dosage: string;
  benefits: string[];
  packSize?: string;

  variants?: ProductVariant[];
}

export const categories: ProductCategory[] = [
  "Injection",
  "Bolus",
  "Powder",
  "Syrup",
];

export const products: Product[] = [

];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);
