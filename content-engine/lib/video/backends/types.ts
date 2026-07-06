import type { AspectRatio } from "../types";

/**
 * The three wired backends, cheapest-first. Unlike generate.ts (request
 * shapes for MCP tools only an agent conversation can reach), these are
 * real HTTP clients this codebase can run itself, given the right env var:
 *
 * - "pollinations" — https://gen.pollinations.ai — keyless/free tier for
 *   free models; premium video models bill "Pollen" credits against an
 *   optional key. The only backend that can run with zero signup.
 * - "magichour" — https://docs.magichour.ai — REST API; new accounts get
 *   400 free credits plus 100/day claimable in the web app, so this is the
 *   "actually free, sustainably" API path. Needs MAGIC_HOUR_API_KEY.
 * - "luma" — Dream Machine API (Ray models). No free API tier — it bills
 *   per generation — included because it was explicitly requested as a
 *   bind target. Needs LUMAAI_API_KEY.
 */
export type BackendName = "pollinations" | "magichour" | "luma";

export type GenerateOptions = {
  prompt: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  /** Backend-specific model override (e.g. "ltx-2", "ray-flash-2"). */
  model?: string;
  /** Where to write the resulting mp4. */
  outPath: string;
  /** Print the exact HTTP call that would be made, then stop. No network. */
  dryRun?: boolean;
};

export type GenerateResult = {
  backend: BackendName;
  model: string;
  status: "done" | "dry-run" | "failed";
  jobId?: string;
  videoUrl?: string;
  filePath?: string;
  costCredits?: number;
  error?: string;
};

export type VideoBackend = {
  name: BackendName;
  /** Human-readable note on what "free" means for this backend. */
  freeTier: string;
  generate(opts: GenerateOptions): Promise<GenerateResult>;
};

/** Shared helper: fetch a video URL/response body to disk. */
export async function saveVideo(res: Response, outPath: string): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname } = await import("node:path");
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) throw new Error("Backend returned an empty video body");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, bytes);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
