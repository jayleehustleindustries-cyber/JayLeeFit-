import { saveVideo, sleep, type GenerateOptions, type GenerateResult, type VideoBackend } from "./types";

/**
 * Luma Dream Machine API — wired on explicit request ("or bind to luma").
 * Honesty note: Luma's API has no free tier — every generation bills the
 * account — so this is the fallback for when quality matters more than
 * cost, not the default. Key from https://lumalabs.ai/api, set as
 * LUMAAI_API_KEY (same env var their official SDKs use).
 *
 * Flow: POST /dream-machine/v1/generations/video returns { id, state };
 * poll GET /dream-machine/v1/generations/{id} until state is "completed"
 * (assets.video holds the mp4 URL) or "failed" (failure_reason).
 */
const BASE = "https://api.lumalabs.ai/dream-machine/v1";
const DEFAULT_MODEL = "ray-flash-2"; // cheapest Ray model — override with --model for ray-2 etc.
const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

type Generation = {
  id: string;
  state: "queued" | "dreaming" | "completed" | "failed";
  failure_reason?: string | null;
  assets?: { video?: string | null } | null;
};

/** Luma takes duration as a string like "5s"; snap to the nearest supported tier. */
function toLumaDuration(seconds: number): string {
  return seconds <= 7 ? "5s" : "9s";
}

export const luma: VideoBackend = {
  name: "luma",
  freeTier: "None for the API — bills per generation. Included by explicit request.",

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    const model = opts.model ?? DEFAULT_MODEL;
    const body = {
      prompt: opts.prompt,
      model,
      aspect_ratio: opts.aspectRatio,
      duration: toLumaDuration(opts.durationSeconds),
      resolution: "720p",
    };

    if (opts.dryRun) {
      console.log(`[luma dry-run] POST ${BASE}/generations/video`);
      console.log(`[luma dry-run] Authorization: Bearer <LUMAAI_API_KEY>`);
      console.log(`[luma dry-run] body: ${JSON.stringify(body, null, 2)}`);
      console.log(`[luma dry-run] then poll GET ${BASE}/generations/{id} until completed`);
      console.log(`[luma dry-run] REMINDER: Luma has no free API tier — this call costs real money.`);
      return { backend: "luma", model, status: "dry-run" };
    }

    const key = process.env.LUMAAI_API_KEY;
    if (!key) {
      return { backend: "luma", model, status: "failed", error: "LUMAAI_API_KEY is not set (keys: lumalabs.ai/api — note: paid, no free tier)" };
    }
    const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

    const createRes = await fetch(`${BASE}/generations/video`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      return { backend: "luma", model, status: "failed", error: `create HTTP ${createRes.status}: ${(await createRes.text()).slice(0, 500)}` };
    }
    const created = (await createRes.json()) as Generation;

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(`${BASE}/generations/${created.id}`, { headers });
      if (!pollRes.ok) {
        return { backend: "luma", model, status: "failed", jobId: created.id, error: `poll HTTP ${pollRes.status}: ${(await pollRes.text()).slice(0, 500)}` };
      }
      const gen = (await pollRes.json()) as Generation;
      if (gen.state === "completed") {
        const url = gen.assets?.video;
        if (!url) {
          return { backend: "luma", model, status: "failed", jobId: created.id, error: "completed but no assets.video URL" };
        }
        const dl = await fetch(url);
        if (!dl.ok) {
          return { backend: "luma", model, status: "failed", jobId: created.id, videoUrl: url, error: `download HTTP ${dl.status}` };
        }
        await saveVideo(dl, opts.outPath);
        return { backend: "luma", model, status: "done", jobId: created.id, videoUrl: url, filePath: opts.outPath };
      }
      if (gen.state === "failed") {
        return { backend: "luma", model, status: "failed", jobId: created.id, error: gen.failure_reason ?? "failed (no reason given)" };
      }
    }
    return { backend: "luma", model, status: "failed", jobId: created.id, error: `timed out after ${POLL_TIMEOUT_MS / 60000} minutes (generation may still finish)` };
  },
};
