export type Category = "Men" | "Women" | "Unisex";

export type Product = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  type: string;
  size: string;
  condition: string;
  conditionScore: number;
  originalPrice: number;
  price: number;
  description: string;
  images: string[];
  tags: string[];
  inStock: boolean;
  /** Days since the inventory row was logged (from the sheet's Timestamp column). Null if unknown. */
  daysInInventory: number | null;
};
