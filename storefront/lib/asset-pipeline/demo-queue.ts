/**
 * Prints the Stage 1 output for the sample catalog — no network calls, no
 * cost. Run with: npx tsx lib/asset-pipeline/demo-queue.ts
 */
import { sampleProducts } from "@/lib/sample-products";
import { buildAssetQueue } from "./build-queue";

const queue = buildAssetQueue(sampleProducts.slice(0, 2));

console.log(`${queue.length} prompt jobs for ${sampleProducts.slice(0, 2).length} products\n`);
for (const job of queue) {
  console.log(`[${job.sku} · ${job.angleLabel} · ${job.aspectRatio}]`);
  console.log(job.prompt);
  console.log("");
}
