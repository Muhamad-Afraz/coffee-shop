/**
 * One-time seed/migration script.
 *
 * Migrates the existing local file-based data (data/site-content.json,
 * data/reviews.json and public/uploads/*) into Firebase Firestore and
 * Firebase Storage so admin changes persist permanently on serverless hosts.
 *
 * Prereqs:
 *  - FIREBASE_SERVICE_ACCOUNT env var (the raw JSON of a Firebase service
 *    account for the project "my-coffee-project") is set in .env / .env.local
 *
 * Run:
 *  - Node:  npx tsx scripts/seed.ts
 *  - Bun:   bun run scripts/seed.ts
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-coffee-project";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    "FIREBASE_SERVICE_ACCOUNT env var is not set. Add the full service-account JSON to .env.local first."
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${projectId}.firebasestorage.app`,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const CONTENT_FILE = path.join(__dirname, "..", "data", "site-content.json");
const REVIEWS_FILE = path.join(__dirname, "..", "data", "reviews.json");

async function uploadFile(localPath: string, destName: string, contentType: string): Promise<string> {
  const bytes = await readFile(path.join(__dirname, "..", "public", localPath));
  const file = bucket.file(destName);
  await file.save(bytes, { contentType, public: true });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${destName}`;
}

function contentTypeFor(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    avif: "image/avif",
    bmp: "image/bmp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext] || "application/octet-stream";
}

async function migrateImagePath(src: string, seen: Map<string, string>): Promise<string> {
  if (!src.startsWith("/uploads/")) return src;

  if (seen.has(src)) return seen.get(src)!;

  const filename = src.replace("/uploads/", "");
  const url = await uploadFile(`uploads/${filename}`, `uploads/${filename}`, contentTypeFor(filename));
  seen.set(src, url);
  console.log(`Uploaded ${src} -> ${url}`);
  return url;
}

async function main() {
  console.log("Starting migration...\n");

  const seen = new Map<string, string>();

  // --- Migrate site content ---
  console.log("Reading site-content.json...");
  const content = JSON.parse(await readFile(CONTENT_FILE, "utf-8"));

  content.images.hero = await migrateImagePath(content.images.hero, seen);
  content.images.philosophyValues = await Promise.all(
    content.images.philosophyValues.map((p: string) => migrateImagePath(p, seen))
  );
  content.images.coffee = await migrateImagePath(content.images.coffee, seen);
  content.images.desserts = await migrateImagePath(content.images.desserts, seen);
  content.images.signatureCup = await migrateImagePath(content.images.signatureCup, seen);
  content.images.signatureCups = await migrateImagePath(content.images.signatureCups, seen);
  content.images.gallery = await Promise.all(
    content.images.gallery.map((g: string) => migrateImagePath(g, seen))
  );
  content.images.visit = await Promise.all(
    content.images.visit.map((v: string) => migrateImagePath(v, seen))
  );

  await db.collection("settings").doc("site-content").set(content, { merge: true });
  console.log("Site content saved to Firestore.\n");

  // --- Migrate reviews ---
  console.log("Reading reviews.json...");
  const reviews = JSON.parse(await readFile(REVIEWS_FILE, "utf-8"));
  const batch = db.batch();
  for (const review of reviews) {
    batch.set(db.collection("reviews").doc(review.id), review);
  }
  await batch.commit();
  console.log(`Saved ${reviews.length} reviews to Firestore.\n`);

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
