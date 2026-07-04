#!/usr/bin/env python3
"""Mechanical verifier for weekly EHC calendar drafts.

Usage:  python3 verify.py weeks/week-002.md
Automatically finds the previous two weeks/week-NNN.md files for the
repetition/cooldown checks. Exit code 0 = PASS, 1 = FAIL (rewrite the
listed rows and re-run). This encodes HOOK-STANDARD.md §4; if the two
ever disagree, the markdown file is the law and this script has a bug.
"""
import re
import sys
from pathlib import Path

BANNED = [
    "beast mode", "no pain no gain", "rise and grind", "crush your",
    "smash your goals", "you got this", "believe in yourself", "level up",
    "game changer", "game-changer", "unlock", "unleash", "secret to",
    "hack", "top 5", "stop doing this", "doctors hate",
    "transform your body", "summer body", "gym motivation", "let's go",
    "day in the life", "consistency is key",
]
ADVICE = ["you should", "make sure", "try ", "remember to", "here's how"]
EXCLUSIONS = ["not for you", "isn't for you", "disappoint you", "not here"]
ROTATION = {"Mon": "Mechanical", "Tue": "Villain", "Wed": "Mechanical",
            "Thu": "Villain", "Fri": "Filter", "Sat": "Villain",
            "Sun": "Villain"}
PERSONA = {"Mechanical": "Marie", "Villain": "Jay", "Filter": "Jay"}
SLOT_BOUND = {"V3", "V4"}  # exempt from cooldown; V4 skeleton exempt from phrase reuse

ROW_RE = re.compile(
    r'\| (Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+ \| (\w+) \| (\w+) \| "([^"]+)" \| (\w+)')


def clean(s):
    return s.lower().replace(".", "").replace(",", "")


def parse(path):
    return ROW_RE.findall(Path(path).read_text())


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    target = Path(sys.argv[1])
    weeks_dir = target.parent
    num = int(re.search(r"week-(\d+)", target.name).group(1))
    prev_paths = [p for n in (num - 1, num - 2)
                  if (p := weeks_dir / f"week-{n:03d}.md").exists()]
    prev_rows = [r for p in prev_paths for r in parse(p)]
    prev_hooks = [r[3] for r in prev_rows]
    prev_pats = {r[4] for r in prev_rows}

    rows = parse(target)
    fails = []
    if len(rows) != 7:
        fails.append(f"expected 7 rows, parsed {len(rows)} — check table format")
    pats = [r[4] for r in rows]

    for day, typ, per, hook, pat in rows:
        tag = f"{day} ({pat})"
        if len(hook.split()) > 15:
            fails.append(f"{tag}: {len(hook.split())} words (max 15)")
        if "?" in hook:
            fails.append(f"{tag}: question mark (U2)")
        if "!" in hook:
            fails.append(f"{tag}: exclamation point (U3)")
        if re.search(r"\d", hook):
            fails.append(f"{tag}: digit (U4)")
        if re.search(r"\b[A-Z]{2,}\b", hook):
            fails.append(f"{tag}: ALL-CAPS word (U3)")
        low = hook.lower()
        fails += [f"{tag}: banned phrase '{b}' (U6)" for b in BANNED if b in low]
        fails += [f"{tag}: advice verb '{a}' (U5)" for a in ADVICE if a in low]
        if ROTATION[day] != typ:
            fails.append(f"{tag}: rotation says {day} is {ROTATION[day]}, got {typ}")
        if PERSONA.get(typ) != per:
            fails.append(f"{tag}: persona for {typ} must be {PERSONA.get(typ)}")
        if pat in prev_pats and pat not in SLOT_BOUND:
            fails.append(f"{tag}: pattern cooldown violation (used in prev 2 weeks)")
        words = clean(hook).split()
        for i in range(len(words) - 3):
            phrase = " ".join(words[i:i + 4])
            if any(phrase in clean(ph) for ph in prev_hooks):
                if pat == "V4" and ("standard held" in phrase
                                    or "the standard" in phrase
                                    or phrase.startswith("most ")):
                    continue
                fails.append(f"{tag}: 4-word phrase reuse '{phrase}' (U7)")
        if day == "Sat":
            if len(hook.split()) > 9:
                fails.append(f"{tag}: Sat hook >9 words (V3)")
            if len([c for c in hook.split(".") if c.strip()]) != 2:
                fails.append(f"{tag}: Sat hook not exactly two clauses (V3)")
        if day == "Fri" and not any(x in low for x in EXCLUSIONS):
            fails.append(f"{tag}: Friday Filter missing exclusion clause")

    types = [r[1] for r in rows]
    if (types.count("Mechanical"), types.count("Villain"),
            types.count("Filter")) != (2, 4, 1):
        fails.append("type mix must be 2 Mechanical / 4 Villain / 1 Filter")
    if len(pats) != len(set(pats)):
        fails.append("duplicate pattern ID within the week")

    text = Path(target).read_text()
    for col in ("Asset Need", "Caption Angle"):
        if col not in text:
            fails.append(f"missing column: {col}")
    if "## Alternates" not in text:
        fails.append("missing Alternates section")

    # Checks this script can NOT do — a human or model must confirm by hand:
    manual = [
        "Mechanical claims match the numbered approved list (truth check)",
        "Mon/Wed target different body parts",
        "Mechanical exercises not used in previous two weeks",
        "Villain hooks contain a real two-half contrast",
        "Dates match the target week",
    ]

    print(f"Parsed {len(rows)} rows from {target.name}; "
          f"compared against {len(prev_paths)} previous week(s).")
    if fails:
        print("FAIL:")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("PASS (mechanical checks). Still confirm by hand:")
    for m in manual:
        print("  -", m)


if __name__ == "__main__":
    main()
