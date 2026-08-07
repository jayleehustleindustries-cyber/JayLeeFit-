#!/usr/bin/env node
/**
 * EHC Inventory Log V2 → marketplace export builder.
 *
 * Reads data/inventory-v2.json (normalized snapshot of the "EHC Inventory
 * Log V2" Google Sheet) and writes:
 *
 *   out/ebay-draft-listings.csv   eBay Seller Hub bulk-upload CSV (Draft action)
 *   out/vendoo-import.csv         Vendoo-friendly import CSV
 *   out/make-inventory.json       flat JSON for a Make.com scenario / data store
 *   out/readiness-report.md       what's blocking each not-yet-listable item
 *
 * Usage: node build-exports.mjs
 *
 * The snapshot is the source of truth for this script. To refresh it from
 * the live sheet, re-export the sheet as CSV (File → Download → CSV) and
 * re-normalize — see README.md ("Refreshing the snapshot").
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { source, items } = JSON.parse(
  readFileSync(join(here, "data", "inventory-v2.json"), "utf8"),
);
mkdirSync(join(here, "out"), { recursive: true });

const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const csvRow = (cells) => cells.map(csvCell).join(",");

const isConfirmed = (v) =>
  v != null && !/not confirmed|verify|partially obscured|unconfirmed/i.test(v);

// eBay titles are capped at 80 chars. Compose Brand + Name + Size without
// repeating the brand when the item name already starts with it.
function ebayTitle(item) {
  const parts = [];
  const brand = isConfirmed(item.brand) ? item.brand : null;
  if (brand && !item.name.toLowerCase().startsWith(brand.toLowerCase())) {
    parts.push(brand);
  }
  parts.push(item.name);
  if (isConfirmed(item.size)) {
    const size = item.size.replace(/\s*\(.*\)$/, "");
    parts.push(`Size ${size}`);
  }
  let title = parts.join(" ").replaceAll(/\s+/g, " ").trim();
  if (title.length > 80) title = title.slice(0, 80).replace(/\s+\S*$/, "");
  return title;
}

function description(item) {
  const lines = [ebayTitle(item), ""];
  const push = (label, v) => v && lines.push(`${label}: ${v}`);
  push("Brand", item.brand ?? "See photos — brand tag verification pending");
  push("Department", item.department);
  push("Category", item.category);
  push("Size", item.size ?? "See measurements in photos");
  push("Color", item.color);
  push("Pattern", item.pattern);
  push("Condition", item.condition ?? "Pre-owned; see photos");
  lines.push("", `SKU ${item.sku} — EHC secondhand apparel.`);
  lines.push("Smoke-free handling. Ships fast and folded with care.");
  return lines.join("\n");
}

// New-with-tags → eBay condition 1000, everything else pre-owned → 3000.
const conditionId = (item) =>
  /new with tags/i.test(item.condition ?? "") ? "1000" : "3000";

const alreadyOnEbay = (item) => item.status === "Listed";
const wantsEbay = (item) =>
  /ebay/i.test(item.platforms ?? "") || /eBay Pending/i.test(item.status ?? "");

// ---------------------------------------------------------------- eBay CSV
// Seller Hub bulk-upload template ("Create listings" file exchange format).
// Action=Draft creates editable drafts instead of publishing live listings,
// so missing photos/category can be finished in Seller Hub before going live.
const ebayHeader = [
  "Action(SiteID=US|Country=US|Currency=USD|Version=1193|CC=UTF-8)",
  "Custom label (SKU)",
  "Category ID",
  "Title",
  "UPC",
  "Price",
  "Quantity",
  "Item photo URL",
  "Condition ID",
  "Description",
  "Format",
  "C:Brand",
  "C:Size",
  "C:Color",
  "C:Department",
];
const ebayItems = items.filter((i) => wantsEbay(i) && !alreadyOnEbay(i));
const ebayRows = ebayItems.map((i) =>
  csvRow([
    "Draft",
    i.sku,
    "", // category left blank on purpose — pick in Seller Hub draft editor
    ebayTitle(i),
    "",
    i.price ?? "",
    1,
    "", // photos not yet matched to SKUs — add in draft editor
    conditionId(i),
    description(i),
    "FixedPrice",
    i.brand ?? "Unbranded",
    i.size ?? "",
    i.color ?? "",
    i.department ?? "",
  ]),
);
writeFileSync(
  join(here, "out", "ebay-draft-listings.csv"),
  [csvRow(ebayHeader), ...ebayRows].join("\n") + "\n",
);

// -------------------------------------------------------------- Vendoo CSV
const vendooHeader = [
  "Title",
  "SKU",
  "Brand",
  "Size",
  "Color",
  "Condition",
  "Category",
  "Department",
  "Price",
  "Quantity",
  "Description",
  "Current Status",
  "Target Platforms",
];
const vendooRows = items
  .filter((i) => !alreadyOnEbay(i))
  .map((i) =>
    csvRow([
      ebayTitle(i),
      i.sku,
      i.brand ?? "",
      i.size ?? "",
      i.color ?? "",
      /new with tags/i.test(i.condition ?? "") ? "New with tags" : "Pre-owned",
      i.category ?? "",
      i.department ?? "",
      i.price ?? "",
      1,
      description(i),
      i.status,
      i.platforms,
    ]),
  );
writeFileSync(
  join(here, "out", "vendoo-import.csv"),
  [csvRow(vendooHeader), ...vendooRows].join("\n") + "\n",
);

// ------------------------------------------------------------- Make JSON
writeFileSync(
  join(here, "out", "make-inventory.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source,
      items: items.map((i) => ({
        ...i,
        ebayTitle: ebayTitle(i),
        ebayConditionId: conditionId(i),
        ebayDescription: description(i),
        exportedToEbayCsv: wantsEbay(i) && !alreadyOnEbay(i),
      })),
    },
    null,
    2,
  ),
);

// ------------------------------------------------------- readiness report
const flags = (i) => {
  const f = [];
  if (i.price == null) f.push("missing price");
  if (!isConfirmed(i.brand)) f.push("brand unconfirmed");
  if (!isConfirmed(i.size)) f.push("size unconfirmed");
  if (!isConfirmed(i.condition ?? "Not confirmed")) f.push("condition unconfirmed");
  if (/not confirmed/i.test(i.department ?? "")) f.push("department unconfirmed");
  if (/needs review/i.test(i.status)) f.push("status: needs review");
  return f;
};
const pendingEbay = items.filter((i) => /eBay Pending/i.test(i.status));
const listed = items.filter(alreadyOnEbay);
const clean = ebayItems.filter((i) => flags(i).length === 0);
const flagged = ebayItems.filter((i) => flags(i).length > 0);

const report = [
  "# EHC Inventory Log V2 — listing readiness report",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} from snapshot dated ${source.snapshotDate}.`,
  "",
  `- **${items.length}** items in inventory (SKU numbers 0031 and 0041 are absent in the source sheet)`,
  `- **${listed.length}** already listed (excluded from exports): ${listed.map((i) => i.sku).join(", ")}`,
  `- **${pendingEbay.length}** Poshmark-listed and explicitly *pending eBay* — cross-list these first: ${pendingEbay.map((i) => i.sku).join(", ")}`,
  `- **${ebayItems.length}** exported to the eBay draft CSV (${clean.length} fully clean, ${flagged.length} with open flags)`,
  "",
  "## Items with open flags",
  "",
  "| SKU | Item | Flags |",
  "| --- | --- | --- |",
  ...flagged.map(
    (i) => `| ${i.sku} | ${i.name.slice(0, 60)} | ${flags(i).join("; ")} |`,
  ),
  "",
  "## Global blockers",
  "",
  "- **No photos are matched to SKUs yet.** The EHC inventory import file v2 Drive folder holds 150+ photos with camera filenames (IMG_xxxx / UUID screenshots) and no SKU mapping. Drafts are created without photos; add them in the Seller Hub draft editor or Vendoo until the photo-matching workflow exists.",
  "- A4/A5 rows (0051+) also target Mercari; the Vendoo CSV carries a Target Platforms column for that.",
  "",
].join("\n");
writeFileSync(join(here, "out", "readiness-report.md"), report);

console.log(
  `items=${items.length} ebayCsv=${ebayItems.length} vendooCsv=${vendooRows.length} pendingEbay=${pendingEbay.length} flagged=${flagged.length}`,
);
