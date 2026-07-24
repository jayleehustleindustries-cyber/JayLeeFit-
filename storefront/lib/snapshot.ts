import snapshot from "../data/inventory-v2.json";
import { imagesForSku } from "./photo-map";
import {
  isAvailable,
  slugify,
  toCategory,
  toConditionScore,
  toDaysInInventory,
} from "./products";
import type { Product } from "./types";

interface SnapshotItem {
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  size: string | null;
  color: string | null;
  pattern: string | null;
  condition: string | null;
  price: number | null;
  status: string;
  department: string | null;
  date: string | null;
}

/**
 * Committed snapshot of the EHC Inventory Log V2 sheet (see
 * data/inventory-v2.json source notes for provenance). Used only when the
 * live sheet fetch fails or GOOGLE_SHEET_ID is unset — fresher than the
 * sample catalog, staler than the sheet.
 */
export function snapshotToProducts(): Product[] {
  return (snapshot.items as SnapshotItem[]).map((item) => {
    const condition = item.condition ?? "7/10 — Great";
    return {
      sku: item.sku,
      slug: slugify(`${item.name}-${item.sku}`),
      name: item.name,
      brand: item.brand ?? "",
      category: toCategory(item.department ?? ""),
      type: item.category ?? "",
      size: item.size ?? "",
      condition,
      conditionScore: toConditionScore(condition),
      originalPrice: 0,
      price: item.price ?? 0,
      description: [item.color, item.pattern].filter(Boolean).join(" — "),
      images: imagesForSku(item.sku),
      tags: [],
      inStock: isAvailable(item.status, condition),
      daysInInventory: toDaysInInventory(item.date ?? ""),
    };
  });
}
