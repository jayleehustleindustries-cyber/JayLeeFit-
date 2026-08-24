/**
 * Prints Stage 1 output for sample ideas against every seeded hook format —
 * no network calls, no cost. Run with: npx tsx lib/video/demo-queue.ts
 */
import { HOOK_FORMATS } from "./hook-formats";
import { buildVideoPrompt } from "./prompt-builder";
import type { Idea } from "./types";

const SAMPLE_IDEAS: Record<string, Idea> = {
  "mistake-fix": { id: "idea-01", text: "Squat depth — cutting it short vs. full range", pillar: "Fitness/Training" },
  "cold-open-confrontation": { id: "idea-02", text: "Calling out the 'I'll start Monday' excuse", pillar: "Motivation/Mindset" },
  "myth-vs-science": { id: "idea-03", text: "Myth: you need to lift slow to burn more fat", pillar: "Evidence-Based Performance" },
  "consistent-character-montage": { id: "idea-04", text: "Gym-to-rooftop brand reel for Everyday Hustle Co", pillar: "Personal Brand/Hustle" },
};

for (const format of HOOK_FORMATS) {
  const idea = SAMPLE_IDEAS[format.id];
  const job = buildVideoPrompt(idea, format.id);
  console.log(`[${job.hookLabel} · ${job.aspectRatio} · ${job.durationSeconds}s]`);
  console.log(job.prompt);
  console.log("");
}
