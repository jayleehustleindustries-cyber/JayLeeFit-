/**
 * Verification script — confirms lib/products.ts correctly maps the real
 * EHC Inventory Log's column layout (Department/Category swapped from this
 * project's documented spec, "$"-formatted prices, no In Stock column),
 * including the V2 sheet's known drifted rows.
 *
 * Run against a local CSV export:  npx tsx lib/verify-ehc-mapping.ts /path/to/export.csv
 * Run against the live sheet:      GOOGLE_SHEET_ID=... npx tsx lib/verify-ehc-mapping.ts --live
 *
 * Exits non-zero when an assertion fails.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { csvToObjects } from "./csv";
import { repairEhcDrift, rowsToProducts, sheetCsvUrl } from "./products";

// SKUs whose sheet rows are known to have drifted columns (unquoted commas
// in Color) — after repair they must parse with a nonzero price.
const DRIFTED_SKUS = [
  "A1-MD-0010",
  "A1-MD-0015",
  "A1-MD-0021",
  "A1-MD-0026",
  "A1-MD-0029",
  "A1-MD-0030",
  "A2-MD-0049",
];
const PRICELESS_SKU = "A4-MD-0060"; // legitimately has no price in the sheet

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function loadCsv(): Promise<string> {
  const arg = process.argv[2];
  if (arg && arg !== "--live") return readFileSync(arg, "utf-8");

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.error("Usage: verify-ehc-mapping.ts <file.csv>  |  GOOGLE_SHEET_ID=... verify-ehc-mapping.ts --live");
    process.exit(2);
  }
  const res = await fetch(sheetCsvUrl(sheetId, process.env.GOOGLE_SHEET_NAME));
  if (!res.ok) {
    console.error(`Live fetch failed: HTTP ${res.status}. If the tab isn't first, set GOOGLE_SHEET_NAME.`);
    process.exit(2);
  }
  return res.text();
}

async function main() {
const csv = await loadCsv();
const products = rowsToProducts(csvToObjects(csv, repairEhcDrift));

console.log(`${products.length} products parsed\n`);

check("product count ≈ 83 (75–95)", products.length >= 75 && products.length <= 95, `${products.length}`);

const zeroPrice = products.filter((p) => p.price === 0);
check(
  `exactly one zero-price product and it is ${PRICELESS_SKU}`,
  zeroPrice.length === 1 && zeroPrice[0].sku === PRICELESS_SKU,
  zeroPrice.map((p) => p.sku).join(", ") || "none"
);

for (const sku of DRIFTED_SKUS) {
  const p = products.find((x) => x.sku === sku);
  check(
    `drifted row ${sku} repaired`,
    !!p && p.price > 0 && ["Men", "Women", "Unisex"].includes(p.category),
    p ? `$${p.price} ${p.category}` : "missing"
  );
}

const withPhotos = products.filter((p) => p.images.length > 0);
console.log(`\nPhoto coverage: ${withPhotos.length} / ${products.length} products have at least one image.`);

// Catch typos in photo-map.json: every mapped SKU should exist in the sheet.
const photoMap = JSON.parse(readFileSync(join(__dirname, "../data/photo-map.json"), "utf-8"));
const skus = new Set(products.map((p) => p.sku));
const orphans = Object.keys(photoMap).filter((sku) => !skus.has(sku));
if (orphans.length > 0) console.log(`WARNING: photo-map.json SKUs not in sheet: ${orphans.join(", ")}`);

const inStockCount = products.filter((p) => p.inStock).length;
console.log(`In stock: ${inStockCount} / ${products.length}`);
const withAge = products.filter((p) => p.daysInInventory !== null);
console.log(`Timestamp parsed (days-in-inventory known): ${withAge.length} / ${products.length}`);

console.log("\nFirst 5:");
for (const p of products.slice(0, 5)) {
  console.log(
    `${p.sku} | ${p.name} | ${p.category} | ${p.type} | $${p.price} | ${p.inStock ? "available" : "SOLD"} | ${p.daysInInventory ?? "?"}d in inventory`
  );
}

console.log("\nNot-available rows:");
for (const p of products.filter((p) => !p.inStock)) {
  console.log(`${p.sku} | ${p.name} | ${p.condition}`);
}

if (failures > 0) {
  console.error(`\n${failures} assertion(s) FAILED`);
  process.exit(1);
}
console.log("\nAll assertions passed.");
}

main();
