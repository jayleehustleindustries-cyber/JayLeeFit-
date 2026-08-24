import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';
import { fetchImagesFromDrive } from '@/lib/data/drive-fetcher';
import { mapImagesToInventory } from '@/lib/data/image-mapper';
import { recordSync } from '@/lib/data/sync-state';

export async function POST(request: NextRequest) {
  try {
    // Check if sync is already in progress
    const { getLastSync, isActiveSync } = await import('@/lib/data/sync-state');
    const active = await isActiveSync();

    if (active) {
      return NextResponse.json(
        { success: false, error: 'Sync already in progress' },
        { status: 409 }
      );
    }

    const startTime = Date.now();

    // Fetch inventory and images
    const inventory = await fetchAndParseInventory();
    const images = await fetchImagesFromDrive();

    // Map images to inventory
    const { map, stats } = await mapImagesToInventory(inventory, images);

    const duration = Date.now() - startTime;

    // Record sync
    await recordSync({
      timestamp: new Date().toISOString(),
      source: 'drive',
      status: 'success',
      recordsProcessed: stats.totalMappings,
      recordsSkipped: inventory.length - stats.totalMappings,
      errors: [],
      duration,
      details: {
        totalImages: stats.totalImages,
        totalInventoryItems: inventory.length,
        mappedItems: stats.totalMappings,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      stats: {
        totalImages: stats.totalImages,
        totalInventoryItems: inventory.length,
        mappedItems: stats.totalMappings,
        unmappedItems: inventory.length - stats.totalMappings,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // Record failed sync
    try {
      await recordSync({
        timestamp: new Date().toISOString(),
        source: 'drive',
        status: 'error',
        recordsProcessed: 0,
        recordsSkipped: 0,
        errors: [errorMsg],
        duration: 0,
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { getLastSync } = await import('@/lib/data/sync-state');
    const lastSync = await getLastSync('drive');

    return NextResponse.json({
      success: true,
      lastSync,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
