import { phaseForScore } from "@/lib/products";
import type { Product } from "@/lib/types";
import type { PromptJob, ShotAngle } from "./types";

const BRAND_LOOK =
  "Old Light brand look: near-black void background (#0A0A14) with a single warm gold rim light (#C9A24E), " +
  "faint starfield or soft bokeh points in the deep background, quiet luxury editorial mood, no visible logos or text";

/** Condition maps to a styling note, not just a grading label — a mint piece and a worn one shouldn't be lit or posed identically. */
function conditionMoodFor(score: number): string {
  const { phase } = phaseForScore(score);
  switch (phase) {
    case "full":
      return "pristine, crisp fabric with no visible wear, styled precisely and symmetrically";
    case "gibbous":
      return "excellent condition, faint natural fabric texture, styled clean and confident";
    case "half":
      return "honest visible wear, natural creases and softened fabric, styled relaxed rather than pristine";
    case "crescent":
      return "well-loved vintage character, visible patina and texture, styled to look lived-in and storied, not damaged";
  }
}

export function buildPrompt(product: Product, angle: ShotAngle): string {
  const subject = [product.brand, product.name].filter(Boolean).join(" — ");

  return [
    `Product photograph of a pre-owned ${product.category.toLowerCase()}'s ${product.type || "garment"}: ${subject}.`,
    angle.framing + ".",
    conditionMoodFor(product.conditionScore) + ".",
    BRAND_LOOK + ".",
    angle.camera + ".",
  ].join(" ");
}

export function buildPromptJob(product: Product, angle: ShotAngle, model: string): PromptJob {
  return {
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    angleId: angle.id,
    angleLabel: angle.label,
    prompt: buildPrompt(product, angle),
    model,
    aspectRatio: angle.aspectRatio,
  };
}
