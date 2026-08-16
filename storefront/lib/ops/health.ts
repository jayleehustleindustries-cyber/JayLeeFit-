import type { InventoryItem } from '../data/sheets-fetcher';
import { resolveTier, type TierId } from '../staleness/config';
import { decidePrice } from '../staleness/engine';
import { loadConfig } from '../staleness/config';
import { getLastSync } from '../data/sync-state';
import type {
  Alert,
  HealthGrade,
  InventoryMetrics,
  ItemHealth,
  OpsHealthReport,
  PipelineStatus,
  TierBreakdown,
} from './types';

const TIER_LABELS: Record<TierId, string> = {
  fresh: 'Fresh (0-29d)',
  tier_30: '30-Day Nudge',
  tier_60: '60-Day Drop',
  tier_90: '90-Day Clearance',
  tier_liquidate: 'Liquidate (120d+)',
};

function scoreItem(item: InventoryItem): ItemHealth {
  const issues: string[] = [];
  let score = 100;

  const hasPhoto = !!(item.driveFolder);
  const hasEbayLink = !!(item.ebayUrl);
  const hasPoshmarkLink = !!(item.poshmarkUrl);
  const hasPrice = item.listedPrice > 0;
  const hasCondition = item.conditionScore > 0;
  const tier = resolveTier(item.daysInInventory);

  if (!hasPhoto) {
    score -= 25;
    issues.push('No photo linked');
  }

  if (!hasPrice) {
    score -= 30;
    issues.push('No listed price');
  }

  if (!hasCondition) {
    score -= 10;
    issues.push('Missing condition score');
  }

  if (!hasEbayLink && !hasPoshmarkLink) {
    score -= 20;
    issues.push('Not listed on any marketplace');
  } else {
    if (!hasEbayLink) {
      score -= 5;
      issues.push('No eBay listing');
    }
    if (!hasPoshmarkLink) {
      score -= 5;
      issues.push('No Poshmark listing');
    }
  }

  if (!item.brand) {
    score -= 5;
    issues.push('Missing brand');
  }

  if (!item.garment) {
    score -= 5;
    issues.push('Missing garment type');
  }

  const grade: HealthGrade = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';

  return {
    sku: item.sku,
    brand: item.brand,
    garment: item.garment,
    score: Math.max(0, score),
    grade,
    issues,
    hasPhoto,
    hasEbayLink,
    hasPoshmarkLink,
    hasPrice,
    hasCondition,
    tier: tier.id,
    daysInInventory: item.daysInInventory,
    status: item.status,
  };
}

function computeMetrics(items: InventoryItem[], healthScores: ItemHealth[]): InventoryMetrics {
  const config = loadConfig();
  const active = items.filter(
    i => !config.inactiveStatuses.some(s => (i.status || '').toLowerCase().includes(s))
  );
  const sold = items.filter(i => (i.status || '').toLowerCase().includes('sold'));

  const totalListedValue = active.reduce((sum, i) => sum + (i.listedPrice || 0), 0);
  let totalLadderValue = 0;

  const tierBuckets: Record<TierId, { count: number; value: number; days: number }> = {
    fresh: { count: 0, value: 0, days: 0 },
    tier_30: { count: 0, value: 0, days: 0 },
    tier_60: { count: 0, value: 0, days: 0 },
    tier_90: { count: 0, value: 0, days: 0 },
    tier_liquidate: { count: 0, value: 0, days: 0 },
  };

  for (const item of active) {
    const tier = resolveTier(item.daysInInventory);
    const bucket = tierBuckets[tier.id];
    bucket.count += 1;
    bucket.days += item.daysInInventory;

    if (item.listedPrice > 0) {
      const price = decidePrice(item, tier, config);
      bucket.value += price.targetPrice;
      totalLadderValue += price.targetPrice;
    }
  }

  const tierBreakdown: TierBreakdown[] = (
    Object.entries(tierBuckets) as [TierId, { count: number; value: number; days: number }][]
  ).map(([tier, b]) => ({
    tier,
    label: TIER_LABELS[tier],
    count: b.count,
    totalValue: Math.round(b.value * 100) / 100,
    avgDays: b.count > 0 ? Math.round(b.days / b.count) : 0,
  }));

  const avgDays = active.length > 0
    ? Math.round(active.reduce((s, i) => s + i.daysInInventory, 0) / active.length)
    : 0;

  const avgScore = healthScores.length > 0
    ? Math.round(healthScores.reduce((s, h) => s + h.score, 0) / healthScores.length)
    : 0;

  return {
    totalItems: items.length,
    activeItems: active.length,
    soldItems: sold.length,
    avgDaysInInventory: avgDays,
    avgListedPrice: active.length > 0
      ? Math.round((totalListedValue / active.length) * 100) / 100
      : 0,
    totalListedValue: Math.round(totalListedValue * 100) / 100,
    totalLadderValue: Math.round(totalLadderValue * 100) / 100,
    potentialRecovery: Math.round((totalListedValue - totalLadderValue) * 100) / 100,
    completenessScore: avgScore,
    tierBreakdown,
  };
}

function generateAlerts(
  items: InventoryItem[],
  healthScores: ItemHealth[],
  metrics: InventoryMetrics
): Alert[] {
  const alerts: Alert[] = [];

  const noPhotos = healthScores.filter(h => !h.hasPhoto && h.grade !== 'red');
  if (noPhotos.length > 0) {
    alerts.push({
      id: 'missing-photos',
      severity: noPhotos.length > 10 ? 'critical' : 'warning',
      category: 'listing-quality',
      message: `${noPhotos.length} active item${noPhotos.length === 1 ? '' : 's'} without photos`,
      items: noPhotos.map(h => h.sku),
      actionable: true,
      suggestedAction: 'Upload photos to EHC Image Import Folder and run Drive sync',
    });
  }

  const unlistedItems = healthScores.filter(h => !h.hasEbayLink && !h.hasPoshmarkLink);
  if (unlistedItems.length > 0) {
    alerts.push({
      id: 'unlisted-items',
      severity: unlistedItems.length > 5 ? 'warning' : 'info',
      category: 'marketplace-coverage',
      message: `${unlistedItems.length} item${unlistedItems.length === 1 ? '' : 's'} not listed on any marketplace`,
      items: unlistedItems.map(h => h.sku),
      actionable: true,
      suggestedAction: 'Create listings on eBay and Poshmark, then update the sheet with URLs',
    });
  }

  const noPriceItems = healthScores.filter(h => !h.hasPrice);
  if (noPriceItems.length > 0) {
    alerts.push({
      id: 'missing-prices',
      severity: 'critical',
      category: 'pricing',
      message: `${noPriceItems.length} item${noPriceItems.length === 1 ? '' : 's'} with no listed price — invisible to the staleness ladder`,
      items: noPriceItems.map(h => h.sku),
      actionable: true,
      suggestedAction: 'Add Price Listed values in the EHC Inventory Log',
    });
  }

  const staleCount = metrics.tierBreakdown
    .filter(t => t.tier === 'tier_60' || t.tier === 'tier_90' || t.tier === 'tier_liquidate')
    .reduce((s, t) => s + t.count, 0);

  if (staleCount > 0 && metrics.activeItems > 0) {
    const stalePct = Math.round((staleCount / metrics.activeItems) * 100);
    if (stalePct > 50) {
      alerts.push({
        id: 'high-staleness',
        severity: 'warning',
        category: 'inventory-age',
        message: `${stalePct}% of active inventory is 60+ days old (${staleCount} items)`,
        actionable: true,
        suggestedAction: 'Consider sourcing new inventory or running flash promotions',
      });
    }
  }

  const liquidateItems = metrics.tierBreakdown.find(t => t.tier === 'tier_liquidate');
  if (liquidateItems && liquidateItems.count > 0) {
    alerts.push({
      id: 'liquidation-queue',
      severity: 'warning',
      category: 'human-review',
      message: `${liquidateItems.count} item${liquidateItems.count === 1 ? '' : 's'} past 120 days awaiting human review — lot-sale, donate, or keep`,
      actionable: true,
      suggestedAction: 'Review items on the dashboard and decide: lot-sale, donate, or keep',
    });
  }

  if (metrics.potentialRecovery > 0) {
    alerts.push({
      id: 'ladder-savings',
      severity: 'info',
      category: 'pricing',
      message: `Staleness ladder is marking down $${metrics.potentialRecovery.toFixed(2)} from original list prices to move aged inventory`,
      actionable: false,
    });
  }

  return alerts;
}

async function getPipelineStatuses(): Promise<PipelineStatus[]> {
  const pipelines: PipelineStatus[] = [];

  const sheetsSync = await getLastSync('sheets');
  pipelines.push({
    name: 'Google Sheets Inventory Sync',
    status: sheetsSync ? 'operational' : 'unconfigured',
    lastRun: sheetsSync,
    detail: sheetsSync
      ? `Last sync: ${new Date(sheetsSync).toLocaleString()}`
      : 'No sync recorded yet',
  });

  const driveSync = await getLastSync('drive');
  pipelines.push({
    name: 'Google Drive Image Sync',
    status: driveSync ? 'operational' : 'unconfigured',
    lastRun: driveSync,
    detail: driveSync
      ? `Last sync: ${new Date(driveSync).toLocaleString()}`
      : 'No image sync recorded yet',
  });

  const stalenessSync = await getLastSync('staleness');
  const cronConfigured = !!process.env.CRON_SECRET;
  pipelines.push({
    name: 'Staleness Ladder (30/60/90)',
    status: stalenessSync ? 'operational' : cronConfigured ? 'operational' : 'unconfigured',
    lastRun: stalenessSync,
    detail: !cronConfigured
      ? 'CRON_SECRET not set — running in preview-only mode'
      : stalenessSync
        ? `Last run: ${new Date(stalenessSync).toLocaleString()}`
        : 'Cron registered, awaiting first run',
  });

  const ebayConfigured = !!process.env.EBAY_OAUTH_TOKEN;
  pipelines.push({
    name: 'eBay Direct API',
    status: ebayConfigured ? 'operational' : 'unconfigured',
    lastRun: null,
    detail: ebayConfigured
      ? 'ReviseFixedPriceItem active for everyday_hustle_clothing_co'
      : 'No EBAY_OAUTH_TOKEN — using CSV feed through Vendoo instead',
  });

  pipelines.push({
    name: 'CSV Feed (Vendoo)',
    status: 'operational',
    lastRun: null,
    detail: 'Always active — /api/data/export?format=csv serves ladder prices',
  });

  return pipelines;
}

export async function buildHealthReport(inventory: InventoryItem[]): Promise<OpsHealthReport> {
  const healthScores = inventory.map(scoreItem);
  const metrics = computeMetrics(inventory, healthScores);
  const alerts = generateAlerts(inventory, healthScores, metrics);
  const pipelines = await getPipelineStatuses();

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  const overallGrade: HealthGrade =
    criticalAlerts > 0 ? 'red' : warningAlerts > 2 ? 'yellow' : 'green';

  return {
    generatedAt: new Date().toISOString(),
    overallGrade,
    metrics,
    pipelines,
    alerts,
    items: healthScores,
  };
}
