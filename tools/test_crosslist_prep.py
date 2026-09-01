#!/usr/bin/env python3
import json
import tempfile
from pathlib import Path

from crosslist_prep import generate


def main() -> None:
    root = Path(__file__).parent
    with tempfile.TemporaryDirectory() as temp:
        output = Path(temp) / "drafts"
        count = generate(root / "crosslist_sample.csv", output, ("poshmark", "mercari", "depop", "facebook"))
        assert count == 4
        files = sorted(output.glob("*/JF-TEST-001.json"))
        assert len(files) == 4
        drafts = [json.loads(path.read_text(encoding="utf-8")) for path in files]
        assert all(item["review_required"] is True for item in drafts)
        assert all(item["submit_automatically"] is False for item in drafts)
        mercari = json.loads((output / "mercari/JF-TEST-001.json").read_text(encoding="utf-8"))
        assert len(mercari["title"]) <= 40
        assert mercari["price"] == "$85"
    print("PASS: cross-list draft generation, validation, and safety flags")


if __name__ == "__main__":
    main()
