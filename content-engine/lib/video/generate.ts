import type { VideoPromptJob } from "./types";

/**
 * There is no public Higgsfield API key wired into this codebase (same
 * limitation already documented in storefront/lib/asset-pipeline/README.md).
 * Higgsfield's generate_video tool is only reachable from inside an agent
 * conversation via MCP — this module can't call it itself. What it CAN do
 * is build the exact request shape an agent should hand to that tool, so
 * "what gets generated" is defined here as data, not improvised per call.
 *
 * The actual generation step today is: an agent reads a VideoPromptJob,
 * calls buildKlingRequest() to get this object, and passes model+params to
 * the generate_video MCP tool directly (get_cost:true first, always).
 */
export function buildKlingRequest(job: VideoPromptJob) {
  return {
    model: "kling3_0",
    params: {
      prompt: job.prompt,
      aspect_ratio: job.aspectRatio,
      duration: job.durationSeconds,
    },
  };
}

/**
 * Same idea as buildKlingRequest, for Veo 3.1 — still just a request shape,
 * not a call. Which backend actually accepts this shape is unconfirmed:
 * ARCHITECTURE.md §4 documents the Vertex AI path (needs a GCP project,
 * Veo access, a service account, and a GCS bucket for reference images —
 * none of that is set up), and a claimed Vercel-hosted route to Veo hasn't
 * been verified either. Don't wire this to a real network call until one
 * of those paths is confirmed; referenceImageUri is optional because a
 * GCS bucket for it doesn't exist yet.
 */
export function buildVeoRequest(job: VideoPromptJob, referenceImageUri?: string) {
  return {
    model: "veo-3.1",
    params: {
      prompt: job.prompt,
      aspectRatio: job.aspectRatio,
      durationSeconds: job.durationSeconds,
      ...(referenceImageUri ? { referenceImageUri } : {}),
    },
  };
}
