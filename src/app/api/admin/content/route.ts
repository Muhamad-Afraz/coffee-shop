import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionRole, getSessionFingerprint } from "@/lib/session";
import { getDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getTempContent, setTempContent } from "@/lib/temp-store";
import { validateCsrfToken } from "@/lib/csrf";

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

async function getSessionInfoFromCookies(): Promise<{ role: "admin" | "visitor" | null; fingerprint: string | null }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session || !verifySessionToken(session)) return { role: null, fingerprint: null };
  return { role: getSessionRole(session), fingerprint: getSessionFingerprint(session) };
}

export async function GET() {
  try {
    const { role, fingerprint } = await getSessionInfoFromCookies();

    if (role === "visitor" && fingerprint) {
      const temp = getTempContent(fingerprint) as Record<string, unknown> | null;
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
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { role, fingerprint } = await getSessionInfoFromCookies();
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;

    if (role === "visitor" && fingerprint) {
      setTempContent(fingerprint, body);
      return NextResponse.json({ success: true, temp: true });
    }

    await savePermanentContent(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
