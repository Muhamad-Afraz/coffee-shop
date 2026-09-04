import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionRole, verifySessionToken } from "@/lib/session";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin-session")?.value;

    if (!session || !verifySessionToken(session)) {
      return NextResponse.json({ authenticated: false, role: null });
    }

    await generateCsrfToken();
    const role = getSessionRole(session);
    return NextResponse.json({ authenticated: true, role });
  } catch {
    return NextResponse.json({ authenticated: false, role: null });
  }
}
