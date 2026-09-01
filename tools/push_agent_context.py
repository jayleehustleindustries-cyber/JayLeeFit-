#!/usr/bin/env python3
"""Push approved agent-context files to HubSpot and Supabase.

Safe defaults:
- dry-run unless --execute is supplied
- only an explicit allowlist of repository files is read
- HubSpot writes are notes associated with a configured Marie contact
- Supabase writes are parameterized REST upserts to one configured table
- no deletes, arbitrary SQL, schema changes, or credential logging
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

REPO_URL = "https://github.com/jayleehustleindustries-cyber/JayLeeFit-"
REPO_BRANCH = "claude/fitness-airtable-client-data-g1iot3"
REPO_COMMIT = "b1c660a"
DEFAULT_SUPABASE_TABLE = "agent_context_documents"
MAX_NOTE_CHARS = 45000

ALLOWED_FILES = (
    "docs/hubspot-resale-agent-blueprint.md",
    "docs/resale-helper-sops-and-hubspot-workflows.md",
    "docs/hubspot-agent-context.md",
    "docs/openai-agent-prompt-template.md",
    "docs/openai-hubspot-supabase-function-schema.json",
    "docs/openai-agenda-helper-function-schema.json",
    "docs/openai-drive-ehc-view-function-schema.json",
    "docs/openai-github-function-schema.json",
    "docs/marie-hubspot-onboarding-debrief.md",
    "tools/crosslist_prep.py",
    "tools/CROSSLISTING.md",
    "tools/test_crosslist_prep.py",
)


@dataclass(frozen=True)
class Document:
    path: str
    content: str
    sha256: str


def load_documents(base_dir: Path) -> list[Document]:
    documents: list[Document] = []
    for relative in ALLOWED_FILES:
        path = base_dir / relative
        if not path.is_file():
            raise FileNotFoundError(f"Allowlisted file is missing: {relative}")
        content = path.read_text(encoding="utf-8")
        digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
        documents.append(Document(relative, content, digest))
    return documents


def chunks(text: str, size: int = MAX_NOTE_CHARS) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)] or [""]


def build_hubspot_payloads(documents: list[Document], contact_id: str) -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    for doc in documents:
        parts = chunks(doc.content)
        for index, part in enumerate(parts, start=1):
            title = f"JayLee agent context: {doc.path}"
            if len(parts) > 1:
                title += f" ({index}/{len(parts)})"
            body = "\n".join(
                [
                    f"Source repository: {REPO_URL}",
                    f"Source branch: {REPO_BRANCH}",
                    f"Source commit: {REPO_COMMIT}",
                    f"Source path: {doc.path}",
                    f"Source SHA-256: {doc.sha256}",
                    f"Imported at: {datetime.now(timezone.utc).isoformat()}",
                    "",
                    part,
                ]
            )
            payloads.append(
                {
                    "properties": {
                        "hs_timestamp": datetime.now(timezone.utc).isoformat(),
                        "hs_note_body": body,
                    },
                    "associations": [
                        {
                            "to": {"id": contact_id},
                            "types": [
                                {
                                    "associationCategory": "HUBSPOT_DEFINED",
                                    "associationTypeId": 202,
                                }
                            ],
                        }
                    ],
                    "_source_path": doc.path,
                    "_chunk": index,
                    "_chunks": len(parts),
                }
            )
    return payloads


def build_supabase_rows(documents: list[Document]) -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "document_key": f"{REPO_COMMIT}:{doc.path}",
            "path": doc.path,
            "content": doc.content,
            "sha256": doc.sha256,
            "repository_url": REPO_URL,
            "repository_branch": REPO_BRANCH,
            "repository_commit": REPO_COMMIT,
            "source_type": "github",
            "business_unit": "Shared Company",
            "visibility": "company_team",
            "last_verified_at": now,
        }
        for doc in documents
    ]


def require_execute_gate(args: argparse.Namespace) -> None:
    if not args.execute:
        return
    if os.getenv("ALLOW_EXTERNAL_WRITES") != "YES_I_UNDERSTAND":
        raise RuntimeError("Refusing writes: set ALLOW_EXTERNAL_WRITES=YES_I_UNDERSTAND explicitly.")
    if not args.approval_token or len(args.approval_token) < 16:
        raise RuntimeError("Refusing writes: --approval-token is required for --execute.")
    if not os.getenv("HUBSPOT_ACCESS_TOKEN") and not os.getenv("SUPABASE_KEY"):
        raise RuntimeError("Refusing writes: configure at least one approved destination credential.")


def post_hubspot(payload: dict[str, Any], token: str, base_url: str) -> dict[str, Any]:
    clean = {k: v for k, v in payload.items() if not k.startswith("_")}
    response = requests.post(
        f"{base_url.rstrip('/')}/crm/v3/objects/notes",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=clean,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def post_supabase(rows: list[dict[str, Any]], url: str, key: str, table: str) -> Any:
    if not table.replace("_", "").isalnum() or table[0].isdigit():
        raise ValueError("Supabase table must be a simple allowlisted identifier.")
    response = requests.post(
        f"{url.rstrip('/')}/rest/v1/{table}",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
        json=rows,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-dir", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--marie-contact-id", default=os.getenv("HUBSPOT_MARIE_CONTACT_ID"))
    parser.add_argument("--supabase-table", default=os.getenv("SUPABASE_TABLE", DEFAULT_SUPABASE_TABLE))
    parser.add_argument("--approval-token", default=os.getenv("APPROVAL_TOKEN"))
    parser.add_argument("--execute", action="store_true", help="Perform external writes after the explicit safety gate.")
    parser.add_argument("--hubspot-only", action="store_true")
    parser.add_argument("--supabase-only", action="store_true")
    args = parser.parse_args()

    if args.hubspot_only and args.supabase_only:
        parser.error("--hubspot-only and --supabase-only cannot be used together")
    if args.execute and not args.marie_contact_id and not args.supabase_only:
        raise RuntimeError("HubSpot target is not configured; set HUBSPOT_MARIE_CONTACT_ID or use --supabase-only.")

    documents = load_documents(args.base_dir)
    hubspot_contact_id = args.marie_contact_id or "DRY_RUN_CONTACT_ID"
    hubspot_payloads = [] if args.supabase_only else build_hubspot_payloads(documents, hubspot_contact_id)
    supabase_rows = [] if args.hubspot_only else build_supabase_rows(documents)
    preview = {
        "repository": REPO_URL,
        "branch": REPO_BRANCH,
        "commit": REPO_COMMIT,
        "documents": [{"path": d.path, "sha256": d.sha256, "characters": len(d.content)} for d in documents],
        "hubspot_note_count": len(hubspot_payloads),
        "supabase_row_count": len(supabase_rows),
        "supabase_table": args.supabase_table if supabase_rows else None,
        "execute": args.execute,
    }
    print(json.dumps(preview, indent=2))

    require_execute_gate(args)
    if not args.execute:
        print("DRY RUN: no HubSpot or Supabase writes were performed.")
        return 0

    results: dict[str, Any] = {"hubspot": [], "supabase": None}
    if hubspot_payloads:
        token = os.environ.get("HUBSPOT_ACCESS_TOKEN")
        if not token:
            raise RuntimeError("HUBSPOT_ACCESS_TOKEN is required for HubSpot execution.")
        base_url = os.getenv("HUBSPOT_API_BASE", "https://api.hubapi.com")
        for payload in hubspot_payloads:
            result = post_hubspot(payload, token, base_url)
            results["hubspot"].append({"source_path": payload["_source_path"], "result_id": result.get("id")})

    if supabase_rows:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY are required for Supabase execution.")
        result = post_supabase(supabase_rows, url, key, args.supabase_table)
        results["supabase"] = {"row_count": len(result) if isinstance(result, list) else None}

    print(json.dumps({"status": "completed", "results": results}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileNotFoundError, RuntimeError, ValueError, requests.RequestException) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
