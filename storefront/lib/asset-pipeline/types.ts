export type ShotAngle = {
  id: string;
  label: string;
  /** Framing/composition language, inserted into the prompt. */
  framing: string;
  /** Camera/lens language, inserted into the prompt. */
  camera: string;
  aspectRatio: "1:1" | "4:5" | "3:4";
};

export type PromptJob = {
  sku: string;
  slug: string;
  name: string;
  angleId: string;
  angleLabel: string;
  prompt: string;
  model: string;
  aspectRatio: ShotAngle["aspectRatio"];
};

/**
 * One row of the generation ledger — the record kept per rendered asset so a
 * batch run is resumable and auditable. In production this is a tab in the
 * same Google Sheet the storefront already reads inventory from (see
 * lib/asset-pipeline/README.md), not a separate database.
 */
export type AssetJob = PromptJob & {
  jobId?: string;
  imageUrl?: string;
  status: "queued" | "generating" | "done" | "failed";
  generatedAt?: string;
  error?: string;
};
