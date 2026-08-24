export type Department = "Men" | "Women" | "Kids" | "Unisex";

/**
 * Condition is graded as a card rank — the MagicDeals grading system.
 * Ace = essentially new, Jack = well played. Derived from the free-text
 * Condition column, which on the real sheet is mostly inspection notes.
 */
export type CardRank = "Ace" | "King" | "Queen" | "Jack";

export type Product = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  department: Department;
  /** Garment type, e.g. "Casual Button-Down Shirt" */
  type: string;
  size: string;
  color: string;
  condition: string;
  rank: CardRank;
  price: number;
  /** Drive-hosted white-background photos, already converted to embeddable URLs. */
  images: string[];
  status: "available" | "listed" | "sold";
  /** Days since the item was logged, when the Timestamp column is present. */
  daysInInventory: number | null;
  platforms: string[];
};
