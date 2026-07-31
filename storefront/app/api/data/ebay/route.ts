import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';
import { logSync, setActiveSync } from '@/lib/data/sync-state';

const EBAY_API_BASE = 'https://api.ebay.com/sell/inventory/v1';
const TOKEN = process.env.EBAY_TOKEN;
const ACCOUNT_ID = process.env.EBAY_ACCOUNT_ID;

export async function POST(request: NextRequest) {
  if (!TOKEN || !ACCOUNT_ID) {
    return NextResponse.json(
      {
        success: false,
        error: 'eBay credentials not configured (EBAY_TOKEN, EBAY_ACCOUNT_ID)',
      },
      { status: 400 }
    );
  }

  try {
    await setActiveSync(true);
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsProcessed = 0;
    let recordsSkipped = 0;

    // Fetch current inventory from Google Sheets
    let inventory;
    try {
      inventory = await fetchAndParseInventory();
    } catch (error) {
      errors.push(
        `Failed to fetch inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      await setActiveSync(false);
      return NextResponse.json(
        { success: false, error: errors[0] },
        { status: 500 }
      );
    }

    // Sync each item to eBay (demo implementation)
    for (const item of inventory) {
      try {
        // Match eBay listing by SKU (you would need to maintain a SKU↔listing ID mapping)
        const skuMatchResult = await matchSkuToEbayListing(item.sku);

        if (!skuMatchResult.listingId) {
          recordsSkipped++;
          continue; // Skip items not found on eBay
        }

        // Update eBay listing with current inventory data
        await updateEbayListing(
          skuMatchResult.listingId,
          {
            quantity: item.status.toLowerCase() === 'in stock' ? 1 : 0,
            price: item.price,
            description: buildEbayDescription(item),
          }
        );

        recordsProcessed++;
      } catch (error) {
        errors.push(
          `SKU ${item.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    const duration = Date.now() - startTime;

    // Log the sync
    await logSync({
      timestamp: new Date().toISOString(),
      source: 'ebay',
      status: errors.length === 0 ? 'success' : 'error',
      recordsProcessed,
      recordsSkipped,
      errors,
      duration,
      details: {
        source: 'eBay Listings',
        itemsChecked: inventory.length,
        itemsMatched: recordsProcessed + recordsSkipped,
      },
    });

    await setActiveSync(false);

    return NextResponse.json({
      success: errors.length === 0,
      recordsProcessed,
      recordsSkipped,
      totalChecked: inventory.length,
      errors,
      duration,
    });
  } catch (error) {
    await setActiveSync(false);

    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logSync({
      timestamp: new Date().toISOString(),
      source: 'ebay',
      status: 'error',
      recordsProcessed: 0,
      recordsSkipped: 0,
      errors: [errorMsg],
      duration: 0,
    });

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

async function matchSkuToEbayListing(
  sku: string
): Promise<{ listingId?: string; error?: string }> {
  // TODO: Implement SKU matching logic
  // Option 1: Query eBay inventory API to find listing by custom label (SKU)
  // Option 2: Use a local mapping table (database or JSON file)
  //
  // For now, return placeholder to indicate feature needs setup
  return { error: 'SKU matching not yet configured' };
}

async function updateEbayListing(
  listingId: string,
  updates: { quantity: number; price: number; description: string }
) {
  // TODO: Call eBay API to update listing
  // PATCH /sell/inventory/v1/inventory_item/{sku}
  // with { quantity_available: number, price: { value, currency } }
  //
  // Requires:
  // - Valid eBay OAuth token
  // - Listing ID / SKU mapping
  // - Conversion of our pricing to eBay format

  console.log(`[eBay] Would update listing ${listingId}:`, updates);
  // throw new Error('eBay API integration in progress');
}

function buildEbayDescription(item: any): string {
  return `
${item.brand} ${item.garment}
Condition: ${item.condition}
Department: ${item.gender}
Notes: ${item.notes}

Listed from EHC Inventory. Contact for details.
  `.trim();
}
