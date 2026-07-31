import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';
import { inventoryToCSV, addImagesToCSV } from '@/lib/data/csv-formatter';
import { loadImageMappings } from '@/lib/data/image-mapper';

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'json';
    const includeImages = request.nextUrl.searchParams.get('include-images') === 'true';
    const filename = request.nextUrl.searchParams.get('filename') || 'inventory.csv';

    const inventory = await fetchAndParseInventory();

    if (format === 'csv') {
      // Generate CSV
      let csvContent = inventoryToCSV(inventory, includeImages);

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
      let data = inventory;

      // Add images if requested
      if (includeImages) {
        const imageMap = await loadImageMappings();
        data = inventory.map(item => ({
          ...item,
          images: imageMap.get(item.sku) || [],
        }));
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        total: inventory.length,
        includeImages,
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
