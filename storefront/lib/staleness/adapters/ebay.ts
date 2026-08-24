import type { EditResult, ListingEdit } from '../types';

/**
 * Direct eBay adapter for the everyday_hustle_clothing_co store.
 *
 * Uses the Trading API's ReviseFixedPriceItem because the ladder addresses
 * listings by the item ID already sitting in the sheet's "eBay Link" column —
 * no separate inventory/offer mapping to maintain. Revising an existing listing
 * also preserves its watchers and sales history, which relisting would discard.
 *
 * Inert until EBAY_OAUTH_TOKEN is set: with no credentials every call reports
 * `skipped`, and the ladder still reaches eBay through the CSV feed Vendoo
 * pulls. Adding the token upgrades eBay from "next Vendoo sync" to "immediate".
 */

const EBAY_ENDPOINT = process.env.EBAY_API_ENDPOINT || 'https://api.ebay.com/ws/api.dll';
const COMPAT_LEVEL = '1193';
const SITE_ID = process.env.EBAY_SITE_ID || '0'; // 0 = eBay US

export function ebayConfigured(): boolean {
  return Boolean(process.env.EBAY_OAUTH_TOKEN);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildReviseXml(edit: ListingEdit): string {
  const title = edit.titles.ebay;
  const description = edit.descriptionBanner;

  return `<?xml version="1.0" encoding="utf-8"?>
<ReviseFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <ItemID>${escapeXml(edit.ebayItemId!)}</ItemID>
    <StartPrice currencyID="USD">${edit.price.targetPrice.toFixed(2)}</StartPrice>${
      title ? `\n    <Title>${escapeXml(title)}</Title>` : ''
    }${description ? `\n    <Description><![CDATA[${description}]]></Description>` : ''}
  </Item>
</ReviseFixedPriceItemRequest>`;
}

/** Trading API returns 200 with Ack=Failure on business errors, so parse the body. */
function parseAck(xml: string): { ok: boolean; message: string } {
  const ack = xml.match(/<Ack>(\w+)<\/Ack>/)?.[1] ?? 'Unknown';
  if (ack === 'Success' || ack === 'Warning') {
    return { ok: true, message: ack };
  }
  const shortMsg = xml.match(/<ShortMessage>([^<]*)<\/ShortMessage>/)?.[1];
  const errCode = xml.match(/<ErrorCode>([^<]*)<\/ErrorCode>/)?.[1];
  return {
    ok: false,
    message: shortMsg ? `${shortMsg}${errCode ? ` (code ${errCode})` : ''}` : `Ack=${ack}`,
  };
}

export async function applyToEbay(edit: ListingEdit): Promise<EditResult> {
  const base = { sku: edit.sku, marketplace: 'ebay' as const, channel: 'ebay-api' as const };

  if (!ebayConfigured()) {
    return {
      ...base,
      status: 'skipped',
      detail: 'EBAY_OAUTH_TOKEN not set — falling back to the CSV feed',
    };
  }

  if (!edit.ebayItemId) {
    return {
      ...base,
      status: 'skipped',
      detail: 'no eBay item ID in the sheet\'s eBay Link column',
    };
  }

  try {
    const response = await fetch(EBAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'X-EBAY-API-CALL-NAME': 'ReviseFixedPriceItem',
        'X-EBAY-API-SITEID': SITE_ID,
        'X-EBAY-API-COMPATIBILITY-LEVEL': COMPAT_LEVEL,
        'X-EBAY-API-IAF-TOKEN': process.env.EBAY_OAUTH_TOKEN!,
      },
      body: buildReviseXml(edit),
      signal: AbortSignal.timeout(20_000),
    });

    const body = await response.text();

    if (!response.ok) {
      return { ...base, status: 'error', detail: `HTTP ${response.status}` };
    }

    const ack = parseAck(body);
    return ack.ok
      ? { ...base, status: 'applied', detail: `revised to $${edit.price.targetPrice}` }
      : { ...base, status: 'error', detail: ack.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return { ...base, status: 'error', detail: message };
  }
}
