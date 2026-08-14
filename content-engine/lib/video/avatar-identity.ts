import type { AvatarIdentitySpec } from "./types";

/**
 * Every constraint found across all three JLF-20260629-001 clip prompts
 * plus the governance doc's §6.5 list, deduplicated by category but with
 * near-duplicate phrasings from different sources kept as separate
 * entries (more phrasing coverage helps a video model actually avoid a
 * failure mode — collapsing "no warped hands" and "no malformed hands"
 * into one loses signal for free). Nothing from any source list was
 * dropped; see AVATAR-README.md's verification note.
 */
export const MASTER_NEGATIVE_CONSTRAINTS: Record<string, string[]> = {
  identityAndAnatomy: [
    "no identity drift",
    "no facial redesign",
    "no inconsistent faces",
    "no facial warping",
    "no extra people",
    "no extra limbs",
    "no duplicate limbs",
    "no malformed hands",
    "no warped hands",
    "no body morphing",
    "no anatomy distortion",
    "no distorted anatomy",
    "no sudden muscle growth",
    "no smile",
    "no macro eye shot",
  ],
  wardrobeAndBranding: [
    "no tattoos",
    "no wardrobe changes",
    "no invented clothing text",
    "no clothing text",
    "no unapproved logo",
    "no logo changes",
    "use only approved JayLeeFit branding",
  ],
  environmentAndCamera: [
    "no bent equipment",
    "no warped equipment",
    "no equipment mutation",
    "no impossible cable path",
    "no environment teleportation",
    "no floating objects",
    "no neon",
    "no glossy CGI",
    "no speed ramp inside the generated clip",
    "no hard flash transition",
    "no fast spectacle",
  ],
  textAndClaims: [
    "no random text",
    "no extra wording",
    "no fake metrics",
    "no fabricated client outcomes",
    "no unsupported performance claims",
  ],
  compositionAndTechnical: ["no lip-sync requirement"],
};

/**
 * The single source of truth for the JayLeeFit on-screen persona.
 *
 * This consolidates three sources that previously disagreed with each
 * other: job JLF-20260629-001's three per-clip Negative_Constraints
 * lists (each clip had a DIFFERENT list — a real inconsistency, now
 * merged above into one master set applied to every generation), the
 * JLF-20260629-001 reference-image manifest's identity_lock_notes, and
 * the "Social Media Automation Pipeline" governance doc's §6.5 JayLeeFit
 * continuity requirements. All three live in Google Drive, outside this
 * repo — see AVATAR-README.md for the full provenance and the honest
 * backend-status writeup.
 *
 * This is a real person's actual likeness (reference photos, not a
 * fictional character) — likenessApprovalStatus tracks consent, not
 * just brand fit. Treat any proposed change to this spec as the kind of
 * "major change to JayLeeFit visual identity" the governance doc
 * requires human approval for — never edit this file's identity fields
 * without that approval recorded somewhere.
 */
export const JAYLEEFIT_AVATAR: AvatarIdentitySpec = {
  id: "jayleefit-locked-v1",
  label: "JayLeeFit locked athlete identity",
  isRealPersonLikeness: true,
  likenessApprovalStatus: "approved",
  face:
    "light skin, blue-gray eyes, light mustache and short stubble, serious controlled expression",
  hair: "short dark-blond/light-brown hair styled back, backwards cap",
  build: "athletic muscular build",
  expression:
    "serious, controlled — never smiling, never shot as a macro/close-up on the eyes",
  wardrobeCore:
    "black compression long-sleeve (or plain black t-shirt with a small chest wordmark), silver chain necklace",
  approvedEnvironments: [
    {
      id: "industrial-gym",
      label: "Industrial gym",
      description:
        "moody industrial gym, dark concrete and black steel, deep shadows, restrained crimson accents, recurring DISCIPLINE / FOCUS / CONSISTENCY / SUCCESS wall graphic",
      status: "core",
    },
    {
      id: "rooftop-dusk",
      label: "Rooftop skyline at dusk",
      description:
        "rooftop with a dense city skyline behind, warm sunset light, same wardrobe and identity clearly preserved",
      status: "core",
    },
    {
      id: "kitchen-sunrise",
      label: "Kitchen at sunrise",
      description:
        "dark modern kitchen at sunrise, golden hour light through blinds, coffee in a heavy ceramic mug",
      status: "extended",
    },
    {
      id: "misty-hilltop",
      label: "Misty hilltop skyline",
      description:
        "wide silhouette on a misty hilltop at dawn overlooking a dense city skyline, soft pastel sky",
      status: "extended",
    },
  ],
  referenceImageManifest: [
    {
      role: "hero_identity",
      note: "Primary anchor. Use for face, cap, facial hair, eyes, and expression. All other reference roles support this one — none may redesign it.",
    },
    {
      role: "backup",
      note: "Secondary face reference for identity stability across lighting/expression changes only.",
    },
    {
      role: "texture",
      note: "Sweat/skin realism only — not an identity or expression source.",
    },
    {
      role: "profile",
      note: "Side-profile source for head shape, nose bridge, jawline only.",
    },
    {
      role: "motion",
      note: "Movement/anatomy credibility only. Must never be allowed to redesign the face.",
    },
    {
      role: "full_body",
      note: "Body proportions and framing only.",
    },
    {
      role: "wardrobe",
      note: "Outfit continuity reference for non-lift/studio framing.",
    },
  ],
  negativeConstraints: MASTER_NEGATIVE_CONSTRAINTS,
  aliases: ["@jayleehustle.industries"],
  sourceNotes:
    "Consolidated 2026 from: JLF-20260629-001 Clip 1-3 Negative_Constraints (three disagreeing lists, merged here), " +
    "JLF-20260629-001_REF_MANIFEST_20260704 identity_lock_notes, and the Social Media Automation Pipeline governance " +
    "doc §6.5/§10. The kitchen-sunrise and misty-hilltop environments come from later jobs (JLF-20260804-001, " +
    "JLF-20260811-001) that referenced the identity only as '@jayleehustle.industries' rather than by written " +
    "description — included here as 'extended' per explicit approval, not because their identity match to the " +
    "original locked description has been independently re-verified.",
};

/** Flattens the categorized constraints into the single string actually injected into a prompt. */
export function flattenNegativeConstraints(
  spec: AvatarIdentitySpec = JAYLEEFIT_AVATAR
): string {
  return Object.values(spec.negativeConstraints).flat().join(", ");
}

/**
 * The identity-lock injection mechanism — same spirit as
 * storefront/lib/asset-pipeline/prompt-builder.ts's BRAND_LOOK constant:
 * a plain, unconditional string append, no validation framework. Call
 * sites decide WHEN to call this (prompt-builder.ts gates it on
 * hook.requiresConsistentCharacter) — this function itself does no
 * gating and no network calls.
 */
export function applyAvatarLock(
  prompt: string,
  spec: AvatarIdentitySpec = JAYLEEFIT_AVATAR
): string {
  const lookLine =
    `${spec.label}: ${spec.face}; ${spec.hair}; ${spec.build}; ${spec.expression}; ${spec.wardrobeCore}. ` +
    `Environment must be one of: ${spec.approvedEnvironments.map((e) => e.description).join(" — or — ")}.`;
  const negativeLine = `Avoid: ${flattenNegativeConstraints(spec)}.`;
  return [prompt, lookLine, negativeLine].join(" ");
}
