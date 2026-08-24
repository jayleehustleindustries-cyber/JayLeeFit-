/**
 * One-off verification script — confirms lib/products.ts correctly maps the
 * real EHC Inventory Log's column layout (Department/Category swapped from
 * this project's documented spec, "$"-formatted prices, no In Stock column).
 * Run with: npx tsx lib/verify-ehc-mapping.ts /path/to/ehc-sample.csv
 */
import { readFileSync } from "fs";
import { csvToObjects } from "./csv";
import { rowsToProducts } from "./products";

const path = process.argv[2];
const csv = readFileSync(path, "utf-8");
const products = rowsToProducts(csvToObjects(csv));

console.log(`${products.length} products parsed\n`);

const inStockCount = products.filter((p) => p.inStock).length;
console.log(`In stock: ${inStockCount} / ${products.length}`);

const zeroPrice = products.filter((p) => p.price === 0);
console.log(`Zero-price rows (should be 0): ${zeroPrice.length}`);

console.log("\nFirst 5:");
for (const p of products.slice(0, 5)) {
  console.log(
    `${p.sku} | ${p.name} | ${p.category} | ${p.type} | $${p.price} | ${p.inStock ? "available" : "SOLD"}`
  );
}

console.log("\nNot-available rows:");
for (const p of products.filter((p) => !p.inStock)) {
  console.log(`${p.sku} | ${p.name} | ${p.condition}`);
}
