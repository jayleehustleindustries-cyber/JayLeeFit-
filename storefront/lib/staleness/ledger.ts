import fs from 'fs/promises';
import path from 'path';
import type { LedgerEntry } from './types';
import type { TierId } from './config';

/**
 * Records which tier each SKU has already been moved to, so a daily run only
 * edits listings that actually crossed a threshold since yesterday.
 *
 * On Vercel the filesystem is ephemeral, so this ledger is best-effort: it
 * survives within a warm instance but not across deploys. That is tolerable
 * *only* because the engine derives absolute targets from the sheet — losing
 * the ledger causes redundant no-op edits, never a compounding markdown. Point
 * LEDGER_PATH at a mounted volume, or swap the two IO functions below for a KV
 * store, to make the "already did this" suppression durable.
 */

const LEDGER_PATH =
  process.env.STALE_LEDGER_PATH || path.join(process.cwd(), 'public/logs/stale-ledger.json');

interface LedgerFile {
  version: 1;
  updatedAt: string;
  entries: Record<string, LedgerEntry>;
}

const EMPTY: LedgerFile = { version: 1, updatedAt: new Date(0).toISOString(), entries: {} };

export async function loadLedger(): Promise<Record<string, LedgerEntry>> {
  try {
    const raw = await fs.readFile(LEDGER_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as LedgerFile;
    return parsed.entries ?? {};
  } catch {
    // Missing or corrupt ledger is a normal cold start, not an error.
    return {};
  }
}

export async function saveLedger(entries: Record<string, LedgerEntry>): Promise<void> {
  const file: LedgerFile = {
    ...EMPTY,
    updatedAt: new Date().toISOString(),
    entries,
  };
  await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
  await fs.writeFile(LEDGER_PATH, JSON.stringify(file, null, 2));
}

export function recordApplied(
  entries: Record<string, LedgerEntry>,
  sku: string,
  tier: TierId,
  price: number
): Record<string, LedgerEntry> {
  const at = new Date().toISOString();
  const prior = entries[sku];
  const history = [...(prior?.history ?? []), { tier, price, at }].slice(-12);

  return {
    ...entries,
    [sku]: { sku, lastTier: tier, lastPrice: price, lastAppliedAt: at, history },
  };
}

/**
 * True when this SKU is already sitting at this tier and price, so the run can
 * skip it. Price is compared with a cent of tolerance to survive rounding.
 */
export function alreadyApplied(
  entries: Record<string, LedgerEntry>,
  sku: string,
  tier: TierId,
  price: number
): boolean {
  const entry = entries[sku];
  if (!entry) return false;
  return entry.lastTier === tier && Math.abs(entry.lastPrice - price) < 0.01;
}
