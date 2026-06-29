# Telegram Bot Build Guide — No-Code (n8n / Make)

Wires a Telegram bot to the **JayLeeFit Client Hub** Airtable base so clients can
text their weight and check-ins, and have it logged to the right Client record.
Implements issue #1. No coding required.

All IDs referenced below are in [`airtable-schema.json`](../airtable-schema.json).

---

## What you'll build

```
Client texts bot ──► Telegram Trigger ──► find Client by Chat ID
   "/weight 82.5"                              │
                                               ▼
                                    create row in Progress Tracking
                                    (or Check-ins) linked to Client
                                               │
                                               ▼
                                    bot replies "✅ logged"
```

---

## Step 0 — One-time setup

1. **Create the bot:** in Telegram, message **@BotFather** → `/newbot` → copy the
   **bot token**.
2. **Get each client's Chat ID:** have the client message the bot once; the
   Telegram Trigger shows their `chat.id`. Paste it into that client's
   **Telegram Chat ID** field (`fldPkgAQnkNdVoQHy`) in the Clients table.
3. **Airtable token:** create a Personal Access Token with `data.records:read`
   + `data.records:write` scoped to base `appN8QFsoWJ1fJhxC`. Store it in
   n8n/Make credentials — **never in a message or this repo.**

---

## Step 1 — Trigger

- Node: **Telegram Trigger** → event `message`.
- Connect your bot token credential.

## Step 2 — Parse the command

Add a function/parser step that reads `message.text`:
- `/weight 82.5` → intent = `weight`, value = `82.5`
- `/checkin <text>` → intent = `checkin`, note = `<text>`
- else → reply with help text.

Also capture `message.chat.id` → `chatId`.

## Step 3 — Look up the Client

- Node: **Airtable → Search/List records**
- Base `appN8QFsoWJ1fJhxC`, table **Clients** (`tbl9fkgO75F5FDfiw`)
- Filter formula: `{Telegram Chat ID} = "<chatId>"`
- If no match → reply "You're not linked yet — message your coach." and stop.
- Keep the returned **record id** (`rec...`) for linking.

## Step 4 — Write the data

**If intent = weight** → Airtable **Create record** in Progress Tracking
(`tblQgrbbeCtbz1TU2`):
| Field | Field ID | Value |
|-------|----------|-------|
| Progress Entry Name | `fldrPCo0Jjs2iAAwX` | `"Weight log <date>"` |
| Client | `fldIZGvqYEXgPmh1y` | `[<client record id>]` |
| Date | `fld55FdxxobUK1DEV` | today |
| Weight (kg) | `fldaEFDSABcWhVFIL` | parsed value |

**If intent = checkin** → Airtable **Create record** in Check-ins
(`tblDfVBvRDjEhiaaY`):
| Field | Field ID | Value |
|-------|----------|-------|
| Check-in Name | `fldZpgWQWICYVJG6f` | `"Check-in <date>"` |
| Client | `fld2DeO5RY1uzBzIk` | `[<client record id>]` |
| Client Self-Reported Updates | `fldee3cuk3eDnlPUm` | the note text |

> Linked-record fields (Client) take an **array of record IDs**.

## Step 5 — Confirm back

- Node: **Telegram → Send message** to `chatId`:
  `✅ Logged your weight: 82.5 kg` / `✅ Check-in received.`

---

## Test checklist (acceptance criteria for #1)

- [ ] `/weight 82.5` from a linked client → row appears in Progress Tracking.
- [ ] `/checkin slept badly, sore` → row appears in Check-ins.
- [ ] Unlinked sender gets the "not linked" reply.
- [ ] Bot confirms every successful log.
- [ ] Airtable + bot tokens live only in n8n/Make credentials.

## Next
Once this loop is solid, the same Airtable base powers the PWA (#2) and
wearable sync (#3) — no rebuild, just another front door.
