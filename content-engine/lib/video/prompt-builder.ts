import { getHookFormat } from "./hook-formats";
import type { Idea, Platform, VideoPromptJob } from "./types";

/**
 * Merges a specific content idea with a proven hook-format structure. The
 * hook format supplies the "why this works" shape (pacing, camera, on-screen
 * text pattern); the idea supplies what this particular clip is actually
 * about. Kept pure — no network calls, previewable for free via demo-queue.
 */
export function buildVideoPrompt(
  idea: Idea,
  hookFormatId: string,
  platforms: Platform[] = ["Instagram", "TikTok"]
): VideoPromptJob {
  const hook = getHookFormat(hookFormatId);
  if (!hook) {
    throw new Error(`Unknown hook format: ${hookFormatId}`);
  }

  const prompt = `Specific subject for this clip: ${idea.text}. ${hook.prompt}`;

  return {
    ideaId: idea.id,
    idea: idea.text,
    pillar: idea.pillar,
    hookFormatId: hook.id,
    hookLabel: hook.label,
    prompt,
    aspectRatio: hook.aspectRatio,
    durationSeconds: hook.durationSeconds,
    platforms,
  };
}
