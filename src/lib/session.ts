import { createHmac, timingSafeEqual } from "crypto";

function getSessionSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD env var is required");
  return secret;
}

const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

type SessionRole = "admin" | "visitor";

export function createSessionToken(role: SessionRole = "visitor"): string {
  const payload = JSON.stringify({
    role,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;

    const payload = decoded.slice(0, lastColon);
    const signature = decoded.slice(lastColon + 1);

    const expectedSig = createHmac("sha256", getSessionSecret())
      .update(payload)
      .digest("hex");

    if (signature.length !== expectedSig.length) return false;

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export function getSessionRole(token: string): SessionRole | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;
    const payload = decoded.slice(0, lastColon);
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    if (data.role === "admin" || data.role === "visitor") return data.role;
    return null;
  } catch {
    return null;
  }
}

export { SESSION_MAX_AGE };
