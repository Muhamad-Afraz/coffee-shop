"use client";

import Link from "next/link";
import { Coffee, Clock, Image, Star } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

const cards = [
  { href: "/admin/dashboard/menu", label: "Menu", desc: "Coffee & dessert items", icon: Coffee },
  { href: "/admin/dashboard/hours", label: "Hours & Visit", desc: "Business hours, address, parking", icon: Clock },
  { href: "/admin/dashboard/images", label: "Images", desc: "Upload & manage photos", icon: Image },
  { href: "/admin/dashboard/reviews", label: "Reviews", desc: "Moderate customer reviews", icon: Star },
];

export default function DashboardPage() {
  const { content } = useSiteContent();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your website content</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border border-border p-6 hover:bg-muted transition-colors"
          >
            <card.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            <h2 className="mt-3 font-display text-xl">{card.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground">Coffee Items</p>
          <p className="mt-1 font-display text-2xl">{content.coffeeItems.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground">Dessert Items</p>
          <p className="mt-1 font-display text-2xl">{content.dessertItems.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground">Gallery Images</p>
          <p className="mt-1 font-display text-2xl">{content.images.gallery.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground">Hours Rows</p>
          <p className="mt-1 font-display text-2xl">{content.hours.length}</p>
        </div>
      </div>
    </div>
  );
}
