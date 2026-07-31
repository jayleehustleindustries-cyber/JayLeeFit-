import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';
import { logSync, setActiveSync, getSyncState } from '@/lib/data/sync-state';

export async function POST(request: NextRequest) {
  try {
    await setActiveSync(true);

    const startTime = Date.now();
    const errors: string[] = [];

    // Sync from Google Sheets
    let recordsProcessed = 0;
    try {
      const inventory = await fetchAndParseInventory();
      recordsProcessed = inventory.length;
    } catch (error) {
      errors.push(
        `Sheets sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const duration = Date.now() - startTime;

    // Log the sync
    await logSync({
      timestamp: new Date().toISOString(),
      source: 'sheets',
      status: errors.length === 0 ? 'success' : 'error',
      recordsProcessed,
      recordsSkipped: 0,
      errors,
      duration,
      details: { source: 'EHC Inventory Log (Google Sheets)' },
    });

    await setActiveSync(false);

    return NextResponse.json({
      success: errors.length === 0,
      recordsProcessed,
      errors,
      duration,
    });
  } catch (error) {
    await setActiveSync(false);

    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logSync({
      timestamp: new Date().toISOString(),
      source: 'sheets',
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

export async function GET(request: NextRequest) {
  // Get current sync state
  const state = await getSyncState();
  return NextResponse.json(state);
}
