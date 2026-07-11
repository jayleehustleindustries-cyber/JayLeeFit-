#!/usr/bin/env python3
"""Turn the EHC Inventory Log into bulk-upload listing files.

Reads a CSV export of the `EHC Inventory Log` Google Sheet and writes:

  output/ebay-draft-listings.csv   eBay Seller Hub bulk "create drafts" upload
  output/vendoo-import.csv         generic cross-lister import (Vendoo et al.)
  output/report.md                 per-SKU category assignment + review flags

Usage:
  python3 generate.py [path/to/inventory.csv] [--update-ledger]

Defaults to the checked-in snapshot next to this script. Stdlib only.

`exported-skus.txt` is the ledger of items already delivered in a draft
upload file. When it exists, a third output appears:

  output/ebay-draft-listings-delta.csv   only items NOT yet in the ledger

so a recurring sync only ever hands over the new rows. Pass
--update-ledger after delivering a file to mark everything current as
exported. Ledger matching is by SKU, falling back to title for rows the
sheet hasn't SKU'd yet.

eBay upload path: Seller Hub -> Reports -> Upload -> "Create listings" with
the drafts template. Drafts tolerate missing fields (price, photos, even
category corrections), so every sellable row becomes a draft; anything that
needs a human decision is flagged in report.md instead of being dropped.
"""

import csv
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(HERE, "inventory-snapshot-2026-07-10.csv")
OUT_DIR = os.path.join(HERE, "output")
LEDGER = os.path.join(HERE, "exported-skus.txt")

# Rows in these states are gone from inventory — no draft.
EXCLUDED_STATUS = ("donated", "liquidated", "passed / not purchased", "sold")
EXCLUDED_CONDITION = ("removed from inventory", "not for sale")

# (keyword regex, men's category id, women's category id) — first match wins,
# so more specific garments sit above generic ones (jeans before pants).
# IDs are US-site leaf categories; eBay validates on upload and flags any
# stale ID per-row, which is fixable in the Seller Hub bulk editor.
CATEGORY_RULES = [
    (r"legging", 57989, 169001),
    (r"jean|denim pants|denim jogger", 11483, 11554),
    (r"jogger|cargo|chino|pants", 57989, 63863),
    (r"shorts", 15689, 11555),
    (r"hoodie|sweatshirt|quarter-zip|pullover", 155183, 155226),
    (r"sweater|cardigan|twinset", 11484, 63866),
    (r"polo", 185100, 53159),
    (r"dress shirt|dress button", 57991, 53159),
    (r"button-down|button-up|button up|flannel|hawaiian", 57990, 53159),
    (r"t-shirt|tee\b|tank", 15687, 53159),
    (r"blouse|top\b|peasant", 15687, 53159),
    (r"blazer|sport coat", 3002, 63862),
    (r"jacket|coat|windbreaker|raincoat|outerwear|vest|sherpa", 57988, 63862),
    (r"derby|oxford|loafer|dress shoe", 53120, 55793),
    (r"shoe|sneaker|boot", 93427, 95672),
    (r"dress\b", 57991, 63861),
]
FALLBACK_MENS, FALLBACK_WOMENS = 57990, 53159

EBAY_HEADER_INFO = [
    ["#INFO", "Version=0.0.2", "Template= eBay-draft-listings-template_US", "", "", "", "", "", "", "", ""],
    ["#INFO Action and Category ID are required fields. 1) Set Action to Draft 2) Please find the category ID for your listing here: https://pages.ebay.com/sellerinformation/news/categorychanges.html", "", "", "", "", "", "", "", "", "", ""],
    ["#INFO After you've successfully uploaded your draft from the Seller Hub Reports page, complete your drafts to active listings here: https://www.ebay.com/sh/lst/drafts", "", "", "", "", "", "", "", "", "", ""],
]
EBAY_COLUMNS = [
    "Action(SiteID=US|Country=US|Currency=USD|Version=1193|CC=UTF-8)",
    "Custom label (SKU)", "Category ID", "Title", "UPC", "Price", "Quantity",
    "Item photo URL", "Condition ID", "Description", "Format",
]


def money(value):
    m = re.search(r"[\d.]+", value or "")
    return m.group(0) if m else ""


def gender(row):
    """Men's/Women's/None, from Department, then Category text, then Title."""
    for source in (row["Department"], row["Category"], row["SEO Listing Title"]):
        s = (source or "").lower()
        if re.search(r"\bwomen|\bwomens|ladies", s):
            return "Women"
        if re.search(r"\bmen|\bmens", s):
            return "Men"
    return None


def category_id(row, g):
    text = " ".join((row["Category"] or "", row["SEO Listing Title"] or "")).lower()
    for pattern, mens_id, womens_id in CATEGORY_RULES:
        if re.search(pattern, text):
            return womens_id if g == "Women" else mens_id
    return FALLBACK_WOMENS if g == "Women" else FALLBACK_MENS


def condition_token(condition):
    c = (condition or "").lower()
    if "new with tags" in c:
        return "NEW"
    if "damaged" in c or "for parts" in c:
        return "USED_ACCEPTABLE"
    if c.startswith("fair") or "stained" in c:
        return "USED_GOOD"
    return "USED_EXCELLENT"


def build_description(row):
    parts = []
    if row["SEO Listing Description"]:
        parts.append(row["SEO Listing Description"].strip())
    facts = []
    for label, col in [("Brand", "Brand"), ("Size", "Size"), ("Color", "Color"),
                       ("Material", "Material"), ("Pattern", "Pattern"),
                       ("Style", "Style Features"), ("Condition", "Condition")]:
        v = (row[col] or "").strip()
        if v and v.lower() not in ("not confirmed", "not confirmed — full garment photos required"):
            facts.append(f"<li>{label}: {v}</li>")
    if facts:
        parts.append("<ul>" + "".join(facts) + "</ul>")
    notes = (row["Condition Notes"] or "").strip()
    if notes and "not available in this chat" not in notes:
        parts.append(f"<p>Condition notes: {notes}</p>")
    parts.append("<p>Sourced and inspected by EHC. Ships fast from a smoke-free space.</p>")
    return "<br>".join(parts)


def load_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ledger_keys(draft):
    """A draft is 'already exported' if either key is in the ledger: the
    sheet may assign a real SKU to a row we exported under a placeholder,
    so the title is the stable fallback identity."""
    keys = {draft["title"].strip().lower()}
    if not draft["sku"].startswith("EHC-TMP-"):
        keys.add(draft["sku"])
    return keys


def load_ledger():
    if not os.path.exists(LEDGER):
        return None
    with open(LEDGER, encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip() and not line.startswith("#")}


def write_ebay_csv(path, drafts):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for line in EBAY_HEADER_INFO:
            w.writerow(line)
        w.writerow(EBAY_COLUMNS)
        for d in drafts:
            w.writerow(["Draft", d["sku"], d["cat"], d["title"], "", d["price"],
                        "1", "", d["condition"], d["description"], "FixedPrice"])


def main():
    args = [a for a in sys.argv[1:] if a != "--update-ledger"]
    update_ledger = "--update-ledger" in sys.argv
    src = args[0] if args else DEFAULT_INPUT
    rows = load_rows(src)
    os.makedirs(OUT_DIR, exist_ok=True)

    drafts, skipped, flags = [], [], []
    auto_sku = 0
    for i, row in enumerate(rows, start=2):  # sheet row numbers (1 = header)
        status = (row["Inventory Status"] or "").lower()
        cond = (row["Condition"] or "").lower()
        title = (row["SEO Listing Title"] or "").strip()
        if not title:
            skipped.append((row["Permanent SKU"] or f"row {i}", "no listing title"))
            continue
        if any(x in status for x in EXCLUDED_STATUS) or any(x in cond for x in EXCLUDED_CONDITION):
            skipped.append((row["Permanent SKU"] or f"row {i}", f"out of inventory ({row['Inventory Status'] or row['Condition']})"))
            continue

        sku = (row["Permanent SKU"] or "").strip()
        if not sku:
            auto_sku += 1
            sku = f"EHC-TMP-{i:04d}"
            flags.append((sku, f"no Permanent SKU in sheet (row {i}) — placeholder assigned, fix before activating"))

        g = gender(row)
        if g is None:
            flags.append((sku, "gender/department not confirmed — defaulted to Men's category, verify"))
        cat = category_id(row, g)
        price = money(row["Realistic Sold Value"])
        if not price:
            flags.append((sku, "no Realistic Sold Value — draft created without price"))
        if len(title) > 80:
            title = title[:80].rsplit(" ", 1)[0]
            flags.append((sku, "title trimmed to eBay's 80-char limit"))

        drafts.append({
            "sku": sku, "cat": cat, "title": title, "price": price,
            "condition": condition_token(row["Condition"]),
            "description": build_description(row),
            "row": row, "gender": g or "Men (assumed)",
        })

    ebay_path = os.path.join(OUT_DIR, "ebay-draft-listings.csv")
    write_ebay_csv(ebay_path, drafts)

    ledger = load_ledger()
    delta_path = os.path.join(OUT_DIR, "ebay-draft-listings-delta.csv")
    if ledger is not None:
        new_drafts = [d for d in drafts if not (ledger_keys(d) & ledger)]
        if new_drafts:
            write_ebay_csv(delta_path, new_drafts)
            print(f"{len(new_drafts)} NEW drafts not yet exported -> {delta_path}")
        else:
            if os.path.exists(delta_path):
                os.remove(delta_path)
            print("in sync: every sellable sheet row is already in the export ledger")

    if update_ledger:
        with open(LEDGER, "w", encoding="utf-8") as f:
            f.write("# Items already delivered in an eBay draft upload file.\n")
            f.write("# One key per line: SKU, plus lowercased title as fallback identity.\n")
            for d in drafts:
                for key in sorted(ledger_keys(d)):
                    f.write(key + "\n")
        print(f"ledger updated: {len(drafts)} items -> {LEDGER}")

    vendoo_path = os.path.join(OUT_DIR, "vendoo-import.csv")
    with open(vendoo_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["SKU", "Title", "Description", "Brand", "Category", "Department",
                    "Size", "Color", "Condition", "Price", "Quantity", "Image URLs"])
        for d in drafts:
            r = d["row"]
            w.writerow([d["sku"], d["title"], d["description"], r["Brand"],
                        r["Category"], d["gender"], r["Size"], r["Color"],
                        r["Condition"], d["price"], "1", ""])

    report_path = os.path.join(OUT_DIR, "report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# EHC -> eBay draft export report\n\n")
        f.write(f"Source: `{os.path.basename(src)}` — {len(rows)} inventory rows\n\n")
        f.write(f"- **{len(drafts)} drafts generated** -> `ebay-draft-listings.csv`\n")
        f.write(f"- {len(skipped)} rows skipped (out of inventory)\n")
        f.write(f"- {len(flags)} review flags\n\n")
        f.write("## Drafts\n\n| SKU | Title | Cat ID | Dept | Price | Condition |\n|---|---|---|---|---|---|\n")
        for d in drafts:
            f.write(f"| {d['sku']} | {d['title'][:50]} | {d['cat']} | {d['gender']} | {d['price'] or '—'} | {d['condition']} |\n")
        f.write("\n## Skipped\n\n")
        for sku, why in skipped or [("—", "none")]:
            f.write(f"- `{sku}`: {why}\n")
        f.write("\n## Review flags\n\n")
        for sku, why in flags or [("—", "none")]:
            f.write(f"- `{sku}`: {why}\n")

    print(f"{len(drafts)} drafts -> {ebay_path}")
    print(f"{len(skipped)} skipped, {len(flags)} flags -> {report_path}")


if __name__ == "__main__":
    main()
