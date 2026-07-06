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
 * One clip of a produced, scripted video. Storyboards (reselling-storyboard,
 * fitness-sunday-storyboard) are arrays of these; lib/video/produce.ts runs
 * them. A clip with a `frame` is generated image-to-video from that start
 * frame (exact brand visuals held); a clip without one is text-to-video
 * from motionPrompt alone. voiceover/onScreenText aren't consumed by
 * generation — they're the edit layer, applied in Descript after the
 * clips exist.
 */
export type StoryboardClip = {
  order: number;
  id: string;
  /** Optional start frame, relative to the content-engine root. */
  frame?: string;
  /**
   * Already-produced footage for this beat (relative to the content-engine
   * root). When set, produce.ts uses this file instead of generating —
   * zero credits spent.
   */
  existingVideo?: string;
  /** What this beat does for the story. */
  beat: string;
  /**
   * With a frame: motion-only prompt (the frame already is the scene).
   * Without one: a full text-to-video scene prompt.
   */
  motionPrompt: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  /** Spoken line for this beat — recorded or TTS'd, laid in during the edit. */
  voiceover?: string;
  /** Caption/text overlay for this beat — added in the edit. */
  onScreenText?: string;
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
