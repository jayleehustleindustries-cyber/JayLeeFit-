import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAndParseInventory,
  getInventoryByStatus,
  getInventoryByGender,
} from '@/lib/sheets-fetcher';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');

    let inventory;

    if (status) {
      inventory = await getInventoryByStatus(status);
    } else if (gender) {
      inventory = await getInventoryByGender(gender);
    } else {
      inventory = await fetchAndParseInventory();
    }

    return NextResponse.json({
      success: true,
      total: inventory.length,
      data: inventory,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
