/**
 * Produce the EHC reselling video's clips — the executable half of
 * reselling-storyboard.ts. Runs every storyboard clip through Magic Hour
 * image-to-video (each brand frame as the start image), sequentially,
 * saving to out/reselling/ and appending a ledger row per clip.
 *
 *   npm run produce:reselling -- --dry-run          # full plan, no network
 *   npm run produce:reselling                       # all four clips
 *   npm run produce:reselling -- --clip dashboard   # just one
 *   npm run produce:reselling -- --model <model>    # override MH default
 *
 * Needs MAGIC_HOUR_API_KEY (free: magichour.ai Developer dashboard; 400
 * credits on signup + 100/day claimable in the web app). After the clips
 * exist, assembly happens in Descript — see lib/video/README.md.
 */
import { appendFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { magichour } from "./backends/magichour";
import type { GenerateResult } from "./backends/types";
import { RESELLING_STORYBOARD } from "./reselling-storyboard";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const clipFilter = args.includes("--clip") ? args[args.indexOf("--clip") + 1] : undefined;
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : undefined;

// Frame paths in the storyboard are relative to the content-engine root,
// not the caller's cwd — resolve against this file's location.
const engineRoot = resolve(fileURLToPath(import.meta.url), "../../..");
const outDir = join(engineRoot, "out", "reselling");

const clips = clipFilter
  ? RESELLING_STORYBOARD.filter((c) => c.id === clipFilter)
  : RESELLING_STORYBOARD;
if (clips.length === 0) {
  console.error(`No clip with id "${clipFilter}". Options: ${RESELLING_STORYBOARD.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

if (!dryRun && !process.env.MAGIC_HOUR_API_KEY) {
  console.error("MAGIC_HOUR_API_KEY is not set. Free key: magichour.ai → Developer dashboard. Or preview with --dry-run.");
  process.exit(1);
}

console.log(`EHC reselling video — producing ${clips.length} clip(s) via Magic Hour image-to-video${dryRun ? " (DRY RUN)" : ""}\n`);

const results: GenerateResult[] = [];
for (const clip of clips) {
  console.log(`── Clip ${clip.order}/${RESELLING_STORYBOARD.length}: ${clip.id} (${clip.durationSeconds}s)`);
  const result = await magichour
    .generate({
      prompt: clip.motionPrompt,
      durationSeconds: clip.durationSeconds,
      aspectRatio: clip.aspectRatio,
      model,
      startImagePath: join(engineRoot, clip.frame),
      outPath: join(outDir, `clip-${clip.order}-${clip.id}.mp4`),
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
  results.push(result);
  console.log(`   → ${result.status}${result.error ? `: ${result.error}` : ""}${result.filePath ? ` → ${result.filePath}` : ""}${result.costCredits != null ? ` (${result.costCredits} credits)` : ""}\n`);

  if (!dryRun) {
    await mkdir(outDir, { recursive: true });
    await appendFile(
      join(outDir, "ledger.jsonl"),
      JSON.stringify({ clipId: clip.id, ...result, prompt: clip.motionPrompt, generatedAt: new Date().toISOString() }) + "\n"
    );
  }
  // A failure mid-run is worth stopping for — credits are finite and the
  // remaining clips will likely fail the same way.
  if (result.status === "failed") break;
}

const done = results.filter((r) => r.status !== "failed").length;
console.log(`${done}/${clips.length} clip(s) ${dryRun ? "previewed" : "produced"}.`);
if (!dryRun && done === clips.length) {
  console.log(`Next: import ${outDir}/*.mp4 into Descript in storyboard order for the edit.`);
}
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
