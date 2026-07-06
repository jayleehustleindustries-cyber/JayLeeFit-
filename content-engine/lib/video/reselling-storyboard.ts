/**
 * The EHC reselling marketing video, clip by clip.
 *
 * The four PNGs in ../../assets/reselling-story/ are user-provided story
 * frames — a competitor's reselling-video structure re-cloned with this
 * brand's visuals (same persona as the consistent-character reference:
 * backwards cream cap, chain, black tee; dark industrial HQ with red neon).
 * They are 768x1344 (9:16) and double as START FRAMES: each clip should be
 * generated image-to-video from its frame so the exact brand visuals stay
 * on screen, rather than re-rolling text-to-video per scene.
 *
 * Production plan ("generated in clips and edited after"):
 *   1. Generate each clip below via image-to-video (Higgsfield kling with
 *      start_image, or Magic Hour image-to-video once a key exists).
 *   2. Assemble in order in Descript (MCP connector): trims, pacing cuts,
 *      captions, music.
 *
 * Run `npm run demo:storyboard` to print the full plan, including the
 * ready-to-hand Higgsfield request shape per clip — zero network, zero cost.
 */
import type { StoryboardClip } from "./types";

export type { StoryboardClip } from "./types";

export const RESELLING_STORYBOARD: StoryboardClip[] = [
  {
    order: 1,
    id: "dashboard",
    frame: "assets/reselling-story/frame-03-dashboard.png",
    beat: "The differentiator: AI-backed sourcing. Open on the operator reading a live resale-comps dashboard.",
    motionPrompt:
      "Slow push-in over the operator's shoulder toward the laptop. Charts on the dashboard animate subtly — a price line ticks upward, listing cards refresh. His fingers move on the trackpad, head tilts slightly as he studies the screen. Red neon glow flickers faintly on the desk edge. No camera shake.",
    durationSeconds: 5,
    aspectRatio: "9:16",
  },
  {
    order: 2,
    id: "pack-station",
    frame: "assets/reselling-story/frame-11-pack-station.png",
    beat: "Scale: the pack table loaded with folded inventory and poly mailers — this is an operation, not a side table.",
    motionPrompt:
      "Gentle lateral dolly right across the pack table. The operator folds the top garment from the stack and slides it toward a silver poly mailer. The thermal printer feeds a label a few centimeters. Warm pendant light steady, red rim light constant. Calm, deliberate hand movements.",
    durationSeconds: 5,
    aspectRatio: "9:16",
  },
  {
    order: 3,
    id: "label-mailer",
    frame: "assets/reselling-story/frame-07-label-mailer.png",
    beat: "Craft: sealing and labeling a single order — the close-to-the-product beat.",
    motionPrompt:
      "Slight push-in as the operator presses the shipping label smoothly onto the poly mailer with both thumbs, then gives the sealed package one confident pat and sets it down with the finished stack. Focus stays on the hands and package; background holds still.",
    durationSeconds: 5,
    aspectRatio: "9:16",
  },
  {
    order: 4,
    id: "shipping-labels",
    frame: "assets/reselling-story/frame-12-shipping-labels.png",
    beat: "The money shot: a thick stack of FedEx/UPS labels = volume moving out the door. End card / CTA space.",
    motionPrompt:
      "Close-up: thumbs riffle slowly through the stack of printed FedEx/UPS shipping labels, one flipping past every beat. Shallow depth of field, wristwatch catching a glint of the red neon. Ends on a still hold of the full stack — leave the final second static for an overlay CTA.",
    durationSeconds: 5,
    aspectRatio: "9:16",
  },
];

/**
 * The exact request shape to hand to Higgsfield's generate_video MCP tool
 * for one storyboard clip — same pattern as generate.ts buildKlingRequest.
 * `startImageMediaId` comes from media_upload'ing the clip's frame first.
 * Always preflight with get_cost:true; at the last check a single 5s
 * kling3_0_turbo clip was 7.5 credits against a 9.9 balance, so the full
 * four-clip run does NOT fit on Higgsfield today — it fits on Magic Hour's
 * free daily credits once a key exists.
 */
export function buildClipRequest(clip: StoryboardClip, startImageMediaId: string) {
  return {
    model: "kling3_0_turbo",
    params: {
      prompt: clip.motionPrompt,
      aspect_ratio: clip.aspectRatio,
      duration: clip.durationSeconds,
      medias: [{ role: "start_image", value: startImageMediaId }],
    },
  };
}
