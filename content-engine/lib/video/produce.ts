/**
 * Produce any storyboard's clips: existing footage is copied through
 * (zero credits), frames run image-to-video, frameless clips run
 * text-to-video — all generation via Magic Hour (free-credits backend).
 *
 *   npm run produce:reselling                     # board: reselling
 *   npm run produce:fitness                       # board: fitness-sunday
 *   npm run produce -- <board> [--dry-run] [--clip <id>] [--model <m>]
 *
 * Output: out/<board>/clip-N-<id>.mp4 + out/<board>/ledger.jsonl.
 * Needs MAGIC_HOUR_API_KEY only if a clip actually needs generating.
 * After the clips exist, assembly (VO, captions, music) happens in
 * Descript — voiceover/onScreenText per clip are in the storyboard.
 */
import { appendFile, copyFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { magichour } from "./backends/magichour";
import type { GenerateResult } from "./backends/types";
import { FITNESS_SUNDAY_STORYBOARD } from "./fitness-sunday-storyboard";
import { RESELLING_STORYBOARD } from "./reselling-storyboard";
import type { StoryboardClip } from "./types";

const BOARDS: Record<string, StoryboardClip[]> = {
  reselling: RESELLING_STORYBOARD,
  "fitness-sunday": FITNESS_SUNDAY_STORYBOARD,
};

const args = process.argv.slice(2);
const boardName = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const clipFilter = args.includes("--clip") ? args[args.indexOf("--clip") + 1] : undefined;
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : undefined;

const board = boardName ? BOARDS[boardName] : undefined;
if (!board) {
  console.error(`Usage: produce.ts <board> [--dry-run] [--clip <id>] [--model <m>]\nBoards: ${Object.keys(BOARDS).join(", ")}`);
  process.exit(1);
}

const engineRoot = resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = join(engineRoot, "out", boardName!);

const clips = clipFilter ? board.filter((c) => c.id === clipFilter) : board;
if (clips.length === 0) {
  console.error(`No clip with id "${clipFilter}". Options: ${board.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const needsGeneration = clips.some((c) => !c.existingVideo);
if (!dryRun && needsGeneration && !process.env.MAGIC_HOUR_API_KEY) {
  console.error("MAGIC_HOUR_API_KEY is not set and this board has clips to generate. Free key: magichour.ai → Developer dashboard. Or preview with --dry-run.");
  process.exit(1);
}

console.log(`${boardName}: producing ${clips.length} clip(s)${dryRun ? " (DRY RUN)" : ""}\n`);

const results: GenerateResult[] = [];
for (const clip of clips) {
  const outPath = join(outDir, `clip-${clip.order}-${clip.id}.mp4`);
  console.log(`── Clip ${clip.order}/${board.length}: ${clip.id} (${clip.durationSeconds}s)`);
  if (clip.voiceover) console.log(`   VO: ${clip.voiceover}`);
  if (clip.onScreenText) console.log(`   text: ${clip.onScreenText}`);

  let result: GenerateResult;
  if (clip.existingVideo) {
    if (dryRun) {
      console.log(`   [dry-run] copy ${clip.existingVideo} → ${outPath} (already produced, 0 credits)`);
      result = { backend: "magichour", model: "existing-footage", status: "dry-run" };
    } else {
      await mkdir(outDir, { recursive: true });
      await copyFile(join(engineRoot, clip.existingVideo), outPath);
      result = { backend: "magichour", model: "existing-footage", status: "done", filePath: outPath, costCredits: 0 };
    }
  } else {
    result = await magichour
      .generate({
        prompt: clip.motionPrompt,
        durationSeconds: clip.durationSeconds,
        aspectRatio: clip.aspectRatio,
        model,
        startImagePath: clip.frame ? join(engineRoot, clip.frame) : undefined,
        outPath,
        dryRun,
      })
      .catch(
        (err: unknown): GenerateResult => ({
          backend: "magichour",
          model: model ?? "default",
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        })
      );
  }
  results.push(result);
  console.log(`   → ${result.status}${result.error ? `: ${result.error}` : ""}${result.filePath ? ` → ${result.filePath}` : ""}${result.costCredits != null ? ` (${result.costCredits} credits)` : ""}\n`);

  if (!dryRun) {
    await mkdir(outDir, { recursive: true });
    await appendFile(
      join(outDir, "ledger.jsonl"),
      JSON.stringify({ board: boardName, clipId: clip.id, ...result, prompt: clip.motionPrompt, generatedAt: new Date().toISOString() }) + "\n"
    );
  }
  // Stop at the first failure — credits are finite and the remaining
  // clips will likely fail the same way.
  if (result.status === "failed") break;
}

const done = results.filter((r) => r.status !== "failed").length;
console.log(`${done}/${clips.length} clip(s) ${dryRun ? "previewed" : "produced"}.`);
if (!dryRun && done === clips.length) {
  console.log(`Next: import ${outDir}/*.mp4 into Descript in order; lay in the VO + on-screen text per clip from the storyboard.`);
}
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
