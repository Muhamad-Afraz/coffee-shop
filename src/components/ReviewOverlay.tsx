"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  text: string;
  name: string;
  tag: string;
  rating: number;
  createdAt: string;
}

export function ReviewOverlay() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const formSchema = z.object({
    name: z.string().min(1, t("testimonials.formRequired")).max(100),
    text: z.string().min(1, t("testimonials.formRequired")).max(1000),
    rating: z.number().int().min(1, t("testimonials.formRequired")).max(5),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", text: "", rating: 0 },
  });

  const currentRating = watch("rating");

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
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]);
        reset();
        toast.success(t("testimonials.formSuccess"));
      } else {
        const err = await res.json();
        if (err.error === "rejected") {
          toast.error(t("testimonials.formRejected"));
        } else {
          toast.error(t("testimonials.formError"));
        }
      }
    } catch {
      toast.error(t("testimonials.formError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle className={`font-display text-3xl ${isAr ? "font-arabic" : ""}`}>
          {t("testimonials.overlayTitle")}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {t("testimonials.rating")}
        </DialogDescription>
      </DialogHeader>

      <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Review form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-6">
          <p className={`font-display text-2xl ${isAr ? "font-arabic" : ""}`}>
            {t("testimonials.writeReview")}
          </p>

          {/* Star rating */}
          <div className="space-y-2">
            <Label className={`text-sm ${isAr ? "font-arabic" : ""}`}>{t("testimonials.ratingLabel")}</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setValue("rating", starValue, { shouldValidate: true })}
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        starValue <= (hoveredStar || currentRating)
                          ? "fill-gold text-gold"
                          : "fill-none text-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {errors.rating && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="review-name" className={`text-sm ${isAr ? "font-arabic" : ""}`}>
              {t("testimonials.name")}
            </Label>
            <Input
              id="review-name"
              placeholder={t("testimonials.namePlaceholder")}
              className={`rounded-none border-0 border-b border-input bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${isAr ? "font-arabic text-start" : ""}`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Review text */}
          <div className="space-y-2">
            <Label htmlFor="review-text" className={`text-sm ${isAr ? "font-arabic" : ""}`}>
              {t("testimonials.review")}
            </Label>
            <Textarea
              id="review-text"
              placeholder={t("testimonials.reviewPlaceholder")}
              rows={4}
              className={`rounded-none border-0 border-b border-input bg-transparent px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ${isAr ? "font-arabic text-start" : ""}`}
              {...register("text")}
            />
            {errors.text && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.text.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-2 rounded-full"
          >
            {submitting ? "..." : t("testimonials.formSubmit")}
          </Button>
        </form>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Existing reviews */}
        <div className="space-y-4 pb-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">{t("testimonials.loading")}</div>
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">{t("testimonials.noReviews")}</div>
          ) : (
            [...reviews].reverse().map((review) => (
              <figure
                key={review.id}
                className="border border-border bg-card p-5 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
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
                </div>
                <blockquote className="font-serif text-base leading-snug text-foreground/90 text-start">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-serif italic">{review.name}</span>
                  <span className="tracking-eyebrow text-muted-foreground text-xs">{review.tag}</span>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </DialogContent>
  );
}
