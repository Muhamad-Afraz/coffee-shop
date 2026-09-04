import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

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

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session) return false;
  return verifySessionToken(session);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
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

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const safeExt = ALLOWED_EXTS.includes(ext) ? ext : "png";
    const filename = `${randomUUID()}.${safeExt}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return NextResponse.json({ path: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
