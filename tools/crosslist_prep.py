#!/usr/bin/env python3
"""Create marketplace-specific cross-listing drafts from a master CSV.

This helper intentionally stops at draft generation. A human reviews each draft
before using Playwright or a marketplace UI to enter and submit it.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path
from typing import Dict, Iterable, List

PLATFORMS = ("poshmark", "mercari", "depop", "facebook")
REQUIRED = ("sku", "brand", "title", "size", "condition", "price", "description", "image_paths")


def clean(value: str) -> str:
    return re.sub(r"\\s+", " ", (value or "").strip())


def money(value: str) -> str:
    number = float(str(value).replace("$", "").replace(",", "").strip())
    return f"${number:.2f}" if number % 1 else f"${number:.0f}"


def images(value: str) -> List[str]:
    return [item.strip() for item in re.split(r"[|;]", value or "") if item.strip()]


def hashtags(row: Dict[str, str]) -> List[str]:
    raw = clean(row.get("hashtags", ""))
    if raw:
        return [tag if tag.startswith("#") else f"#{tag}" for tag in raw.split()]
    tokens = [row.get("brand", ""), row.get("category", ""), row.get("color", "")]
    return [f"#{re.sub(r'[^A-Za-z0-9]', '', token)}" for token in tokens if clean(token)]


def build_description(row: Dict[str, str], platform: str) -> str:
    base = clean(row["description"])
    details = [
        f"Brand: {clean(row['brand'])}",
        f"Size: {clean(row['size'])}",
        f"Condition: {clean(row['condition'])}",
    ]
    if clean(row.get("color", "")):
        details.append(f"Color: {clean(row['color'])}")
    if clean(row.get("flaws", "")):
        details.append(f"Flaws: {clean(row['flaws'])}")
    tags = hashtags(row)
    if platform == "depop":
        return "\n".join([base, "", " | ".join(details), "", " ".join(tags)])
    if platform == "facebook":
        return "\n".join([base, "", *details, "", "Pickup/shipping available. Message to purchase."])
    return "\n".join([base, "", *details, "", " ".join(tags)])


def build_title(row: Dict[str, str], platform: str) -> str:
    title = clean(row["title"])
    suffix = f" {clean(row['brand'])}" if clean(row.get("brand", "")) not in title else ""
    result = f"{title}{suffix} {clean(row['size'])}".strip()
    limits = {"poshmark": 80, "mercari": 40, "depop": 65, "facebook": 100}
    return result[: limits[platform]].rstrip()


def draft(row: Dict[str, str], platform: str) -> Dict[str, object]:
    ask = money(row["price"])
    return {
        "sku": clean(row["sku"]),
        "platform": platform,
        "title": build_title(row, platform),
        "price": ask,
        "description": build_description(row, platform),
        "image_paths": images(row["image_paths"]),
        "source": {"sku": clean(row["sku"]), "master_price": ask},
        "review_required": True,
        "submit_automatically": False,
    }


def validate(row: Dict[str, str], line_number: int) -> None:
    missing = [key for key in REQUIRED if not clean(row.get(key, ""))]
    if missing:
        raise ValueError(f"CSV line {line_number}: missing {', '.join(missing)}")
    if not images(row["image_paths"]):
        raise ValueError(f"CSV line {line_number}: image_paths must contain at least one path")
    try:
        if float(str(row["price"]).replace("$", "").replace(",", "")) <= 0:
            raise ValueError
    except ValueError as exc:
        raise ValueError(f"CSV line {line_number}: price must be a positive number") from exc


def generate(input_csv: Path, output_dir: Path, platforms: Iterable[str]) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    with input_csv.open(newline="", encoding="utf-8-sig") as handle:
        for line_number, row in enumerate(csv.DictReader(handle), start=2):
            validate(row, line_number)
            for platform in platforms:
                if platform not in PLATFORMS:
                    raise ValueError(f"Unsupported platform: {platform}")
                target = output_dir / platform / f"{clean(row['sku'])}.json"
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(json.dumps(draft(row, platform), indent=2) + "\n", encoding="utf-8")
                count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_csv", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--platforms", nargs="+", default=list(PLATFORMS), choices=PLATFORMS)
    args = parser.parse_args()
    count = generate(args.input_csv, args.output_dir, args.platforms)
    print(f"Generated {count} reviewable drafts in {args.output_dir}")


if __name__ == "__main__":
    main()

__all__ = ["generate", "draft", "validate"]
