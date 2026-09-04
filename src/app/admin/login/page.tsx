"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/dashboard";
  const { passwordLogin, visitorLogin } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    router.push(from);
    router.refresh();
  }

  async function handleVisitor(e: React.MouseEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await visitorLogin();
      await go();
    } catch {
      setError("Visitor access failed");
      setLoading(false);
    }
  }

  async function handleAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await passwordLogin(password);
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <p className="font-display text-4xl">
            Coffee
            <span className="italic text-muted-foreground"> House</span>
          </p>
          <p className="mt-4 tracking-eyebrow text-muted-foreground">Admin &amp; Visitor Access</p>
        </div>

        {/* Visitor access */}
        <Button
          type="button"
          onClick={handleVisitor}
          disabled={loading}
          className="w-full rounded-full bg-muted-foreground hover:bg-foreground"
        >
          {loading ? "..." : "Enter as Visitor (temporary)"}
        </Button>
        <p className="text-xs text-center text-muted-foreground -mt-4">
          Preview and test edits — changes are temporary and reset automatically.
        </p>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Admin password */}
        <form onSubmit={handleAdmin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="rounded-none border-0 border-b border-input bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !password}
            className="btn-primary w-full rounded-full"
          >
            {loading ? "..." : "Sign in as Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
