import fs from 'fs/promises';
import path from 'path';
import type { MarketplaceId } from '../config';
import type { EditResult, ListingEdit } from '../types';

/**
 * Work queue for the marketplaces that have no public write API.
 *
 * Poshmark and Mercari both refuse programmatic listing edits — Poshmark has no
 * public API at all, and Mercari's is closed to third parties. Neither can be
 * driven the way eBay can, so the ladder does the deciding and hands off the
 * doing: each entry here is a fully-specified edit (target price, new title,
 * banner) that Vendoo's crosslist sync or a person applies. Nothing about the
 * decision is left to whoever picks it up.
 *
 * The CSV feed already carries the same target prices, so for anyone using
 * Vendoo this queue is a record and a checklist rather than the delivery path.
 */

const QUEUE_PATH =
  process.env.STALE_QUEUE_PATH || path.join(process.cwd(), 'public/logs/stale-queue.json');

export interface QueueItem {
  id: string;
  sku: string;
  marketplace: MarketplaceId;
  tier: string;
  tierLabel: string;
  daysInInventory: number;
  currentPrice: number;
  targetPrice: number;
  newTitle?: string;
  descriptionBanner?: string | null;
  bump: boolean;
  listingUrl?: string;
  createdAt: string;
  status: 'open' | 'done' | 'dismissed';
}

interface QueueFile {
  version: 1;
  updatedAt: string;
  items: QueueItem[];
}

export async function loadQueue(): Promise<QueueItem[]> {
  try {
    const raw = await fs.readFile(QUEUE_PATH, 'utf-8');
    return (JSON.parse(raw) as QueueFile).items ?? [];
  } catch {
    return [];
  }
}

async function saveQueue(items: QueueItem[]): Promise<void> {
  const file: QueueFile = { version: 1, updatedAt: new Date().toISOString(), items };
  await fs.mkdir(path.dirname(QUEUE_PATH), { recursive: true });
  await fs.writeFile(QUEUE_PATH, JSON.stringify(file, null, 2));
}

/** Stable per SKU+marketplace+tier, so re-runs replace rather than pile up. */
function queueId(edit: ListingEdit, marketplace: MarketplaceId): string {
  return `${edit.sku}::${marketplace}::${edit.tier}`;
}

export async function enqueueEdits(
  edits: ListingEdit[],
  marketplaces: MarketplaceId[]
): Promise<EditResult[]> {
  const existing = await loadQueue();
  const byId = new Map(existing.map(item => [item.id, item]));
  const results: EditResult[] = [];

  for (const edit of edits) {
    for (const marketplace of marketplaces) {
      const id = queueId(edit, marketplace);

      // An entry a human already closed stays closed — re-running the ladder
      // must not reopen work someone deliberately dismissed.
      const prior = byId.get(id);
      if (prior && prior.status !== 'open') {
        results.push({
          sku: edit.sku,
          marketplace,
          channel: 'queue',
          status: 'skipped',
          detail: `already ${prior.status}`,
        });
        continue;
      }

      byId.set(id, {
        id,
        sku: edit.sku,
        marketplace,
        tier: edit.tier,
        tierLabel: edit.tierLabel,
        daysInInventory: edit.daysInInventory,
        currentPrice: edit.price.originalPrice,
        targetPrice: edit.price.targetPrice,
        newTitle: edit.titles[marketplace],
        descriptionBanner: edit.descriptionBanner,
        bump: edit.bump,
        listingUrl: marketplace === 'poshmark' ? edit.poshmarkUrl : undefined,
        createdAt: prior?.createdAt ?? new Date().toISOString(),
        status: 'open',
      });

      results.push({
        sku: edit.sku,
        marketplace,
        channel: 'queue',
        status: 'queued',
        detail: `$${edit.price.originalPrice} -> $${edit.price.targetPrice}`,
      });
    }
  }

  await saveQueue([...byId.values()]);
  return results;
}

export async function setQueueItemStatus(
  id: string,
  status: QueueItem['status']
): Promise<boolean> {
  const items = await loadQueue();
  const target = items.find(item => item.id === id);
  if (!target) return false;

  target.status = status;
  await saveQueue(items);
  return true;
}
