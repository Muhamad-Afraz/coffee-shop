"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  text: string;
  name: string;
  tag: string;
  rating: number;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      // error fetching reviews
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE", credentials: "same-origin" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete review. Please try again.");
      }
    } catch {
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage customer reviews and testimonials.</p>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No reviews yet</div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-border bg-card p-6 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-gold text-gold"
                            : "fill-none text-muted-foreground/40"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <blockquote className="font-serif text-base leading-snug text-foreground/90 text-start">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="font-serif italic">{review.name}</span>
                    <span className="tracking-eyebrow text-muted-foreground text-xs">
                      {review.tag}
                    </span>
                  </figcaption>
                </div>
                <Button
                  onClick={() => handleDelete(review.id)}
                  disabled={deleting === review.id}
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
