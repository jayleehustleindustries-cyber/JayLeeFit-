export type Platform = "Instagram" | "TikTok" | "YouTube";

export type Pillar =
  | "Fitness/Training"
  | "Motivation/Mindset"
  | "Personal Brand/Hustle"
  | "Evidence-Based Performance";

export type AspectRatio = "9:16" | "16:9" | "1:1";

/**
 * A reusable "proven structure" — not a one-off script, but the shape of a
 * format that reliably works (a hook pattern, a pacing pattern), applied to
 * this brand's pillars. Prompt text is written to be portable across
 * whatever actually generates the clip (Kling 3.0 today, Veo later if that
 * gets set up, or pasted into any other text-to-video tool by hand).
 */
export type HookFormat = {
  id: string;
  label: string;
  pillar: Pillar;
  /** Why this structure works — the reverse-engineering reasoning, not just the prompt. */
  why: string;
  prompt: string;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  /** True if this format assumes the same on-screen persona appears across cuts/scenes. */
  requiresConsistentCharacter: boolean;
};

export type Idea = {
  id: string;
  text: string;
  pillar: Pillar;
};

/**
 * "core" = present in the original locked identity description
 * (JLF-20260629-001's reference manifest and clip prompts). "extended" =
 * introduced by later jobs (JLF-20260804-001, JLF-20260811-001) that
 * referenced the identity only by handle rather than by written
 * description — kept in the approved set per explicit sign-off, but
 * tagged so QA can weight core vs. extended differently if a real
 * generation ever drifts specifically on one of the newer scenes.
 */
export type ApprovedEnvironment = {
  id: string;
  label: string;
  description: string;
  status: "core" | "extended";
};

export type ReferenceImageRole =
  | "hero_identity"
  | "backup"
  | "texture"
  | "profile"
  | "motion"
  | "full_body"
  | "wardrobe";

/**
 * Which image/video backend a given generation should use, and why. Kept
 * as a small enum + rationale rather than one hardcoded string so the
 * choice is documented, not assumed — see avatar-identity.ts's
 * GENERATOR_CHOICE for the actual current pick.
 */
export type GeneratorChoice = {
  /** Higgsfield model id, e.g. "soul_cast" for one-off text-only character identity, or "soul_2"+a trained Soul id for a reusable trained character. */
  provider: "higgsfield";
  model: string;
  /** "trained-soul" once the real reference photos are trained into a reusable Higgsfield Soul; "one-off" (soul_cast) until then. */
  mode: "one-off" | "trained-soul";
  /** Higgsfield Soul id once trained — unset while mode is "one-off". */
  soulId?: string;
  rationale: string;
};

/**
 * Locked narration voice for this identity — same "one identity, never
 * drifts" principle as the visual side. voiceId is required before any
 * real text_to_speech call; a spec with voiceId undefined is a
 * documented placeholder, not something to generate audio with.
 */
export type VoiceLock = {
  provider: "elevenlabs";
  voiceId?: string;
  modelId: string;
  rationale: string;
};

/**
 * Structured, auditable identity spec — meant to be diffable against the
 * real Drive-side reference manifest (JLF-20260629-001's
 * REF_MANIFEST), not to be injected into a prompt directly. See
 * avatar-identity.ts's flattenNegativeConstraints()/applyAvatarLock()
 * for the actual string-injection mechanism.
 */
export type AvatarIdentitySpec = {
  id: string;
  label: string;
  /** This identity is built from a real person's actual reference photos, not a fictional character. */
  isRealPersonLikeness: true;
  likenessApprovalStatus: "approved" | "pending" | "revoked";
  face: string;
  hair: string;
  build: string;
  expression: string;
  wardrobeCore: string;
  approvedEnvironments: ApprovedEnvironment[];
  referenceImageManifest: { role: ReferenceImageRole; note: string }[];
  negativeConstraints: Record<string, string[]>;
  generator: GeneratorChoice;
  voice: VoiceLock;
  /** Non-canonical identifiers seen in the live Drive system that refer to this same locked identity — documented for traceability, never injected into prompts. */
  aliases: string[];
  sourceNotes: string;
};

/** Stage 1 output — pure, free, no generation calls. */
export type VideoPromptJob = {
  ideaId: string;
  idea: string;
  pillar: Pillar;
  hookFormatId: string;
  hookLabel: string;
  prompt: string;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  platforms: Platform[];
};

/**
 * Stage 2 record — the ledger row a real generation run produces. Mirrors
 * storefront/lib/asset-pipeline's AssetJob shape: resumable, auditable,
 * meant to become one row in the (not-yet-created) Airtable `Assets` table
 * once content-engine's data layer exists.
 */
export type VideoAssetJob = VideoPromptJob & {
  model: string;
  jobId?: string;
  videoUrl?: string;
  costCredits?: number;
  status: "queued" | "generating" | "done" | "failed";
  generatedAt?: string;
  error?: string;
};
