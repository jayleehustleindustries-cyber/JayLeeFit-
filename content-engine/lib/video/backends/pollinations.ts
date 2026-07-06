import { saveVideo, type GenerateOptions, type GenerateResult, type VideoBackend } from "./types";

/**
 * Pollinations.ai — open generative API at gen.pollinations.ai. Free models
 * run keyless (no signup, no key, no stored data); premium models bill
 * "Pollen" credits against a key from https://enter.pollinations.ai.
 *
 * Video is one GET that responds with the mp4 bytes directly:
 *   GET https://gen.pollinations.ai/video/{urlencoded prompt}
 *       ?model=…&duration=…&aspectRatio=16:9|9:16
 * Documented video models (from pollinations/pollinations APIDOCS.md):
 * ltx-2, wan, wan-fast, wan-pro, seedance-pro, seedance-2.0, veo,
 * nova-reel, and others. Which of these run without a key is not pinned
 * down in their docs — the client sends the key only if one is set and
 * surfaces the server's auth/payment error verbatim so a failed keyless
 * attempt is cheap and self-explanatory.
 */
const BASE = "https://gen.pollinations.ai";
const DEFAULT_MODEL = "ltx-2";

function buildUrl(opts: GenerateOptions): string {
  const params = new URLSearchParams({
    model: opts.model ?? DEFAULT_MODEL,
    duration: String(opts.durationSeconds),
  });
  // The video endpoint only documents 16:9 and 9:16.
  if (opts.aspectRatio === "16:9" || opts.aspectRatio === "9:16") {
    params.set("aspectRatio", opts.aspectRatio);
  }
  return `${BASE}/video/${encodeURIComponent(opts.prompt)}?${params}`;
}

export const pollinations: VideoBackend = {
  name: "pollinations",
  freeTier: "Keyless free tier for free models; premium video models need a key + Pollen credits.",

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    const model = opts.model ?? DEFAULT_MODEL;
    const url = buildUrl(opts);
    const key = process.env.POLLINATIONS_API_KEY ?? process.env.POLLINATIONS_KEY;

    if (opts.dryRun) {
      console.log(`[pollinations dry-run] GET ${url}`);
      console.log(`[pollinations dry-run] Authorization: ${key ? "Bearer <POLLINATIONS_API_KEY>" : "(none — keyless attempt)"}`);
      return { backend: "pollinations", model, status: "dry-run" };
    }

    const res = await fetch(url, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      // Video generation is slow; give it 10 minutes before giving up.
      signal: AbortSignal.timeout(10 * 60 * 1000),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 500);
      return {
        backend: "pollinations",
        model,
        status: "failed",
        error: `HTTP ${res.status}: ${body}`,
      };
    }
    await saveVideo(res, opts.outPath);
    return { backend: "pollinations", model, status: "done", filePath: opts.outPath };
  },
};
