import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '../../../../lib/data/sheets-fetcher';
import { buildHealthReport } from '../../../../lib/ops/health';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const inventory = await fetchAndParseInventory();
    const report = await buildHealthReport(inventory);

    const { searchParams } = request.nextUrl;
    const compact = searchParams.get('compact') === 'true';

    if (compact) {
      return NextResponse.json({
        generatedAt: report.generatedAt,
        overallGrade: report.overallGrade,
        metrics: report.metrics,
        pipelines: report.pipelines,
        alerts: report.alerts,
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Health check failed',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
