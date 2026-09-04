/**
 * Temporary in-memory store for VISITOR (non-permanent) edits.
 *
 * Lives only in the server's memory. Clears automatically whenever the
 * serverless function recycles, the process restarts, or a redeploy happens.
 * Visitor edits NEVER touch the permanent layer (Firebase / JSON files),
 * so the live site is never affected by testing.
 */

let content: unknown | null = null;
let reviews: unknown[] | null = null;

export function getTempContent(): unknown | null {
  return content;
}

export function setTempContent(value: unknown): void {
  content = value;
}

export function getTempReviews(): unknown[] | null {
  return reviews;
}

export function addTempReview(review: unknown): void {
  if (!reviews) reviews = [];
  reviews.push(review);
}

export function removeTempReview(id: string): boolean {
  if (!reviews) return false;
  const before = reviews.length;
  reviews = reviews.filter((r) => (r as { id: string }).id !== id);
  return reviews.length !== before;
}

export function clearTempStore(): void {
  content = null;
  reviews = null;
}
