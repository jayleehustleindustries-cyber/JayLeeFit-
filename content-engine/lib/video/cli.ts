/**
 * Generate a real video from the command line (or from an agent's Bash
 * tool — this is the piece that lets a Claude session drive generation
 * directly instead of only handing prompts to MCP tools).
 *
 *   npm run generate:video -- --prompt "..." [--backend pollinations|magichour|luma]
 *   npm run generate:video -- --format consistent-character-montage --idea "..."
 *
 * Flags: --backend (default pollinations — the keyless/free one), --model,
 * --duration <sec>, --aspect 9:16|16:9|1:1, --out <path.mp4>, --dry-run.
 * --dry-run prints the exact HTTP call and stops — same "preview before
 * spending" rule this repo already applies to Higgsfield credits.
 *
 * Every real run appends one JSON line to out/video-ledger.jsonl — the
 * auditable ledger row VideoAssetJob was designed for, until the Airtable
 * Assets table exists.
 */
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DEFAULT_BACKEND, getBackend } from "./backends/index";
import { HOOK_FORMATS } from "./hook-formats";
import { buildVideoPrompt } from "./prompt-builder";
import type { AspectRatio, Pillar } from "./types";

function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args.set(key, next);
      i++;
    } else {
      args.set(key, "true");
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.has("help") || args.size === 0) {
  console.log(`Usage:
  npm run generate:video -- --prompt "a sunrise gym montage" [options]
  npm run generate:video -- --format <hook-format-id> --idea "..." [options]

Options:
  --backend    pollinations (default, free/keyless) | magichour (free credits) | luma (paid)
  --model      backend-specific model override
  --duration   seconds (default 8, or the hook format's duration)
  --aspect     9:16 | 16:9 | 1:1 (default 9:16, or the hook format's ratio)
  --out        output mp4 path (default out/<timestamp>.mp4)
  --dry-run    print the exact HTTP request, make no network call

Hook formats: ${HOOK_FORMATS.map((f) => f.id).join(", ")}`);
  process.exit(0);
}

let prompt = args.get("prompt");
let aspectRatio = (args.get("aspect") as AspectRatio | undefined) ?? "9:16";
let durationSeconds = args.has("duration") ? Number(args.get("duration")) : 8;

const formatId = args.get("format");
if (formatId) {
  const idea = args.get("idea");
  if (!idea) {
    console.error("--format requires --idea \"what this clip is about\"");
    process.exit(1);
  }
  const job = buildVideoPrompt(
    { id: `cli-${Date.now()}`, text: idea, pillar: (args.get("pillar") as Pillar) ?? "Personal Brand/Hustle" },
    formatId
  );
  prompt = job.prompt;
  if (!args.has("aspect")) aspectRatio = job.aspectRatio;
  if (!args.has("duration")) durationSeconds = job.durationSeconds;
}

if (!prompt) {
  console.error("Provide --prompt, or --format plus --idea. Run with --help for usage.");
  process.exit(1);
}
if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
  console.error(`--duration must be a positive number of seconds, got: ${args.get("duration")}`);
  process.exit(1);
}

const backend = getBackend(args.get("backend") ?? DEFAULT_BACKEND);
const outPath = args.get("out") ?? join("out", `video-${Date.now()}.mp4`);
const dryRun = args.has("dry-run");

console.log(`backend: ${backend.name} — ${backend.freeTier}`);

const result = await backend
  .generate({
    prompt,
    durationSeconds,
    aspectRatio,
    model: args.get("model"),
    outPath,
    dryRun,
  })
  .catch((err: unknown) => ({
    backend: backend.name,
    model: args.get("model") ?? "default",
    status: "failed" as const,
    error: err instanceof Error ? err.message : String(err),
  }));

console.log(JSON.stringify(result, null, 2));

if (result.status !== "dry-run") {
  const ledgerPath = join("out", "video-ledger.jsonl");
  await mkdir(dirname(ledgerPath), { recursive: true });
  await appendFile(
    ledgerPath,
    JSON.stringify({ ...result, prompt, aspectRatio, durationSeconds, generatedAt: new Date().toISOString() }) + "\n"
  );
  console.log(`ledger: ${ledgerPath}`);
}

process.exit(result.status === "failed" ? 1 : 0);
