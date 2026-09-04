import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionRole } from "@/lib/session";
import { getStorageClient, isFirebaseConfigured } from "@/lib/firebase-admin";

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

async function getRole(): Promise<"admin" | "visitor" | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session || !verifySessionToken(session)) return null;
  return getSessionRole(session);
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
  const role = await getRole();
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

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 10MB" },
        { status: 400 }
      );
    }

    const safeExt = ALLOWED_EXTS.includes(ext) ? ext : "png";
    const contentType = file.type || `image/${safeExt}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    // Visitors: keep the image temporary as an inline data URL. It never
    // touches Firebase or the filesystem and dies on server restart.
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
