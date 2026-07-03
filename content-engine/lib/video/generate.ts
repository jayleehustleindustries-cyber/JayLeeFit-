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
