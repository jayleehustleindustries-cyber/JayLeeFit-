import { csvToObjects } from "./csv";
import { snapshotRows } from "./snapshot";
import type { CardRank, Department, Product } from "./types";

/**
 * Inventory source of truth is the EHC Inventory Log V2 Google Sheet —
 * the same sheet the Make.com photo pipeline and the Vendoo draft queue
 * write to. The site reads its public CSV export live when the sheet is
 * shared "Anyone with the link → Viewer"; until then it falls back to a
 * real snapshot of that sheet baked in at build time (lib/snapshot.ts),
 * so the store always shows real inventory, never lorem ipsum.
 */
const SHEET_ID =
  process.env.GOOGLE_SHEET_ID || "17JeIyMsos60gqsppplILJYnQVV1276V5KxODcDo-PuI";
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "EHC Inventory Log V2";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** "$12.00" or "13" -> number. parseFloat alone chokes on the "$". */
function toNumber(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function toDepartment(value: string): Department {
  const v = value.trim().toLowerCase();
  if (v.startsWith("men")) return "Men";
  if (v.startsWith("women")) return "Women";
  if (v.startsWith("girl") || v.startsWith("boy") || v.startsWith("kid")) return "Kids";
  return "Unisex";
}

/**
 * The sheet's Condition column is free-text inspection notes, not a
 * numeric grade — so the store grades every item as a card rank:
 * Ace (new/NWT) · King (good, inspected) · Queen (pre-owned, honest wear)
 * · Jack (played — flaws disclosed).
 */
export function toRank(condition: string): CardRank {
  const c = condition.toLowerCase();
  if (c.includes("new with tags") || c.includes("nwt")) return "Ace";
  if (c.includes("fair") || c.includes("damaged") || c.includes("stain") || c.includes("flaw"))
    return "Jack";
  if (c.includes("good pre-owned")) return "King";
  return "Queen";
}

export const RANK_LABEL: Record<CardRank, string> = {
  Ace: "Ace — new with tags",
  King: "King — good, inspected",
  Queen: "Queen — honest pre-owned",
  Jack: "Jack — played, flaws disclosed",
};

/**
 * Drive share links ("/file/d/<id>/view") can't be hot-linked directly,
 * but Drive's thumbnail endpoint serves the actual image for publicly
 * shared files. Sheet cells sometimes escape underscores as "\_".
 */
export function driveLinksToImages(cell: string): string[] {
  if (!cell) return [];
  const cleaned = cell.replace(/\\_/g, "_");
  const ids = [...cleaned.matchAll(/\/file\/d\/([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
  return ids.map((id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1200`);
}

function toStatus(inventoryStatus: string): Product["status"] | "skip" {
  const s = inventoryStatus.toLowerCase();
  if (!s) return "skip";
  if (s.includes("sold")) return "sold";
  if (
    s.includes("void") ||
    s.includes("removed") ||
    s.includes("not inventory") ||
    s.includes("duplicate") ||
    s.includes("donated") ||
    s.includes("liquidated") ||
    s.includes("temporary") ||
    s.includes("vendoo-ready") || // queue-tracking rows, not sellable listings
    s.includes("not in current vendoo") ||
    s.includes("temp key") ||
    s.includes("potential duplicate") ||
    s.includes("active ebay origin")
  )
    return "skip";
  if (s.includes("listed") || s.includes("posted")) return "listed";
  return "available";
}

function toDaysInInventory(value: string): number | null {
  if (!value.trim()) return null;
  const logged = new Date(value.trim());
  if (Number.isNaN(logged.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((Date.now() - logged.getTime()) / msPerDay);
  return days >= 0 ? days : null;
}

/**
 * Maps EHC Inventory Log V2 rows to products. The V2 layout:
 * Department = gender, Category = garment type, Realistic Sold Value =
 * price ("$14.00" or bare "13"), White Photo Links = space-separated
 * Drive share links. Rows without a name, price, or with queue/void
 * statuses are dropped — the sheet doubles as a work queue, and those
 * rows aren't sellable items.
 */
export function rowsToProducts(rows: Record<string, string>[]): Product[] {
  const seen = new Set<string>();
  return rows
    .map((row): Product | null => {
      const name = row["Item Name"] || "";
      const sku = row["Permanent SKU"] || "";
      if (!name || !sku) return null;

      const status = toStatus(row["Inventory Status"] || "");
      if (status === "skip") return null;

      const price = toNumber(row["Realistic Sold Value"] || "");
      if (price <= 0) return null;

      // Queue rows re-list existing SKUs with sparse fields — first
      // (fully-populated) row wins.
      if (seen.has(sku)) return null;
      seen.add(sku);

      const condition = row["Condition"] || "Pre-owned";
      const images = [
        ...driveLinksToImages(row["White Photo Links"] || ""),
        ...driveLinksToImages(row["Raw / Reference Photo Links"] || ""),
      ];

      return {
        sku,
        slug: slugify(`${name}-${sku}`),
        name,
        brand: row["Brand"] || "",
        department: toDepartment(row["Department"] || ""),
        type: row["Category"] || "",
        size: (row["Size"] || "").replace(/not confirmed/i, "").trim(),
        color: (row["Color"] || "").replace(/not confirmed/i, "").trim(),
        condition,
        rank: toRank(condition),
        price,
        images,
        status,
        daysInInventory: toDaysInInventory(row["Timestamp"] || ""),
        platforms: (row["Listing Platforms"] || "")
          .split("/")
          .map((p) => p.trim())
          .filter(Boolean),
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
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const csv = await res.text();
    // A permission wall returns an HTML login page, not CSV.
    if (csv.trimStart().startsWith("<")) return null;
    const products = rowsToProducts(csvToObjects(csv));
    return products.length > 0 ? products : null;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const live = await fetchFromGoogleSheet();
  if (live) return live;
  return rowsToProducts(snapshotRows);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
