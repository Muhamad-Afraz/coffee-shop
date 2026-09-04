import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/session";
import { clearTempStore } from "@/lib/temp-store";

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

async function clearSession() {
  clearTempStore();
  const cookieStore = await cookies();
  cookieStore.delete("admin-session");
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
      // Passwordless visitor login
      await setSessionCookie("visitor");
      return NextResponse.json({ success: true, role: "visitor" });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setSessionCookie("admin");
    return NextResponse.json({ success: true, role: "admin" });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
