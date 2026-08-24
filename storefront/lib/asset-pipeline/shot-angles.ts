import type { ShotAngle } from "./types";

/**
 * Four angles per item covers what a resale listing actually needs: the
 * "what is it" shot, the "what's it made of" shot, the "does it have flaws"
 * shot, and the "what does it look like on" shot. Framing/camera language
 * is written the way working product photographers brief a shoot, not as
 * generic adjectives — that's what makes the model hold a consistent look
 * across a whole catalog instead of drifting per item.
 */
export const SHOT_ANGLES: ShotAngle[] = [
  {
    id: "flat-lay",
    label: "Flat Lay",
    framing:
      "shot directly from above, garment laid flat and fully smoothed, centered in frame with even margin on all sides, no folds hiding the silhouette",
    camera:
      "overhead product photography, 50mm equivalent, small aperture for edge-to-edge focus, soft diffused top-light",
    aspectRatio: "1:1",
  },
  {
    id: "detail-macro",
    label: "Detail Macro",
    framing:
      "extreme close-up on the garment's most distinctive material detail — weave texture, stitching, hardware, or a label — filling most of the frame",
    camera:
      "macro product photography, 100mm macro lens, shallow depth of field, single raking light source to bring out texture",
    aspectRatio: "4:5",
  },
  {
    id: "ghost-mannequin",
    label: "Ghost Mannequin",
    framing:
      "the garment alone, invisible-mannequin effect giving it natural human shape and volume with no visible body or mannequin, floating in frame",
    camera:
      "studio product photography, 85mm lens, three-point softbox lighting, subject sharply isolated from background",
    aspectRatio: "3:4",
  },
  {
    id: "styled-editorial",
    label: "Styled Editorial",
    framing:
      "the garment worn and styled in a minimal moody scene, three-quarter body composition, negative space left for a headline",
    camera:
      "editorial fashion photography, 85mm portrait lens, shallow depth of field, single dramatic rim light",
    aspectRatio: "4:5",
  },
];

export function getShotAngle(id: string): ShotAngle | undefined {
  return SHOT_ANGLES.find((a) => a.id === id);
}
