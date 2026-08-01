import { z } from "zod";
import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT } from "../constants.js";

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

export const responseFormatField = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

export const limitField = z
  .number()
  .int()
  .min(1)
  .max(MAX_LIST_LIMIT)
  .default(DEFAULT_LIST_LIMIT)
  .describe(`Maximum results to return, 1-${MAX_LIST_LIMIT} (default ${DEFAULT_LIST_LIMIT})`);

export const offsetField = z
  .number()
  .int()
  .min(0)
  .default(0)
  .describe("Number of results to skip for pagination (default 0)");
