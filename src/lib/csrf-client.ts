"use client";

export function getCsrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  return token ? { "x-csrf-token": token } : {};
}
