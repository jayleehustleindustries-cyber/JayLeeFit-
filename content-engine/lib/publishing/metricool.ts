/**
 * Metricool integration — market research (best-time-to-post, virality
 * ranking) and scheduling, for the real jay_legacy_fit brand.
 *
 * Pure request-builders only, same philosophy as lib/video/generate.ts:
 * these functions never call the network themselves. An agent turn reads
 * a job, calls one of these to get the exact tool params, then calls the
 * real `mcp__metricool__*` tool directly.
 *
 * All IDs below are REAL, pulled live from this account this session —
 * not placeholders:
 * - getBrandSettings() confirmed brand id 6394851 ("jay_legacy_fit"),
 *   timezone America/Los_Angeles, networks TikTok (jay_legacy_fit) and
 *   YouTube (UCsgtODjIaB-lsxpC6b8Dsfg) in networksData.
 * - Instagram (@j_lee_is_me, claimed "confirmed live" in
 *   content-engine/ARCHITECTURE.md §5) did NOT appear in networksData
 *   on this pull — flagged here rather than assumed; re-verify with
 *   getBrandSettings before routing any Instagram post through
 *   createScheduledPost.
 * - getAnalyticsAvailableMetrics(network:'youtube', connector:'videos')
 *   returned every field marked "Do not use" (deprecated) — the correct,
 *   current connector is 'all videos' (YTVV-prefixed fields below).
 *   ARCHITECTURE.md §5's YTPO-style field IDs predate this check and
 *   should be treated as unverified until re-pulled the same way.
 */

export const JAYLEEFIT_BRAND_ID = "6394851";
export const JAYLEEFIT_TIMEZONE = "America/Los_Angeles";

export type MetricoolNetwork = "tiktok" | "youtube" | "instagram";

/** Confirmed live in Metricool's networksData this session. "instagram" is NOT in this list — see module doc. */
export const CONFIRMED_NETWORKS: readonly MetricoolNetwork[] = ["tiktok", "youtube"];

/**
 * Virality-ranking metrics — the fields to sort/compare posts on to answer
 * "what's actually working." Verified live via getAnalyticsAvailableMetrics
 * this session (not carried over from ARCHITECTURE.md's earlier, partly
 * deprecated list).
 */
export const VIRALITY_METRICS: Record<"tiktok" | "youtube", Record<string, string>> = {
  tiktok: {
    views: "TKPO07",
    likes: "TKPO08",
    comments: "TKPO09",
    shares: "TKPO10",
    reach: "TKPO11",
    fullVideoWatchedRate: "TKPO13",
    avgTimeWatchedSeconds: "TKPO15",
    engagementRatio: "TKPO9999",
  },
  youtube: {
    // connector: "all videos" — the "videos" connector is fully deprecated, do not use YTVI* fields.
    views: "YTVV06",
    watchMinutes: "YTVV07",
    avgViewDuration: "YTVV08",
    likes: "YTVV09",
    comments: "YTVV11",
    shares: "YTVV12",
  },
};

/**
 * Params for getBestTimeToPostByNetwork — call once per network before
 * scheduling a batch, not once per post. A 1-week lookback is the tool's
 * own recommended max window.
 */
export function buildBestTimeToPostRequest(
  network: "tiktok" | "youtube",
  fromDate: string,
  toDate: string
) {
  return {
    brandId: JAYLEEFIT_BRAND_ID,
    socialNetwork: network,
    timezone: JAYLEEFIT_TIMEZONE,
    fromDate,
    toDate,
  };
}

/**
 * Params for getAnalyticsDataByMetrics — the virality/performance pull
 * for the retro step content-engine/ARCHITECTURE.md §1a already
 * describes ("Analytical Agent" — 24h/72h/1wk after publish).
 */
export function buildVirologyAnalyticsRequest(
  network: "tiktok" | "youtube",
  from: string,
  to: string
) {
  return {
    brandId: JAYLEEFIT_BRAND_ID,
    from,
    to,
    metrics: Object.values(VIRALITY_METRICS[network]),
  };
}

/**
 * Minimal createScheduledPost payload shape for a single-network video
 * post. Deliberately narrow — this repo's global rule (ARCHITECTURE.md
 * §6, "no autonomous spend/publish by default") applies here too:
 * building this object is free; calling createScheduledPost with it is
 * the real, human-approval-gated action.
 */
export function buildScheduledPostRequest(params: {
  network: "tiktok" | "youtube";
  videoUrl: string;
  text: string;
  publicationDateTimeIso: string; // "YYYY-MM-DDTHH:mm:ss", local to JAYLEEFIT_TIMEZONE
  youtubeTitle?: string;
}) {
  const info: Record<string, unknown> = {
    autoPublish: true,
    draft: false,
    media: [params.videoUrl],
    providers: [{ network: params.network }],
    publicationDate: { dateTime: params.publicationDateTimeIso, timezone: JAYLEEFIT_TIMEZONE },
    text: params.text,
  };
  if (params.network === "youtube") {
    info.youtubeData = {
      title: params.youtubeTitle ?? params.text.slice(0, 100),
      type: "short",
      privacy: "public",
      madeForKids: false,
    };
  }
  if (params.network === "tiktok") {
    info.tiktokData = { privacyOption: "PUBLIC_TO_EVERYONE" };
  }
  return { date: params.publicationDateTimeIso, blogId: JAYLEEFIT_BRAND_ID, info };
}
