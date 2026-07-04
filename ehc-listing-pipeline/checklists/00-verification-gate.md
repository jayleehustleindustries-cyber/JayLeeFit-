# Checklist 00 — The Verification Gate

The dead-simple standard every row must pass. No taste involved: the gate
is a script, and the script's word is final.

## How to run it

1. Export the Inventory Log as CSV
   (`File → Download → CSV`, or fetch
   `https://docs.google.com/spreadsheets/d/1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys/export?format=csv`).
2. `python3 tools/gate.py path/to/export.csv`

Output per row: `LISTABLE`, `BLOCKED (missing: <facts>)`, `LISTED`,
`DONE` (sold/donated/passed), plus a summary and the **Capture Queue** —
the exact per-SKU list of physical facts a human must capture next session.

## When to run it

- **Before** any work session: the Capture Queue IS the to-do list.
- **After** any session that wrote to the sheet: the self-check.

## Pass/fail for a session (the self-check any model can apply)

A session PASSED if all of:

1. `LISTABLE + LISTED + DONE` count went UP or a Publish Packet was
   delivered. (Rows "improved" without any of these = FAILED session.)
2. Zero new banned phrases (gate reports them; count must not increase).
3. Zero rows without a `Permanent SKU` were created.
4. No human-entered value (cost, storage, flaws) was overwritten.

If a session fails the self-check, the next action is not "more research" —
it is: emit the Capture Queue to the human, and stop.
