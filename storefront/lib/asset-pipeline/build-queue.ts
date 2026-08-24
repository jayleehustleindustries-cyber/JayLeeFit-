import type { Product } from "@/lib/types";
import { SHOT_ANGLES } from "./shot-angles";
import { buildPromptJob } from "./prompt-builder";
import type { PromptJob } from "./types";

const DEFAULT_MODEL = "recraft_v4_1";

/**
 * Builds the full Stage 1 output: every product x every requested shot
 * angle, each with its finished prompt. This is pure and free — no
 * generation happens here. Feed the result to Stage 2 (actual image
 * generation) one job at a time so cost and quality can be checked before
 * scaling up.
 */
export function buildAssetQueue(
  products: Product[],
  options: { angleIds?: string[]; model?: string } = {}
): PromptJob[] {
  const angles = options.angleIds
    ? SHOT_ANGLES.filter((a) => options.angleIds!.includes(a.id))
    : SHOT_ANGLES;
  const model = options.model ?? DEFAULT_MODEL;

  const queue: PromptJob[] = [];
  for (const product of products) {
    if (!product.inStock) continue;
    for (const angle of angles) {
      queue.push(buildPromptJob(product, angle, model));
    }
  }
  return queue;
}
