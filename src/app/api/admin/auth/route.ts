import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, getSessionRole, verifySessionToken, SESSION_MAX_AGE } from "@/lib/session";
import { clearVisitorStore } from "@/lib/temp-store";
import { getSessionFingerprint, timingSafeStringCompare } from "@/lib/session";
import { validateCsrfToken } from "@/lib/csrf";

async function setSessionCookie(role: "admin" | "visitor") {
  const token = createSessionToken(role);
  const cookieStore = await cookies();
  cookieStore.set("admin-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function POST(request: Request) {
  try {
    let password: string | undefined;
    try {
      const body = await request.json();
      password = body?.password;
    } catch {
      // Missing/empty body → treated as a passwordless visitor login
    }

    if (!password) {
      await setSessionCookie("visitor");
      return NextResponse.json({ success: true, role: "visitor" });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (!timingSafeStringCompare(password, adminPassword)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setSessionCookie("admin");
    return NextResponse.json({ success: true, role: "admin" });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;

  if (session && verifySessionToken(session)) {
    const role = getSessionRole(session);
    if (role === "visitor") {
      const fingerprint = getSessionFingerprint(session);
      clearVisitorStore(fingerprint);
    }
  }

  cookieStore.delete("admin-session");
  return NextResponse.json({ success: true });
}
