import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET: string = process.env.ADMIN_PASSWORD ?? (() => {
  throw new Error("ADMIN_PASSWORD env var is required");
})();

const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export function createSessionToken(): string {
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const signature = createHmac("sha256", SESSION_SECRET)
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

    const expectedSig = createHmac("sha256", SESSION_SECRET)
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

export { SESSION_MAX_AGE };
