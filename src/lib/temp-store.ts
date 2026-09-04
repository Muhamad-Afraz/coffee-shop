/**
 * Temporary in-memory store for VISITOR (non-permanent) edits.
 *
 * Data is keyed by session fingerprint so each visitor gets isolated storage.
 * Clears automatically when the server restarts. Visitor edits NEVER touch
 * the permanent layer (Firebase / JSON files).
 */

interface VisitorStore {
  content: unknown | null;
  reviews: unknown[];
}

const stores = new Map<string, VisitorStore>();

function getOrCreate(key: string): VisitorStore {
  let store = stores.get(key);
  if (!store) {
    store = { content: null, reviews: [] };
    stores.set(key, store);
  }
  return store;
}

export function getTempContent(key: string): unknown | null {
  return getOrCreate(key).content;
}

export function setTempContent(key: string, value: unknown): void {
  getOrCreate(key).content = value;
}

export function getTempReviews(key: string): unknown[] {
  return getOrCreate(key).reviews;
}

export function addTempReview(key: string, review: unknown): void {
  getOrCreate(key).reviews.push(review);
}

export function removeTempReview(key: string, id: string): boolean {
  const store = getOrCreate(key);
  const before = store.reviews.length;
  store.reviews = store.reviews.filter((r) => (r as { id: string }).id !== id);
  return store.reviews.length !== before;
}

export function clearVisitorStore(key: string): void {
  stores.delete(key);
}
