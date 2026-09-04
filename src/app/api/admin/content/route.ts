import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionRole } from "@/lib/session";
import { getDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getTempContent, setTempContent } from "@/lib/temp-store";

const CONTENT_FILE = path.join(process.cwd(), "data", "site-content.json");
const COLLECTION = "settings";
const DOC_ID = "site-content";

async function ensureFile() {
  if (!existsSync(CONTENT_FILE)) {
    await mkdir(path.dirname(CONTENT_FILE), { recursive: true });
    await writeFile(CONTENT_FILE, "{}", "utf-8");
  }
}

async function getPermanentContent(): Promise<unknown> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (doc.exists) {
      return doc.data();
    }
  }

  await ensureFile();
  const raw = await readFile(CONTENT_FILE, "utf-8");
  return JSON.parse(raw);
}

async function savePermanentContent(content: unknown): Promise<void> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    await db.collection(COLLECTION).doc(DOC_ID).set(content as object, { merge: true });
    return;
  }

  await ensureFile();
  await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
}

async function getSessionRoleFromCookies(): Promise<"admin" | "visitor" | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session || !verifySessionToken(session)) return null;
  return getSessionRole(session);
}

export async function GET() {
  try {
    const role = await getSessionRoleFromCookies();

    // A visitor sees their temporary content (falling back to permanent if empty)
    if (role === "visitor") {
      const temp = getTempContent() as Record<string, unknown> | null;
      if (temp) {
        return NextResponse.json(temp);
      }
    }

    const permanent = await getPermanentContent();
    return NextResponse.json(permanent);
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const role = await getSessionRoleFromCookies();
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;

    // Visitors only write to the temporary store; never to permanent data.
    if (role === "visitor") {
      setTempContent(body);
      return NextResponse.json({ success: true, temp: true });
    }

    // Admin writes permanently.
    await savePermanentContent(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
