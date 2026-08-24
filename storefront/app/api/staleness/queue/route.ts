import { NextRequest, NextResponse } from 'next/server';
import { loadQueue, setQueueItemStatus } from '@/lib/staleness/adapters/queue';

/**
 * The Poshmark / Mercari work queue — the edits the ladder decided but cannot
 * execute itself, since neither marketplace exposes a write API.
 *
 * GET   ?status=open filters; omit for everything.
 * PATCH { id, status } closes an item once it has been applied, which stops
 *       later runs from re-queueing the same work.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    const marketplace = request.nextUrl.searchParams.get('marketplace');

    let items = await loadQueue();
    if (status) items = items.filter(item => item.status === status);
    if (marketplace) items = items.filter(item => item.marketplace === marketplace);

    // Most stale first — that is the order someone working the queue wants.
    items.sort((a, b) => b.daysInInventory - a.daysInInventory);

    return NextResponse.json({
      success: true,
      total: items.length,
      open: items.filter(item => item.status === 'open').length,
      items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status || !['open', 'done', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Body must be { id, status: "open" | "done" | "dismissed" }' },
        { status: 400 }
      );
    }

    const updated = await setQueueItemStatus(id, status as 'open' | 'done' | 'dismissed');
    if (!updated) {
      return NextResponse.json({ success: false, error: `No queue item ${id}` }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
