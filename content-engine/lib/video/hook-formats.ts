import type { HookFormat } from "./types";

/**
 * Four seed formats. The first three were handed over verbatim earlier in
 * this project's design conversation; the fourth was reverse-engineered
 * from a real reference clip the user provided (a Gemini/Veo-generated
 * video of the same on-screen persona moving through a gym, a rooftop
 * skyline at dusk, and back to the gym). That clip's whole point is that
 * the same identity holds across completely different generated
 * environments — that's the capability this fourth format names
 * directly, since it's a real requirement any generation backend needs
 * to support well, not just a nice-to-have.
 *
 * Persona/wardrobe/environment specifics are deliberately NOT hardcoded
 * into any prompt string below — they're injected by prompt-builder.ts
 * via avatar-identity.ts's applyAvatarLock(), gated on
 * requiresConsistentCharacter. That's the single source of truth for
 * what the on-screen persona looks like; do not reintroduce identity
 * details here.
 */
export const HOOK_FORMATS: HookFormat[] = [
  {
    id: "mistake-fix",
    label: "Wrong vs. Right — mistake-fix",
    pillar: "Fitness/Training",
    why:
      "Pattern-interrupt correction is one of the most consistently high-retention short-form fitness structures — the viewer stops scrolling to see what's 'wrong,' then stays for the fix.",
    prompt:
      "Vertical 9:16, 8-10 seconds. Open mid-rep on a common exercise (e.g. squat) with visibly wrong form, freeze-frame with a red \"X\" flash and bold on-screen text \"YOU'RE DOING THIS WRONG.\" Hard cut to the same lifter performing correct form in slow motion, green checkmark flash, on-screen text \"DO THIS INSTEAD.\" Gym setting, natural light, handheld energy but stabilized. End on a static hold with a one-line caption overlay reinforcing the fix. No dialogue — text-driven, sound-off readable.",
    aspectRatio: "9:16",
    durationSeconds: 9,
    requiresConsistentCharacter: false,
  },
  {
    id: "cold-open-confrontation",
    label: "Cold-open confrontational hook",
    pillar: "Motivation/Mindset",
    why:
      "Calling out the viewer's own excuse in the first frame — no intro, no logo, no warm-up — is the highest-retention opener in the mindset/motivation niche because it removes the two seconds where people usually swipe past.",
    // Persona/wardrobe locked in avatar-identity.ts — do not add cap/chain/outfit details here.
    prompt:
      "Vertical 9:16, 12-15 seconds. Cold open: subject looks directly into camera, no intro, states a blunt line calling out a common excuse (\"You said you'd start Monday — it's Thursday\"). Cut to gritty gym B-roll (chalk, plates loading, treadmill grind) synced to a rising beat, on-screen kinetic text reinforcing \"DISCIPLINE > MOTIVATION.\" Close back on subject's face for a direct final line to camera. High contrast, slightly desaturated grade, handheld-but-controlled camera movement.",
    aspectRatio: "9:16",
    durationSeconds: 13,
    requiresConsistentCharacter: true,
  },
  {
    id: "myth-vs-science",
    label: "Myth vs. the actual science",
    pillar: "Evidence-Based Performance",
    why:
      "Mythbusting/fast-fact structure earns the 'this account is different from generic bro-science' positioning behind the Evidence-Based Performance pillar, and the myth->correction beat is a proven retention hook in the educational-fitness niche.",
    prompt:
      "Vertical 9:16, 10 seconds. Open with bold on-screen text of a common fitness myth (\"Myth: lifting slow burns more fat\"), subject shakes head on camera. Quick cut to a simple animated stat/graphic overlay showing the real data point, subject delivers a single blunt correction line to camera. Close on-screen text: \"Train smarter — data beats guessing.\" Clean, well-lit, minimal-distraction background so the text/stat reads clearly at a glance.",
    aspectRatio: "9:16",
    durationSeconds: 10,
    requiresConsistentCharacter: false,
  },
  {
    id: "consistent-character-montage",
    label: "Consistent-character multi-scene montage",
    pillar: "Personal Brand/Hustle",
    why:
      "Reverse-engineered from a real reference clip: the same on-screen persona holding across completely different generated environments (gym, rooftop skyline at dusk, gym again) is what makes a generated video read as 'a real person's brand' rather than generic stock AI footage — the identity, not any single scene, is the asset.",
    // Persona/wardrobe/environment specifics locked in avatar-identity.ts
    // (approvedEnvironments) — do not hardcode them here.
    prompt:
      "Vertical 9:16, 10 seconds. Same subject across three quick scenes: (1) direct-to-camera in the approved gym environment, (2) cut to the approved rooftop-at-dusk environment, same identity clearly preserved, (3) hard cut back to the gym for a final direct line to camera. Cinematic, slightly desaturated color grade, subtle camera drift rather than static shots.",
    aspectRatio: "9:16",
    durationSeconds: 10,
    requiresConsistentCharacter: true,
  },
];

export function getHookFormat(id: string): HookFormat | undefined {
  return HOOK_FORMATS.find((h) => h.id === id);
}
