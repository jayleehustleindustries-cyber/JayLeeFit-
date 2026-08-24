import { applyAvatarLock } from "./avatar-identity";
import { getHookFormat } from "./hook-formats";
import type { Idea, Platform, VideoPromptJob } from "./types";

/**
 * Merges a specific content idea with a proven hook-format structure. The
 * hook format supplies the "why this works" shape (pacing, camera, on-screen
 * text pattern); the idea supplies what this particular clip is actually
 * about. Kept pure — no network calls, previewable for free via demo-queue.
 *
 * When the hook format requires a consistent on-screen persona, the locked
 * JayLeeFit identity (avatar-identity.ts) is appended here — the one place
 * every requiresConsistentCharacter format flows through, so no hook format
 * needs to (or should) hardcode identity details itself.
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

  let prompt = `Specific subject for this clip: ${idea.text}. ${hook.prompt}`;
  if (hook.requiresConsistentCharacter) {
    prompt = applyAvatarLock(prompt);
  }

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
