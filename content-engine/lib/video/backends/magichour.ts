import { saveVideo, sleep, type GenerateOptions, type GenerateResult, type VideoBackend } from "./types";

/**
 * Magic Hour — https://docs.magichour.ai. The "actually free" API path:
 * new accounts get 400 free credits and can claim 100 more per day in the
 * web app, and credits are only charged for frames that actually render.
 * Get a key from the Developer dashboard and set MAGIC_HOUR_API_KEY.
 *
 * Two modes:
 * - text-to-video: POST /v1/text-to-video with style.prompt
 * - image-to-video (opts.startImagePath): first POST /v1/files/upload-urls
 *   → PUT the frame bytes to the presigned URL → POST /v1/image-to-video
 *   with assets.image_file_path. The video inherits the frame's aspect
 *   ratio, which is exactly what the reselling storyboard wants.
 *
 * Either way the job lands in GET /v1/video-projects/{id}; poll until
 * status is "complete" (downloads[].url) or "error".
 */
const BASE = "https://api.magichour.ai";
const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

type CreateResponse = { id: string; estimated_frame_cost?: number; credits_charged?: number };
type UploadUrlsResponse = { items: { upload_url: string; file_path: string; expires_at?: string }[] };
type ProjectResponse = {
  status: "draft" | "queued" | "rendering" | "complete" | "error" | "canceled";
  credits_charged?: number;
  downloads?: { url: string }[];
  error?: { code?: string; message?: string } | null;
};

/** Upload a local image via the presigned-URL flow; returns the api-assets file_path. */
async function uploadImage(localPath: string, headers: Record<string, string>): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const { extname } = await import("node:path");
  const extension = extname(localPath).slice(1).toLowerCase() || "png";

  const urlRes = await fetch(`${BASE}/v1/files/upload-urls`, {
    method: "POST",
    headers,
    body: JSON.stringify({ items: [{ type: "image", extension }] }),
  });
  if (!urlRes.ok) throw new Error(`upload-urls HTTP ${urlRes.status}: ${(await urlRes.text()).slice(0, 300)}`);
  const { items } = (await urlRes.json()) as UploadUrlsResponse;
  const item = items?.[0];
  if (!item?.upload_url || !item.file_path) throw new Error("upload-urls response missing upload_url/file_path");

  const bytes = await readFile(localPath);
  const putRes = await fetch(item.upload_url, { method: "PUT", body: bytes });
  if (!putRes.ok) throw new Error(`frame upload PUT HTTP ${putRes.status}`);
  return item.file_path;
}

export const magichour: VideoBackend = {
  name: "magichour",
  freeTier: "400 free credits on signup + 100/day claimable in the web app; charged only for rendered frames.",

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    const model = opts.model ?? "default";
    const name = `content-engine ${new Date().toISOString()}`;
    const imageToVideo = Boolean(opts.startImagePath);
    const createPath = imageToVideo ? "/v1/image-to-video" : "/v1/text-to-video";

    if (opts.dryRun) {
      if (imageToVideo) {
        console.log(`[magichour dry-run] POST ${BASE}/v1/files/upload-urls  {items:[{type:"image",extension:"png"}]}`);
        console.log(`[magichour dry-run] PUT <presigned upload_url>  (bytes of ${opts.startImagePath})`);
      }
      const previewBody = imageToVideo
        ? { name, end_seconds: opts.durationSeconds, assets: { image_file_path: "<file_path from upload>" }, style: { prompt: opts.prompt }, ...(opts.model ? { model: opts.model } : {}) }
        : { name, end_seconds: opts.durationSeconds, aspect_ratio: opts.aspectRatio, style: { prompt: opts.prompt }, ...(opts.model ? { model: opts.model } : {}) };
      console.log(`[magichour dry-run] POST ${BASE}${createPath}`);
      console.log(`[magichour dry-run] Authorization: Bearer <MAGIC_HOUR_API_KEY>`);
      console.log(`[magichour dry-run] body: ${JSON.stringify(previewBody, null, 2)}`);
      console.log(`[magichour dry-run] then poll GET ${BASE}/v1/video-projects/{id} until complete`);
      return { backend: "magichour", model, status: "dry-run" };
    }

    const key = process.env.MAGIC_HOUR_API_KEY;
    if (!key) {
      return { backend: "magichour", model, status: "failed", error: "MAGIC_HOUR_API_KEY is not set (free key: magichour.ai developer dashboard)" };
    }
    const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

    let body: Record<string, unknown>;
    if (imageToVideo) {
      const filePath = await uploadImage(opts.startImagePath!, headers);
      body = {
        name,
        end_seconds: opts.durationSeconds,
        assets: { image_file_path: filePath },
        style: { prompt: opts.prompt },
        ...(opts.model ? { model: opts.model } : {}),
      };
    } else {
      body = {
        name,
        end_seconds: opts.durationSeconds,
        aspect_ratio: opts.aspectRatio,
        style: { prompt: opts.prompt },
        ...(opts.model ? { model: opts.model } : {}),
      };
    }

    const createRes = await fetch(`${BASE}${createPath}`, { method: "POST", headers, body: JSON.stringify(body) });
    if (!createRes.ok) {
      return { backend: "magichour", model, status: "failed", error: `create HTTP ${createRes.status}: ${(await createRes.text()).slice(0, 500)}` };
    }
    const created = (await createRes.json()) as CreateResponse;

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(`${BASE}/v1/video-projects/${created.id}`, { headers });
      if (!pollRes.ok) {
        return { backend: "magichour", model, status: "failed", jobId: created.id, error: `poll HTTP ${pollRes.status}: ${(await pollRes.text()).slice(0, 500)}` };
      }
      const project = (await pollRes.json()) as ProjectResponse;
      if (project.status === "complete") {
        const url = project.downloads?.[0]?.url;
        if (!url) {
          return { backend: "magichour", model, status: "failed", jobId: created.id, error: "complete but no download URL in response" };
        }
        const dl = await fetch(url);
        if (!dl.ok) {
          return { backend: "magichour", model, status: "failed", jobId: created.id, videoUrl: url, error: `download HTTP ${dl.status}` };
        }
        await saveVideo(dl, opts.outPath);
        return {
          backend: "magichour",
          model,
          status: "done",
          jobId: created.id,
          videoUrl: url,
          filePath: opts.outPath,
          costCredits: project.credits_charged ?? created.estimated_frame_cost,
        };
      }
      if (project.status === "error" || project.status === "canceled") {
        return { backend: "magichour", model, status: "failed", jobId: created.id, error: project.error?.message ?? project.status };
      }
    }
    return { backend: "magichour", model, status: "failed", jobId: created.id, error: `timed out after ${POLL_TIMEOUT_MS / 60000} minutes (job may still finish — check the web app)` };
  },
};
