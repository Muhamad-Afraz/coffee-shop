import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionRole, getSessionFingerprint } from "@/lib/session";
import { getDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  getTempReviews,
  addTempReview,
  removeTempReview,
} from "@/lib/temp-store";
import { validateCsrfToken } from "@/lib/csrf";

const REVIEWS_FILE = path.join(process.cwd(), "data", "reviews.json");
const COLLECTION = "reviews";

const BRAINROT_TERMS = [
  "skibidi", "gyat", "gyatt", "rizz", "ohio", "fanum", "fanum tax",
  "sigma", "mewing", "looksmax", "looksmaxing", "grizz",
  "mog", "mogging", "mogger", "chad", "jelq", "looksmaxxer",
  "sus", "sussy", "bussin", "delulu", "ick", "npc",
  "slay", "tea", "ate", "no cap", "fr fr", "bet",
  "glizzy", "w rizz", "l rizz", "only in ohio",
  "skibidi toilet", "skibidi dop dop", "dop dop yes yes",
  "alpha male", "red pill", "black pill", "white pill",
  "brain rot", "brainrot", "touch grass",
];

const NUMERIC_MEMES = ["69", "67", "420", "666", "80085", "1337", "42069", "0000", "000", "12345"];

const WORD_TO_DIGIT: Record<string, string> = {
  zero: "0", oh: "0", o: "0",
  one: "1", won: "1", wonn: "1",
  two: "2", too: "2", to: "2",
  three: "3",
  four: "4", for: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8", ate: "8",
  nine: "9",
  ten: "10", tin: "10",
};

function wordsToNumbers(str: string): string {
  return str.replace(/\b[a-z]+\b/g, (word) => WORD_TO_DIGIT[word] ?? word);
}

function checkBrainrot(text: string, name: string): { flagged: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  const lowerName = name.toLowerCase();

  for (const term of BRAINROT_TERMS) {
    if (lowerName.includes(term)) {
      return { flagged: true, reason: "Name contains inappropriate content" };
    }
    if (lowerText.includes(term)) {
      return { flagged: true, reason: "Review contains inappropriate content" };
    }
  }

  const nameClean = lowerName.replace(/[\s\-_.]/g, "");
  const nameAsNumbers = wordsToNumbers(nameClean).replace(/[^0-9]/g, "");
  if (NUMERIC_MEMES.some((m) => nameClean === m || nameAsNumbers === m)) {
    return { flagged: true, reason: "Name is not valid" };
  }

  const textClean = lowerText.replace(/[\s\-_.]/g, "");
  const textAsNumbers = wordsToNumbers(textClean).replace(/[^0-9]/g, "");
  if (NUMERIC_MEMES.some((m) => textClean === m || textAsNumbers === m)) {
    return { flagged: true, reason: "Review is not valid" };
  }

  return { flagged: false };
}

const reviewSchema = z.object({
  text: z.string().min(1, "Review text is required").max(1000),
  name: z.string().min(1, "Name is required").max(100),
  rating: z.number().int().min(1).max(5),
});

async function ensureFile() {
  if (!existsSync(REVIEWS_FILE)) {
    await mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
    await writeFile(REVIEWS_FILE, "[]", "utf-8");
  }
}

async function moderateContent(text: string, name: string): Promise<{ flagged: boolean; reason?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { flagged: false };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a content moderation classifier. Analyze the following user review text AND name for inappropriate content. Check for: harassment, hate speech, sexual content, self-harm references, violence, spam, commercial advertising, profanity, slurs, offensive language, brainrot internet slang (e.g. skibidi, gyat, rizz, ohio, fanum tax, sigma, alpha, beta), numeric meme references (e.g. 69, 67, 420 used as jokes or names), and troll or joke reviews with no genuine review content.

The name is: "${name}"
The review text is: "${text}"

Respond with ONLY a JSON object, no other text:
- If the content is inappropriate: {"flagged": true, "reason": "<brief reason>"}
- If the content is appropriate: {"flagged": false}`,
          },
          {
            role: "user",
            content: `Name: ${name}\nReview: ${text}`,
          },
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      return { flagged: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { flagged: false };
    }

    const parsed = JSON.parse(content);
    return {
      flagged: !!parsed.flagged,
      reason: parsed.reason || undefined,
    };
  } catch {
    return { flagged: false };
  }
}

async function getPermanentReviews(): Promise<unknown[]> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .get();
    const reviews: unknown[] = [];
    snapshot.forEach((doc) => {
      reviews.push(doc.data());
    });
    return reviews;
  }

  await ensureFile();
  const raw = await readFile(REVIEWS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function getSessionInfoFromCookies(): Promise<{ role: "admin" | "visitor" | null; fingerprint: string | null }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session || !verifySessionToken(session)) return { role: null, fingerprint: null };
  return { role: getSessionRole(session), fingerprint: getSessionFingerprint(session) };
}

async function addPermanentReview(review: { id: string; text: string; name: string; tag: string; rating: number; createdAt: string }): Promise<void> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    await db.collection(COLLECTION).doc(review.id).set(review);
    return;
  }

  await ensureFile();
  const reviews = await getPermanentReviews();
  reviews.push(review);
  await writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
}

async function deletePermanentReview(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return false;
    await docRef.delete();
    return true;
  }

  await ensureFile();
  const reviews = await getPermanentReviews();
  const filtered = reviews.filter((r) => (r as { id: string }).id !== id);
  if (filtered.length === reviews.length) return false;
  await writeFile(REVIEWS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function GET() {
  try {
    const { role, fingerprint } = await getSessionInfoFromCookies();

    if (role === "visitor" && fingerprint) {
      const temp = getTempReviews(fingerprint);
      if (temp.length > 0) return NextResponse.json(temp);
    }

    const reviews = await getPermanentReviews();
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Failed to read reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  try {
    const { role, fingerprint } = await getSessionInfoFromCookies();
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const brainrot = checkBrainrot(parsed.data.text, parsed.data.name);
    if (brainrot.flagged) {
      return NextResponse.json(
        { error: "rejected", reason: brainrot.reason },
        { status: 400 },
      );
    }

    const moderation = await moderateContent(parsed.data.text, parsed.data.name);
    if (moderation.flagged) {
      return NextResponse.json(
        { error: "rejected", reason: moderation.reason },
        { status: 400 },
      );
    }

    const newReview = {
      id: randomUUID(),
      text: parsed.data.text,
      name: parsed.data.name,
      tag: "Visitor",
      rating: parsed.data.rating,
      createdAt: new Date().toISOString(),
    };

    if (role === "visitor" && fingerprint) {
      addTempReview(fingerprint, newReview);
      return NextResponse.json(newReview, { status: 201 });
    }

    await addPermanentReview(newReview);

    return NextResponse.json(newReview, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  try {
    const { role, fingerprint } = await getSessionInfoFromCookies();
    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    if (role === "visitor" && fingerprint) {
      const deleted = removeTempReview(fingerprint, id);
      if (!deleted) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const deleted = await deletePermanentReview(id);

    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
