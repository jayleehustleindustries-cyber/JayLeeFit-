import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseInventory } from '../../../../lib/data/sheets-fetcher';
import { buildHealthReport } from '../../../../lib/ops/health';
import { getAllSystemPrompts } from '../../../../lib/ops/system-prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const inventory = await fetchAndParseInventory();
    const report = await buildHealthReport(inventory);
    const prompts = getAllSystemPrompts(report);

    const { searchParams } = request.nextUrl;
    const promptId = searchParams.get('id');

    if (promptId) {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) {
        return NextResponse.json({ error: `Unknown prompt: ${promptId}` }, { status: 404 });
      }
      return NextResponse.json(prompt);
    }

    return NextResponse.json({
      generatedAt: report.generatedAt,
      overallGrade: report.overallGrade,
      prompts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate system prompts',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
