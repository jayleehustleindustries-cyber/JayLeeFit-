# JayLeeFit Unified Code and Database Backup

This directory documents the repository snapshot for two related operating systems: the JayLeeFit fitness-coaching workflow and the resale/inventory workflow used by Magicdeals and EHC. It is a **code, schema, configuration-reference, and exported-data backup**. It is not a live database replica and it does not contain API keys, passwords, OAuth tokens, or other secrets.

## Backup coverage

| Domain | Repository backup | Primary locations | Live dependencies that remain external |
|---|---|---|---|
| Fitness coaching | Airtable schema, macro engine definition, coaching roadmap, intake and check-in workflow documentation, client-app and Telegram-bot plans | `README.md`, `airtable-schema.json`, `docs/agentic-operation-blueprint.md`, `docs/telegram-bot-n8n-guide.md`, `docs/software-design-extension-app.md`, `docs/marketing-sop.md` | Airtable records, messaging platform state, payment/checkout state, deployed app state, credentials |
| Resale operations | Inventory catalog exports, inventory-record CSV, image manifest, cross-list preparation utility, SOPs, verification checklists, resale agent workflow documentation | `site/*inventory-catalog-data.json`, `site/magicdeals-inventory-records.csv`, `site/magicdeals-image-file-manifest.csv`, `tools/crosslist_prep.py`, `resale-clip-system/`, `docs/resale-helper-sops-and-hubspot-workflows.md` | Original Drive files, marketplace accounts, Instagram state, HubSpot records, Airtable records, credentials |
| Shared automation | Function schemas and agent-context documentation for GitHub, Drive, HubSpot, Airtable/Supabase, and agenda helpers | `docs/openai-*-function-schema.json`, `docs/*agent-context*.md`, `tools/push_agent_context.py` | Connector credentials, remote account permissions, workflow execution history |

## Data boundary rules

The coaching and resale domains are intentionally documented together for backup and recovery, but they must remain operationally separated. Client health/coaching records must not be mixed with resale inventory records. Resale entities and listings must retain their company or catalog identity. A shared intake stage or automation layer may be referenced by both systems only when the source and destination domain are explicit.

> This repository preserves references and exported snapshots. It does not guarantee that a referenced Airtable, Drive, HubSpot, Instagram, Telegram, payment, or marketplace object can be restored from Git alone.

## Recovery sequence

First, restore the repository at the required commit and review `backup/manifest.json`. Next, recreate the external services and re-enter credentials through their secure configuration systems. Then import the schema and data exports into the correct Airtable or database targets, keeping the coaching and resale targets separate. Finally, reconnect automation and verify permissions with test records before enabling production writes.

For a complete recovery, obtain fresh exports from every live system. Point-in-time exports do not automatically update after they are created, so a repository commit cannot substitute for a current export of later registrations, orders, uploads, check-ins, messages, or inventory changes.

## Secret policy

No credential values belong in this repository. Files that mention `api_key`, `secret`, `token`, `password`, or authorization describe integration shapes or operational requirements only. Before publishing, mirroring, or transferring this repository, scan the complete Git history for accidental secrets and rotate any credential that has ever been committed.

## Verification checklist

| Check | Expected result |
|---|---|
| Git working tree | Clean before backup commit |
| Coaching schema | `airtable-schema.json` parses as valid JSON |
| Resale catalogs | EHC, JayLeeFit, and Magicdeals catalog JSON files parse as valid JSON |
| Resale records | CSV headers and row counts are preserved |
| Utilities | `tools/crosslist_prep.py` and `tools/test_crosslist_prep.py` remain present |
| Secrets | No credential values, private keys, or production `.env` files are committed |
| External data | Drive, Airtable, HubSpot, messaging, marketplace, and payment exports are separately archived |
| Restore test | A non-production restore is completed before production cutover |

## Current snapshot note

This documentation was added after inspecting the selected repository branch `claude/fitness-airtable-client-data-g1iot3`. The repository currently contains both the fitness-coaching data layer and resale-related catalogs and automation references. The purpose of this backup directory is to make that combined scope explicit while preserving a clear separation boundary for restoration.
