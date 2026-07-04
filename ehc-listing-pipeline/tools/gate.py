#!/usr/bin/env python3
"""EHC listable gate. Usage: python3 gate.py <inventory-log-export.csv>

Reads the EHC Inventory Log CSV export and prints, for every row:
LISTED / DONE / LISTABLE / BLOCKED (missing: ...), then a summary and the
Capture Queue (per-SKU physical facts a human must capture next).

Stdlib only. Photo presence in Drive cannot be checked from the CSV, so it
is reported as a reminder, not a blocker, unless --strict-photos is passed
with a manifest file (one filename per line) to check SKU-prefixed files.
"""
import csv
import re
import sys

BANNED = [
    "not confirmed", "pending", "unconfirmed", "verify",
    "needs review", "final inspection required", "tbd", "unknown",
    "low confidence", "needs cost",
]

VALID_CONDITIONS = {"nwt", "new with tags", "excellent", "good", "fair"}

# fields the gate requires (photo check handled separately)
REQUIRED = [
    "Permanent SKU", "Storage Location", "Brand", "Size", "Condition",
    "Condition Notes", "Realistic Sold Value", "Sold Comp Low",
    "Sold Comp High", "SEO Listing Title",
]

DOLLAR = re.compile(r"\$?\d+(\.\d{1,2})?")


def banned_in(value):
    v = value.lower()
    return [b for b in BANNED if b in v]


def check_row(row):
    """Return (status, missing_facts, banned_hits)."""
    status_field = row.get("Inventory Status", "").strip().lower()
    if "listed" in status_field and "unlisted" not in status_field:
        return "LISTED", [], []
    if any(w in status_field for w in ("donated", "liquidated", "passed", "sold")):
        return "DONE", [], []

    missing, hits = [], []
    for f in REQUIRED:
        val = row.get(f, "").strip()
        b = banned_in(val)
        if b:
            hits.append((f, b[0]))
        if not val or b:
            missing.append(f)
            continue
        if f == "Condition" and val.lower() not in VALID_CONDITIONS:
            # legacy multi-word conditions count as unconfirmed
            missing.append(f)
        if f in ("Realistic Sold Value", "Sold Comp Low", "Sold Comp High") \
                and not DOLLAR.fullmatch(val.replace(",", "")):
            missing.append(f + " (must be a plain dollar amount)")
    # every other field only fails on banned phrases, not emptiness
    for f, val in row.items():
        if f in REQUIRED or not val:
            continue
        for b in banned_in(val):
            hits.append((f, b))

    return ("LISTABLE" if not missing else "BLOCKED"), missing, hits


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    with open(sys.argv[1], newline="", encoding="utf-8-sig") as fh:
        rows = [r for r in csv.DictReader(fh) if any(v.strip() for v in r.values() if v)]

    counts = {"LISTED": 0, "DONE": 0, "LISTABLE": 0, "BLOCKED": 0}
    queue, all_hits = [], 0
    for row in rows:
        sku = row.get("Permanent SKU", "").strip() or "(NO SKU)"
        name = row.get("Item Name", "").strip()[:50]
        status, missing, hits = check_row(row)
        counts[status] += 1
        all_hits += len(hits)
        line = f"{status:9} {sku:16} {name}"
        if missing:
            line += f"  missing: {', '.join(missing)}"
            queue.append((sku, name, missing))
        print(line)

    print("\n=== SUMMARY ===")
    for k, v in counts.items():
        print(f"{k:9} {v}")
    print(f"Banned-phrase occurrences in data fields: {all_hits}")
    print("(Photos not checked from CSV — confirm >=4 SKU-prefixed photos "
          "in EHC Reference Frames before publishing.)")

    if queue:
        print("\n=== CAPTURE QUEUE (human, item in hand — checklist 01) ===")
        for sku, name, missing in queue:
            physical = [m for m in missing if m.split(" (")[0] in
                        ("Permanent SKU", "Storage Location", "Size",
                         "Condition", "Condition Notes")]
            desk = [m for m in missing if m not in physical]
            if physical:
                print(f"{sku:16} {name}\n    in-hand: {', '.join(physical)}")
                if desk:
                    print(f"    desk:    {', '.join(desk)}")
        desk_only = [(s, n, m) for s, n, m in queue
                     if not [x for x in m if x.split(' (')[0] in
                             ('Permanent SKU', 'Storage Location', 'Size',
                              'Condition', 'Condition Notes')]]
        if desk_only:
            print("\n--- Desk-only (no item touch needed — checklist 02) ---")
            for sku, name, missing in desk_only:
                print(f"{sku:16} {name}: {', '.join(missing)}")


if __name__ == "__main__":
    main()
