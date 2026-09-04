import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionRole, verifySessionToken } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;

  if (!session || !verifySessionToken(session)) {
    return NextResponse.json({ authenticated: false, role: null });
  }

  const role = getSessionRole(session);
  return NextResponse.json({ authenticated: true, role });
}
