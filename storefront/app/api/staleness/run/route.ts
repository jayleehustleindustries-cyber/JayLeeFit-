import { NextRequest, NextResponse } from 'next/server';
import { runStalenessPass } from '@/lib/staleness/runner';

/**
 * The watcher's entry point.
 *
 * GET  — Vercel Cron hits this on a schedule. With a valid CRON_SECRET bearer
 *        token it executes the ladder; without one it returns a read-only
 *        preview, so the URL is safe to open in a browser.
 * POST — manual execution, same auth rule.
 *
 * Both accept ?dry=true to force preview mode regardless of credentials.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret configured means local/dev: allow execution rather than making
  // the endpoint impossible to exercise.
  if (!secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function handle(request: NextRequest, method: 'GET' | 'POST') {
  const forcedDry = request.nextUrl.searchParams.get('dry') === 'true';
  const authorized = isAuthorized(request);

  // An unauthorized POST is an attempt to execute and should fail loudly. An
  // unauthorized GET is someone opening the URL, and gets the preview.
  if (!authorized && method === 'POST') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized — send Authorization: Bearer $CRON_SECRET' },
      { status: 401 }
    );
  }

  const dryRun = forcedDry || !authorized;

  try {
    const report = await runStalenessPass({ dryRun });

    return NextResponse.json({
      success: true,
      dryRun: report.dryRun,
      startedAt: report.startedAt,
      durationMs: report.durationMs,
      summary: {
        scanned: report.plan.counts.scanned,
        edits: report.plan.counts.edits,
        skipped: report.plan.counts.skipped,
        humanReview: report.plan.counts.humanReview,
        byTier: report.plan.counts.byTier,
        ...report.counts,
      },
      edits: report.plan.edits.map(edit => ({
        sku: edit.sku,
        tier: edit.tier,
        tierLabel: edit.tierLabel,
        days: edit.daysInInventory,
        from: edit.price.originalPrice,
        to: edit.price.targetPrice,
        floored: edit.price.floored,
        title: edit.titles.ebay,
        bump: edit.bump,
      })),
      humanReview: report.plan.humanReview.map(edit => ({
        sku: edit.sku,
        days: edit.daysInInventory,
        price: edit.price.originalPrice,
      })),
      results: report.results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handle(request, 'POST');
}
