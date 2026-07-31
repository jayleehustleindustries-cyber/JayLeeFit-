import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '@/lib/data/sheets-fetcher';

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'json';
    const inventory = await fetchAndParseInventory();

    if (format === 'csv') {
      return NextResponse.json(
        { success: false, error: 'CSV export not yet implemented' },
        { status: 501 }
      );
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        total: inventory.length,
        data: inventory,
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
