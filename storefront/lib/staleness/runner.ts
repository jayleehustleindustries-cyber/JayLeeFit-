import { fetchAndParseInventory } from '../data/sheets-fetcher';
import { recordSync } from '../data/sync-state';
import { applyToEbay, ebayConfigured } from './adapters/ebay';
import { enqueueEdits } from './adapters/queue';
import { loadConfig, type MarketplaceId, type StalenessConfig } from './config';
import { buildPlan } from './engine';
import { loadLedger, recordApplied, saveLedger } from './ledger';
import type { EditResult, StalenessRunReport } from './types';

/**
 * Orchestrates one pass of the ladder: read the sheet, decide, execute, record.
 *
 * Three delivery channels, in order of directness:
 *   ebay-api — immediate revise, when EBAY_OAUTH_TOKEN is present
 *   queue    — Poshmark/Mercari, which have no public write API
 *   csv      — always live; the export endpoint serves ladder prices, so
 *              whatever Vendoo pulls next is already marked down
 *
 * The CSV channel is the one that needs no credentials, which makes it the
 * floor of the system: even with every adapter dark, prices still move.
 */

export interface RunOptions {
  dryRun?: boolean;
  config?: Partial<StalenessConfig>;
}

export async function runStalenessPass(
  options: RunOptions = {}
): Promise<StalenessRunReport> {
  const startedAt = new Date();
  const dryRun = options.dryRun ?? false;
  const config = { ...loadConfig(), ...options.config };

  const inventory = await fetchAndParseInventory();
  const ledger = await loadLedger();
  const plan = buildPlan(inventory, ledger, config);

  if (dryRun) {
    return finish(startedAt, plan, [], true);
  }

  const results: EditResult[] = [];
  let nextLedger = ledger;

  // eBay first: it is the only channel that can confirm the edit landed, so
  // its result decides what the ledger records.
  const ebayTargeted = plan.edits.filter(edit => edit.targets.includes('ebay'));
  if (ebayTargeted.length > 0) {
    for (const edit of ebayTargeted) {
      const result = await applyToEbay(edit);
      results.push(result);
      if (result.status === 'applied') {
        nextLedger = recordApplied(nextLedger, edit.sku, edit.tier, edit.price.targetPrice);
      }
    }
  }

  const queueTargets = config.marketplaces.filter(
    (m): m is MarketplaceId => m === 'poshmark' || m === 'mercari'
  );
  if (queueTargets.length > 0 && plan.edits.length > 0) {
    results.push(...(await enqueueEdits(plan.edits, queueTargets)));
  }

  // The CSV feed carries every edit unconditionally — it reads target prices
  // straight from the ladder rather than from anything executed above.
  for (const edit of plan.edits) {
    results.push({
      sku: edit.sku,
      marketplace: 'ebay',
      channel: 'csv',
      status: 'applied',
      detail: `feed price $${edit.price.targetPrice}`,
    });

    // Anything eBay did not confirm still counts as delivered via CSV, so the
    // ledger records it and the next run does not re-queue the same work.
    if (!ebayConfigured() || !edit.ebayItemId) {
      nextLedger = recordApplied(nextLedger, edit.sku, edit.tier, edit.price.targetPrice);
    }
  }

  try {
    await saveLedger(nextLedger);
  } catch (error) {
    // A read-only filesystem costs suppression, not correctness: targets are
    // absolute, so the next run recomputes the same prices and re-applies them
    // as no-ops rather than stacking a second markdown.
    console.warn('[staleness] ledger not persisted:', error);
  }

  const report = finish(startedAt, plan, results, false);

  try {
    await recordSync({
      timestamp: report.finishedAt,
      source: 'staleness',
      status: report.counts.errored > 0 ? 'error' : 'success',
      recordsProcessed: report.counts.applied + report.counts.queued,
      recordsSkipped: plan.counts.skipped,
      errors: results.filter(r => r.status === 'error').map(r => `${r.sku}: ${r.detail}`),
      duration: report.durationMs,
      details: {
        byTier: plan.counts.byTier,
        humanReview: plan.counts.humanReview,
        ebayDirect: ebayConfigured(),
      },
    });
  } catch (error) {
    console.warn('[staleness] sync log not persisted:', error);
  }

  return report;
}

function finish(
  startedAt: Date,
  plan: StalenessRunReport['plan'],
  results: EditResult[],
  dryRun: boolean
): StalenessRunReport {
  const finishedAt = new Date();

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    dryRun,
    plan,
    results,
    counts: {
      applied: results.filter(r => r.status === 'applied').length,
      queued: results.filter(r => r.status === 'queued').length,
      errored: results.filter(r => r.status === 'error').length,
    },
  };
}
