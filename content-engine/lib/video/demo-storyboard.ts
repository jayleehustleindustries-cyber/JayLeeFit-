/**
 * Prints the EHC reselling video production plan — every clip's start
 * frame, motion prompt, and ready-to-hand Higgsfield request shape.
 * Zero network calls, zero cost. Run with: npm run demo:storyboard
 */
import { buildClipRequest, RESELLING_STORYBOARD } from "./reselling-storyboard";

const total = RESELLING_STORYBOARD.reduce((s, c) => s + c.durationSeconds, 0);
console.log(`EHC reselling video — ${RESELLING_STORYBOARD.length} clips, ~${total}s before edit\n`);

for (const clip of RESELLING_STORYBOARD) {
  console.log(`── Clip ${clip.order}: ${clip.id} (${clip.durationSeconds}s · ${clip.aspectRatio})`);
  console.log(`   start frame: ${clip.frame}`);
  console.log(`   beat: ${clip.beat}`);
  console.log(`   motion: ${clip.motionPrompt}`);
  console.log(`   higgsfield request (media id placeholder):`);
  console.log(
    "   " + JSON.stringify(buildClipRequest(clip, "<media_id from media_upload of frame>")).slice(0, 200) + "…\n"
  );
}

console.log("Then: assemble clips in order in Descript (import_media → prompt_project_agent for cuts/captions/music).");
