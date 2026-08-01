import { RANK_LABEL } from "@/lib/products";
import type { CardRank } from "@/lib/types";

const RANK_CHAR: Record<CardRank, string> = {
  Ace: "A",
  King: "K",
  Queen: "Q",
  Jack: "J",
};

/** Condition grade shown as a tiny playing card + label. */
export default function RankChip({
  rank,
  showLabel = true,
}: {
  rank: CardRank;
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2" title={RANK_LABEL[rank]}>
      <span className="rank-card">{RANK_CHAR[rank]}</span>
      {showLabel && (
        <span className="font-mono text-xs uppercase tracking-widest text-fog">
          {RANK_LABEL[rank]}
        </span>
      )}
    </span>
  );
}
