import { csvToObjects } from "./csv";
import { sampleProducts } from "./sample-products";
import type { Category, Product } from "./types";

/**
 * Inventory source of truth is a Google Sheet (matches the existing
 * spreadsheet-first workflow this shop already runs on). No API key needed —
 * share the sheet as "Anyone with the link can view" and it's readable via
 * the gviz CSV export endpoint. See storefront/README.md for the exact
 * column headers expected.
 */
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Inventory";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toBool(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "y" || v === "yes" || v === "true" || v === "1" || v === "in stock";
}

function toCategory(value: string): Category {
  const v = value.trim().toLowerCase();
  if (v.startsWith("m")) return "Men";
  if (v.startsWith("w")) return "Women";
  return "Unisex";
}

function toConditionScore(condition: string, explicit?: string): number {
  if (explicit) {
    const n = parseInt(explicit, 10);
    if (!Number.isNaN(n)) return n;
  }
  const match = condition.match(/(\d{1,2})\s*\/\s*10/);
  return match ? parseInt(match[1], 10) : 7;
}

function splitMulti(value: string): string[] {
  return value
    .split(/[|;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function rowsToProducts(rows: Record<string, string>[]): Product[] {
  return rows
    .map((row): Product | null => {
      const name = row["Name"] || row["Item"] || "";
      if (!name) return null;

      const sku = row["SKU"] || slugify(name).slice(0, 12).toUpperCase();
      const condition = row["Condition"] || "7/10 — Great";
      const originalPrice = parseFloat(row["Original Price"] || row["Retail Price"] || "0") || 0;
      const price = parseFloat(row["Price"] || row["Resale Price"] || "0") || 0;

      return {
        sku,
        slug: row["Slug"] ? slugify(row["Slug"]) : slugify(`${name}-${sku}`),
        name,
        brand: row["Brand"] || "",
        category: toCategory(row["Category"] || "Unisex"),
        type: row["Type"] || "",
        size: row["Size"] || "",
        condition,
        conditionScore: toConditionScore(condition, row["Condition Score"]),
        originalPrice,
        price,
        description: row["Description"] || "",
        images: splitMulti(row["Images"] || row["Image"] || ""),
        tags: splitMulti(row["Tags"] || ""),
        inStock: row["In Stock"] ? toBool(row["In Stock"]) : true,
      };
    })
    .filter((p): p is Product => p !== null);
}

async function fetchFromGoogleSheet(): Promise<Product[] | null> {
  if (!SHEET_ID) return null;

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    SHEET_NAME
  )}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const csv = await res.text();
    const products = rowsToProducts(csvToObjects(csv));
    return products.length > 0 ? products : null;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const sheetProducts = await fetchFromGoogleSheet();
  return sheetProducts ?? sampleProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export function discountPercent(product: Pick<Product, "originalPrice" | "price">): number {
  if (!product.originalPrice) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
