# Push agent context to HubSpot and Supabase

`tools/push_agent_context.py` packages the approved GitHub Markdown and JSON schema files into two optional destinations:

| Destination | Write behavior |
|---|---|
| HubSpot | Creates notes associated with the configured Marie contact. It does not create a contact, change properties, create workflows, or publish anything. |
| Supabase | Upserts one row per allowlisted source document into a pre-existing table. It does not create tables, execute SQL, delete rows, or alter schema. |

The script is **dry-run by default**. External writes require both `--execute` and `ALLOW_EXTERNAL_WRITES=YES_I_UNDERSTAND`, plus an approval token and destination credentials. The token is a local guardrail; a production deployment should replace it with a server-issued approval token bound to a preview hash, user, target, expiry, and idempotency key.

## Dry run

From the repository root:

```bash
python3 tools/push_agent_context.py
```

The dry run verifies that all allowlisted files exist and prints the source commit, SHA-256 values, document sizes, HubSpot note count, and Supabase row count. It performs no network writes.

To preview only one destination:

```bash
python3 tools/push_agent_context.py --hubspot-only
python3 tools/push_agent_context.py --supabase-only
```

## Required environment variables for execution

Never commit these values or place them in the repository.

```bash
export HUBSPOT_ACCESS_TOKEN='...'
export HUBSPOT_MARIE_CONTACT_ID='...'
export SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
export SUPABASE_KEY='...'
export SUPABASE_TABLE='agent_context_documents'
export APPROVAL_TOKEN='issued-by-your-approval-service'
export ALLOW_EXTERNAL_WRITES='YES_I_UNDERSTAND'
```

The HubSpot contact ID must identify Marie’s intended contact record. The script will not search for or create a contact automatically. The HubSpot note-to-contact association type should be verified for the target portal before production use; if the portal uses a different association type, update the script or make that value configurable in the deployment.

For Supabase, the table must already exist and permit the configured key to perform the intended upsert. A compatible minimum table is:

```sql
create table public.agent_context_documents (
  document_key text primary key,
  path text not null,
  content text not null,
  sha256 text not null,
  repository_url text not null,
  repository_branch text not null,
  repository_commit text not null,
  source_type text not null,
  business_unit text not null,
  visibility text not null,
  last_verified_at timestamptz not null
);
```

Run that SQL only through the organization’s approved Supabase migration process. The Python script intentionally cannot create this table.

## Execute after approval

After reviewing the dry-run output, verifying the target contact and Supabase table, and obtaining explicit approval:

```bash
python3 tools/push_agent_context.py --execute
```

For a single destination:

```bash
python3 tools/push_agent_context.py --execute --hubspot-only
python3 tools/push_agent_context.py --execute --supabase-only
```

The script prints only source paths and returned record IDs. It does not print access tokens or Supabase keys. If a request fails, the process stops and reports the error; it does not retry the whole batch automatically.

## Scope and limitations

This integration stores concise source metadata and document content in the selected destinations. It does not make HubSpot the authoritative code repository. GitHub remains the source of code and schemas; HubSpot receives traceable notes and Supabase receives a structured context-document copy where explicitly configured.

The script does not create Marie’s HubSpot contact, tasks, tickets, workflows, calendar events, or permissions. Those actions require separate previews and approvals. It also does not upload Google Drive images or copy marketplace data. Those are separate operations governed by the other agent schemas.
