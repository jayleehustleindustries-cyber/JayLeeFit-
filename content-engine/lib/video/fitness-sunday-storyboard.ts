/**
 * "The Standard Held" — Sunday Villain coaching video for jay_legacy_fit.
 *
 * Script written from the real content calendar in Drive ("Content schedule
 * for this week 001"): the Sunday row is Type=Villain, Persona=Jay, Hook=
 * "Another week the standard held. Most folded by Tuesday." The visuals are
 * user-provided from the fitness story set (same persona as the reselling
 * frames: backwards cream cap, black tee, chain; dark red-lit gym):
 *
 * - assets/fitness-story/clips/clip-chalk-barbell.mp4 — REAL 5s clip
 *   (1080x1916, has audio): chalk clap, then standing tall with the bar.
 * - assets/fitness-story/clips/clip-sled-push.mp4 — REAL 5s clip: low,
 *   grinding sled drive.
 * - assets/fitness-story/frame-09-squat-depth.png — still, squat at full
 *   depth; regenerable to a clip (image-to-video) or usable as a slow
 *   push-in motion still in the edit for free.
 *
 * Two of three beats already exist as finished footage, so producing this
 * video spends credits on AT MOST one clip (the squat), and zero if the
 * edit uses the still with a Ken-Burns push instead.
 *
 * Viral mechanics the structure leans on: cold-open callout in text before
 * the first second ends; proof-of-work b-roll (not talking) under a
 * villain-voiced VO; one concrete coaching directive (the "one more rep"
 * protocol) so it's coaching, not just mood; hard brand close with a
 * repeatable sign-off line.
 */
import type { StoryboardClip } from "./types";

export const FITNESS_SUNDAY_STORYBOARD: StoryboardClip[] = [
  {
    order: 1,
    id: "hook-chalk",
    existingVideo: "assets/fitness-story/clips/clip-chalk-barbell.mp4",
    beat: "Cold open — the callout. Chalk clap into standing tall with the bar while the hook line lands.",
    motionPrompt:
      "(already produced — regen only if replacing) Same operator, dark red-lit gym: claps chalked hands once, cloud drifts, then unracks and stands tall with a loaded barbell, eyes forward. Slow push-in.",
    durationSeconds: 5,
    aspectRatio: "9:16",
    voiceover: "Another week the standard held. Most folded by Tuesday.",
    onScreenText: "MOST FOLDED BY TUESDAY.",
  },
  {
    order: 2,
    id: "work-sled",
    existingVideo: "assets/fitness-story/clips/clip-sled-push.mp4",
    beat: "Proof of work + the actual coaching. Sled grind under the protocol line — this is what makes it a coaching video, not a mood reel.",
    motionPrompt:
      "(already produced — regen only if replacing) Same operator drives a loaded sled low and hard across a dark gym floor, red neon behind, controlled powerful strides toward camera.",
    durationSeconds: 5,
    aspectRatio: "9:16",
    voiceover:
      "You don't need a new program. Same lifts as last week — one more rep, or five more pounds. Log it, or it didn't happen.",
    onScreenText: "ONE MORE REP THAN LAST WEEK. LOG IT.",
  },
  {
    order: 3,
    id: "close-squat",
    frame: "assets/fitness-story/frame-09-squat-depth.png",
    beat: "The close — depth as the metaphor for the standard. Generate image-to-video from the frame, or run the still with a slow push-in for zero credits.",
    motionPrompt:
      "From the bottom of the squat he rises slowly and under control to full lockout, bar steady across his back, red rim light flaring slightly as he stands. Camera holds, tiny push-in. Final beat freezes at lockout for the end card.",
    durationSeconds: 5,
    aspectRatio: "9:16",
    voiceover: "New week starts tomorrow. Hold the standard.",
    onScreenText: "HOLD THE STANDARD.  @jay_legacy_fit",
  },
];

/** Post copy to pair with the video when scheduling (Metricool). */
export const FITNESS_SUNDAY_POST = {
  title: "The Standard Held — Sunday Villain",
  calendarRow: 'Sun · Villain · Jay · "Another week the standard held. Most folded by Tuesday."',
  caption:
    "Another week the standard held. Most folded by Tuesday.\n\n" +
    "No new program. Same lifts, one more rep than last week. Log it or it didn't happen.\n\n" +
    "New week starts tomorrow. Hold the standard.\n\n" +
    "#discipline #gymmotivation #strengthtraining #consistency #everydayhustle",
  platforms: ["Instagram", "TikTok", "YouTube"] as const,
};
