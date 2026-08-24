import type { Pillar, Platform } from "./types";

/**
 * Pre-written scripts selected from the user-provided "14 Day Content
 * Runners" document as the first pilot batch — chosen for closest match
 * to the real winning pattern found in this session's Metricool baseline
 * (short, second-person, defiant Motivation/Mindset hooks outperformed
 * longer educational posts by ~100x on the best one). Unlike HookFormat in
 * hook-formats.ts, these are already finished scripts, not templates to
 * fill in with an idea — onScreenText/audioScript are copied verbatim from
 * the source PDF, not paraphrased.
 */
export type PilotScript = {
  id: string;
  title: string;
  pillar: Pillar;
  onScreenText: string;
  audioScript: string;
  platforms: Platform[];
  sourceDocument: string;
};

export const PILOT_SCRIPTS: PilotScript[] = [
  {
    id: "the-mandate",
    title: "The Mandate",
    pillar: "Motivation/Mindset",
    onScreenText: "Motivation is garbage. You need a mandate.",
    audioScript:
      "Motivation relies on your emotions, and your emotions are unreliable. You don't need to feel pumped up. You need a mandate. A non-negotiable contract with yourself that says 'this gets done today, period.' Stop waiting for the feeling and start executing the contract.",
    platforms: ["Instagram", "TikTok"],
    sourceDocument: "14 Day Content Runners — Script 19",
  },
  {
    id: "the-dark-room",
    title: "The Dark Room",
    pillar: "Motivation/Mindset",
    onScreenText: "You can't fake the work when the lights go out.",
    audioScript:
      "The internet loves the highlight reel. The PRs, the launches, the success. What they don't show is the 4 AM alarm, the callouses, the quiet moments of total doubt. The results you want are hiding in the work you are avoiding when nobody is watching. Put in the reps.",
    platforms: ["Instagram", "TikTok"],
    sourceDocument: "14 Day Content Runners — Script 2",
  },
  {
    id: "the-filter",
    title: "The Filter",
    pillar: "Motivation/Mindset",
    onScreenText: "High standards filter out the uncommitted. Which side are you on?",
    audioScript:
      "We don't lower the bar to fill the room. I'd rather have a tribe of ten absolute savages than a crowd of a thousand tourists. If our intensity intimidates you, this isn't for you. But if you're looking for the standard you've been missing, you're in the right place.",
    platforms: ["Instagram", "TikTok"],
    sourceDocument: "14 Day Content Runners — Script 5",
  },
];

export function getPilotScript(id: string): PilotScript | undefined {
  return PILOT_SCRIPTS.find((s) => s.id === id);
}
