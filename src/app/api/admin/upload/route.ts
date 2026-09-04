import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionRole, getSessionFingerprint } from "@/lib/session";
import { getStorageClient, isFirebaseConfigured } from "@/lib/firebase-admin";
import { validateCsrfToken } from "@/lib/csrf";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/avif",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VISITOR_MAX_SIZE = 2 * 1024 * 1024; // 2MB for visitors

const ALLOWED_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "bmp",
  "avif",
  "heic",
  "heif",
];

async function getRole(): Promise<{ role: "admin" | "visitor" | null; fingerprint: string | null }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session || !verifySessionToken(session)) return { role: null, fingerprint: null };
  return { role: getSessionRole(session), fingerprint: getSessionFingerprint(session) };
}

async function uploadToCloud(bytes: Buffer, filename: string, contentType: string): Promise<string> {
  const storage = getStorageClient();
  const bucket = storage.bucket();
  const file = bucket.file(filename);

  await file.save(bytes, {
    contentType,
    public: true,
    metadata: {
      contentType,
    },
  });

  // Make public
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function POST(request: Request) {
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { role, fingerprint } = await getRole();
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: jpg, png, webp, gif, svg" },
        { status: 400 }
      );
    }

    if (ext && !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file extension" },
        { status: 400 }
      );
    }

    const effectiveMax = role === "visitor" ? VISITOR_MAX_SIZE : MAX_SIZE;
    if (file.size > effectiveMax) {
      const limit = role === "visitor" ? "2MB" : "10MB";
      return NextResponse.json(
        { error: `File too large. Max ${limit}` },
        { status: 400 }
      );
    }

    const safeExt = ALLOWED_EXTS.includes(ext) ? ext : "png";
    const contentType = file.type || `image/${safeExt}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (role === "visitor") {
      const dataUrl = `data:${contentType};base64,${bytes.toString("base64")}`;
      return NextResponse.json({ path: dataUrl, url: dataUrl, temp: true });
    }

    const filename = `${randomUUID()}.${safeExt}`;

    // Admin: if Firebase is configured, upload to Storage (permanent).
    if (isFirebaseConfigured()) {
      const url = await uploadToCloud(bytes, filename, contentType);
      return NextResponse.json({ path: url, url });
    }

    // Fallback: write to local filesystem (non-persistent on serverless).
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, bytes);

    return NextResponse.json({ path: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
