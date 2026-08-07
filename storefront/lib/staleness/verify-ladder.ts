/**
 * Verification harness for the ladder's money math.
 *
 * Run: npx tsx lib/staleness/verify-ladder.ts
 *
 * Covers the properties that cost real margin if they break: tier boundaries,
 * the floor, idempotency under replay, and suppression via the ledger.
 */

import { resolveTier, DEFAULT_CONFIG } from './config';
import { buildPlan, decidePrice, stalePriceMap } from './engine';
import { recordApplied } from './ledger';
import type { InventoryItem } from '../data/sheets-fetcher';
import type { LedgerEntry } from './types';

let passed = 0;
let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
  ok ? passed++ : failed++;
}

function assert(label: string, condition: boolean) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  condition ? passed++ : failed++;
}

function item(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    sku: 'SKU-00001',
    brand: 'Nike',
    gender: 'Men',
    garment: 'Jacket',
    condition: '9/10 — Like New',
    conditionScore: 9,
    price: 60,
    listedPrice: 100,
    notes: '',
    status: 'In Stock',
    daysInInventory: 0,
    ...overrides,
  };
}

console.log('\n--- tier boundaries ---');
check('day 0 -> fresh', resolveTier(0).id, 'fresh');
check('day 29 -> fresh', resolveTier(29).id, 'fresh');
check('day 30 -> tier_30', resolveTier(30).id, 'tier_30');
check('day 59 -> tier_30', resolveTier(59).id, 'tier_30');
check('day 60 -> tier_60', resolveTier(60).id, 'tier_60');
check('day 90 -> tier_90', resolveTier(90).id, 'tier_90');
check('day 120 -> liquidate', resolveTier(120).id, 'tier_liquidate');
check('day 9999 -> liquidate', resolveTier(9999).id, 'tier_liquidate');
check('negative days clamps to fresh', resolveTier(-5).id, 'fresh');

console.log('\n--- price ladder on a $100 listing (realistic $60, floor $30) ---');
const cfg = DEFAULT_CONFIG;
check('tier_30 -> 90%', decidePrice(item(), resolveTier(30), cfg).targetPrice, 89.99);
check('tier_60 -> 75%', decidePrice(item(), resolveTier(60), cfg).targetPrice, 74.99);
check('tier_90 -> 60%', decidePrice(item(), resolveTier(90), cfg).targetPrice, 59.99);

console.log('\n--- floor protection ---');
// Realistic value $60 -> floor is 50% = $30. A 60% tier on a $40 listing wants
// $24, which is below that floor.
const thin = item({ listedPrice: 40, price: 60 });
const floored = decidePrice(thin, resolveTier(90), cfg);
check('floor overrides the tier ask', floored.targetPrice, 30);
assert('floored flag is set', floored.floored === true);
check('floor attributed to realistic value', floored.floorSource, 'realistic_value');

// Cheap item: realistic $10 -> 50% = $5, below the $8 absolute floor.
const cheap = item({ listedPrice: 12, price: 10 });
const cheapDecision = decidePrice(cheap, resolveTier(90), cfg);
check('absolute floor applies', cheapDecision.targetPrice, 8);
check('floor attributed to absolute', cheapDecision.floorSource, 'absolute');

console.log('\n--- idempotency: replaying a tier must not compound ---');
const stale = item({ daysInInventory: 65 });
const first = decidePrice(stale, resolveTier(65), cfg).targetPrice;
const tenth = Array.from({ length: 10 }).reduce<number>(
  () => decidePrice(stale, resolveTier(65), cfg).targetPrice,
  0
);
check('10 replays land on the same price', tenth, first);

console.log('\n--- plan construction ---');
const inventory: InventoryItem[] = [
  item({ sku: 'FRESH-1', daysInInventory: 5 }),
  item({ sku: 'STALE-30', daysInInventory: 35 }),
  item({ sku: 'STALE-60', daysInInventory: 65 }),
  item({ sku: 'STALE-90', daysInInventory: 95 }),
  item({ sku: 'DEAD-120', daysInInventory: 130 }),
  item({ sku: 'SOLD-1', daysInInventory: 200, status: 'Sold' }),
  item({ sku: 'NOPRICE', daysInInventory: 45, listedPrice: 0, price: 0 }),
];

const plan = buildPlan(inventory, {});
const editedSkus = plan.edits.map(e => e.sku);

check('edits cover only the actionable tiers', editedSkus, ['STALE-90', 'STALE-60', 'STALE-30']);
assert('sold item is skipped', plan.skipped.some(s => s.sku === 'SOLD-1' && s.reason === 'inactive_status'));
assert('priceless item is skipped', plan.skipped.some(s => s.sku === 'NOPRICE' && s.reason === 'no_listed_price'));
assert('fresh item is skipped', plan.skipped.some(s => s.sku === 'FRESH-1' && s.reason === 'tier_unchanged'));
assert('120d item routed to human review', plan.humanReview.some(e => e.sku === 'DEAD-120'));
assert('120d item is NOT auto-edited', !editedSkus.includes('DEAD-120'));
assert('edits are ordered most-stale-first', plan.edits[0].daysInInventory === 95);

console.log('\n--- ledger suppression ---');
let ledger: Record<string, LedgerEntry> = {};
const target = plan.edits.find(e => e.sku === 'STALE-60')!;
ledger = recordApplied(ledger, 'STALE-60', 'tier_60', target.price.targetPrice);

const second = buildPlan(inventory, ledger);
assert('applied SKU drops out of the next run', !second.edits.some(e => e.sku === 'STALE-60'));
assert('un-applied SKUs still queue', second.edits.some(e => e.sku === 'STALE-30'));
assert(
  'suppressed SKU is reported as already_at_target',
  second.skipped.some(s => s.sku === 'STALE-60' && s.reason === 'already_at_target')
);

console.log('\n--- run cap ---');
const many = Array.from({ length: 50 }, (_, i) =>
  item({ sku: `BULK-${i}`, daysInInventory: 40 + i })
);
const capped = buildPlan(many, {}, { maxEditsPerRun: 10 });
check('cap is enforced', capped.edits.length, 10);
assert('cap keeps the stalest items', capped.edits[0].daysInInventory === 89);
assert('overflow is reported', capped.skipped.some(s => s.reason === 'run_cap_reached'));

console.log('\n--- title limits ---');
const longName = item({
  sku: 'LONG-1',
  daysInInventory: 95,
  brand: 'Patagonia Worn Wear Collection',
  garment: 'Insulated Puffer Jacket With Hood',
});
const longEdit = buildPlan([longName], {}).edits[0];
assert('eBay title within 80 chars', (longEdit.titles.ebay?.length ?? 0) <= 80);
assert('Poshmark title within 50 chars', (longEdit.titles.poshmark?.length ?? 0) <= 50);
assert('Mercari title within 40 chars', (longEdit.titles.mercari?.length ?? 0) <= 40);
assert('clearance marker survives truncation', longEdit.titles.ebay!.startsWith('CLEARANCE'));

console.log('\n--- CSV feed price map ---');
const feed = stalePriceMap(inventory);
assert('fresh item absent from the feed map', !feed.has('FRESH-1'));
assert('sold item absent from the feed map', !feed.has('SOLD-1'));
check('60d item priced at 75%', feed.get('STALE-60')?.price, 74.99);
assert(
  'liquidate item still carries its price in the feed',
  feed.get('DEAD-120')?.price === 59.99
);

console.log(`\n${'='.repeat(46)}`);
console.log(`${passed} passed, ${failed} failed`);
console.log('='.repeat(46));

if (failed > 0) process.exit(1);
