import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/session";

async function verifyGoogleIdToken(idToken: string): Promise<{ email: string; name: string; picture: string } | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const expectedAud = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    if (expectedAud && data.aud !== expectedAud) return null;
    if (data.iss !== "https://accounts.google.com" && data.iss !== "accounts.google.com") return null;
    if (Number(data.exp) * 1000 < Date.now()) return null;

    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "ID token required" }, { status: 400 });
    }

    const googleUser = await verifyGoogleIdToken(idToken);
    if (!googleUser) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (allowedEmails.length > 0 && !allowedEmails.includes(googleUser.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const token = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true, user: { email: googleUser.email, name: googleUser.name } });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
