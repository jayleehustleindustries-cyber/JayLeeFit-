import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';
import { inventoryToCSV, addImagesToCSV } from '@/lib/data/csv-formatter';
import { loadImageMappings } from '@/lib/data/image-mapper';
import { stalePriceMap } from '@/lib/staleness/engine';

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'json';
    const includeImages = request.nextUrl.searchParams.get('include-images') === 'true';
    const filename = request.nextUrl.searchParams.get('filename') || 'inventory.csv';
    // Ladder pricing is on by default: this feed is what Vendoo pulls, so it is
    // the channel that actually delivers markdowns to eBay/Poshmark/Mercari.
    // ?stale=false serves raw sheet prices instead.
    const applyStale = request.nextUrl.searchParams.get('stale') !== 'false';

    const inventory = await fetchAndParseInventory();
    const staleMap = applyStale ? stalePriceMap(inventory) : undefined;

    if (format === 'csv') {
      // Generate CSV
      let csvContent = inventoryToCSV(inventory, includeImages, staleMap);

      // Add images if requested
      if (includeImages) {
        const imageMap = await loadImageMappings();
        csvContent = addImagesToCSV(csvContent, imageMap);
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'json') {
      const imageMap = includeImages ? await loadImageMappings() : null;

      const data = inventory.map(item => {
        const stale = staleMap?.get(item.sku);

        return {
          ...item,
          ...(imageMap && { images: imageMap.get(item.sku) || [] }),
          ...(staleMap && {
            originalPrice: item.price,
            price: stale ? stale.price : item.price,
            staleTier: stale ? stale.tier : 'fresh',
            staleTierLabel: stale ? stale.tierLabel : 'Fresh',
          }),
        };
      });

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        total: inventory.length,
        includeImages,
        stalePricing: applyStale,
        data,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported format. Use ?format=json or ?format=csv' },
      { status: 400 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
