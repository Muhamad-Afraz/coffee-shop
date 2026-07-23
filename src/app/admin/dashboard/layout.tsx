"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", exact: true },
  { href: "/admin/dashboard/menu", label: "Menu" },
  { href: "/admin/dashboard/hours", label: "Hours & Visit" },
  { href: "/admin/dashboard/images", label: "Images" },
  { href: "/admin/dashboard/reviews", label: "Reviews" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="bg-background flex">
      <aside className="w-60 shrink-0 border-r border-border bg-card p-6 flex flex-col sticky top-0 h-screen">
        <Link href="/admin/dashboard" className="font-display text-xl">
          F<span className="italic">ā</span>ir
          <span className="italic text-muted-foreground"> enough</span>
        </Link>
        <p className="mt-1 text-xs tracking-eyebrow text-muted-foreground">Admin</p>

        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-auto"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
