import type { InventoryItem } from '../data/sheets-fetcher';
import {
  loadConfig,
  resolveTier,
  type StalenessConfig,
  type TierId,
  type TierRule,
} from './config';
import { descriptionFor, extractEbayItemId, titlesForTargets } from './content';
import { alreadyApplied } from './ledger';
import type {
  LedgerEntry,
  ListingEdit,
  PriceDecision,
  SkippedItem,
  StalenessPlan,
} from './types';

/**
 * The decision half of the ladder. Pure: inventory + ledger in, plan out, no IO
 * and no side effects — so it can be dry-run against production data safely and
 * is trivial to reason about when a price looks wrong.
 */

function isActive(item: InventoryItem, config: StalenessConfig): boolean {
  const status = (item.status || '').toLowerCase();
  return !config.inactiveStatuses.some(bad => status.includes(bad));
}

/** Rounds to the config step, then takes a .99 charm ending. */
function roundPrice(value: number, config: StalenessConfig): number {
  const stepped = Math.round(value / config.roundTo) * config.roundTo;
  return Math.round(Math.max(0, stepped - 0.01) * 100) / 100;
}

export function decidePrice(
  item: InventoryItem,
  tier: TierRule,
  config: StalenessConfig
): PriceDecision {
  // The anchor is the sheet's original listed price. Because the ladder never
  // writes back to the sheet, this anchor stays fixed for the item's whole
  // life — which is exactly what keeps the targets absolute.
  const originalPrice = item.listedPrice || item.price;
  const rawTarget = originalPrice * tier.priceMultiplier;

  const realisticFloor = (item.price || originalPrice) * config.floorPctOfRealistic;
  const floorSource = realisticFloor > config.absoluteFloor ? 'realistic_value' : 'absolute';
  const floor = Math.max(config.absoluteFloor, realisticFloor);

  const rounded = roundPrice(rawTarget, config);
  const targetPrice = Math.max(floor, rounded);

  return {
    originalPrice,
    rawTarget: Math.round(rawTarget * 100) / 100,
    floor: Math.round(floor * 100) / 100,
    floorSource,
    targetPrice: Math.round(targetPrice * 100) / 100,
    floored: targetPrice > rounded,
  };
}

function emptyTierCounts(): Record<TierId, number> {
  return { fresh: 0, tier_30: 0, tier_60: 0, tier_90: 0, tier_liquidate: 0 };
}

export function buildPlan(
  inventory: InventoryItem[],
  ledger: Record<string, LedgerEntry> = {},
  configOverride?: Partial<StalenessConfig>
): StalenessPlan {
  const config = { ...loadConfig(), ...configOverride };

  const edits: ListingEdit[] = [];
  const humanReview: ListingEdit[] = [];
  const skipped: SkippedItem[] = [];
  const byTier = emptyTierCounts();

  for (const item of inventory) {
    const tier = resolveTier(item.daysInInventory);
    byTier[tier.id] += 1;

    if (!isActive(item, config)) {
      skipped.push({
        sku: item.sku,
        reason: 'inactive_status',
        tier: tier.id,
        daysInInventory: item.daysInInventory,
        detail: item.status,
      });
      continue;
    }

    if (!item.listedPrice && !item.price) {
      skipped.push({
        sku: item.sku,
        reason: 'no_listed_price',
        tier: tier.id,
        daysInInventory: item.daysInInventory,
      });
      continue;
    }

    // Nothing on the ladder to do for a fresh item.
    if (tier.priceMultiplier === 1 && !tier.titlePrefix && !tier.bump) {
      skipped.push({
        sku: item.sku,
        reason: 'tier_unchanged',
        tier: tier.id,
        daysInInventory: item.daysInInventory,
      });
      continue;
    }

    const price = decidePrice(item, tier, config);
    const targets = config.marketplaces;

    const edit: ListingEdit = {
      sku: item.sku,
      brand: item.brand,
      garment: item.garment,
      tier: tier.id,
      tierLabel: tier.label,
      daysInInventory: item.daysInInventory,
      price,
      titles: titlesForTargets(item, tier, targets),
      descriptionBanner: descriptionFor(item, tier),
      bump: tier.bump,
      targets,
      ebayItemId: extractEbayItemId(item.ebayUrl),
      poshmarkUrl: item.poshmarkUrl,
    };

    if (tier.requiresHumanReview) {
      humanReview.push(edit);
      skipped.push({
        sku: item.sku,
        reason: 'human_review_required',
        tier: tier.id,
        daysInInventory: item.daysInInventory,
        detail: `${item.daysInInventory}d old — needs a lot-sale / donate / keep call`,
      });
      continue;
    }

    if (alreadyApplied(ledger, item.sku, tier.id, price.targetPrice)) {
      skipped.push({
        sku: item.sku,
        reason: 'already_at_target',
        tier: tier.id,
        daysInInventory: item.daysInInventory,
        detail: `already at $${price.targetPrice}`,
      });
      continue;
    }

    edits.push(edit);
  }

  // Oldest first — if the run cap bites, the most stale inventory is the part
  // that still gets moved.
  edits.sort((a, b) => b.daysInInventory - a.daysInInventory);

  const capped = edits.slice(0, config.maxEditsPerRun);
  for (const overflow of edits.slice(config.maxEditsPerRun)) {
    skipped.push({
      sku: overflow.sku,
      reason: 'run_cap_reached',
      tier: overflow.tier,
      daysInInventory: overflow.daysInInventory,
      detail: `cap is ${config.maxEditsPerRun} edits/run`,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    edits: capped,
    skipped,
    humanReview,
    counts: {
      scanned: inventory.length,
      edits: capped.length,
      skipped: skipped.length,
      humanReview: humanReview.length,
      byTier,
    },
  };
}

/**
 * SKU -> target price for every item currently on the ladder, including the
 * ones the ledger says are already applied. The CSV export uses this so the
 * feed Vendoo pulls always reflects ladder prices, not just this run's deltas.
 */
export function stalePriceMap(
  inventory: InventoryItem[],
  configOverride?: Partial<StalenessConfig>
): Map<string, { price: number; tier: TierId; tierLabel: string; days: number }> {
  const config = { ...loadConfig(), ...configOverride };
  const map = new Map<string, { price: number; tier: TierId; tierLabel: string; days: number }>();

  for (const item of inventory) {
    if (!isActive(item, config)) continue;
    if (!item.listedPrice && !item.price) continue;

    const tier = resolveTier(item.daysInInventory);
    if (tier.priceMultiplier === 1) continue;

    map.set(item.sku, {
      price: decidePrice(item, tier, config).targetPrice,
      tier: tier.id,
      tierLabel: tier.label,
      days: item.daysInInventory,
    });
  }

  return map;
}
