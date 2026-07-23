import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

const CONTENT_FILE = path.join(process.cwd(), "data", "site-content.json");

async function ensureFile() {
  if (!existsSync(CONTENT_FILE)) {
    await mkdir(path.dirname(CONTENT_FILE), { recursive: true });
    await writeFile(CONTENT_FILE, "{}", "utf-8");
  }
}

async function readContent() {
  await ensureFile();
  const raw = await readFile(CONTENT_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeContent(content: unknown) {
  await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (!session) return false;
  return verifySessionToken(session);
}

export async function GET() {
  try {
    const content = await readContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await writeContent(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
