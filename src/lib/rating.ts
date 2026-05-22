// Reaction classification + derived star rating — ported from the glmps web
// viewer so reaction maths stays identical across the websites and this app.
//
// `+` = upvote, `-` = downvote, `ℹ️` = info-request.

export const REACTION_UP = "+";
export const REACTION_DOWN = "-";
export const REACTION_INFO = "ℹ️";

export type ReactionKind = "up" | "down" | "info" | "other";

/** Classify a kind:7 event's content into our buckets. */
export function classifyReaction(content: string): ReactionKind {
  const c = content.trim();
  if (c === REACTION_UP) return "up";
  if (c === REACTION_DOWN) return "down";
  if (c === REACTION_INFO || c === "+info" || c === "info") return "info";
  return "other";
}

/**
 * Net upvotes (up − down) → 0-5 star count. Net negative renders as 0.
 */
export const STAR_THRESHOLDS: ReadonlyArray<{ minNet: number; stars: number }> =
  [
    { minNet: 21, stars: 5 },
    { minNet: 11, stars: 4 },
    { minNet: 6, stars: 3 },
    { minNet: 3, stars: 2 },
    { minNet: 1, stars: 1 },
  ];

export function starRating(up: number, down: number): number {
  const net = up - down;
  if (net < 1) return 0;
  for (const { minNet, stars } of STAR_THRESHOLDS) {
    if (net >= minNet) return stars;
  }
  return 0;
}

// Display ceiling so a single release never advertises a runaway count.
export const DISPLAY_CAP = 99;
export function displayCount(n: number): string {
  return n > DISPLAY_CAP ? `${DISPLAY_CAP}+` : String(n);
}
