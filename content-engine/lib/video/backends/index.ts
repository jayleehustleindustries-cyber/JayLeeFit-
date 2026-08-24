import { luma } from "./luma";
import { magichour } from "./magichour";
import { pollinations } from "./pollinations";
import type { BackendName, VideoBackend } from "./types";

export type { BackendName, GenerateOptions, GenerateResult, VideoBackend } from "./types";

/** Cheapest-first: keyless free tier, then free-credits API, then paid. */
export const BACKENDS: Record<BackendName, VideoBackend> = {
  pollinations,
  magichour,
  luma,
};

export const DEFAULT_BACKEND: BackendName = "pollinations";

export function getBackend(name: string): VideoBackend {
  const backend = BACKENDS[name as BackendName];
  if (!backend) {
    throw new Error(`Unknown backend "${name}" — expected one of: ${Object.keys(BACKENDS).join(", ")}`);
  }
  return backend;
}
