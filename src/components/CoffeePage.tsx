import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

import { useI18n } from "@/lib/i18n";
import { useSiteContent } from "@/lib/site-content";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ReviewOverlay } from "@/components/ReviewOverlay";

import storefront from "@/assets/coffee-storefront.jpg.asset.json";
import interior from "@/assets/coffee-interior.jpg.asset.json";
import espresso from "@/assets/coffee-espresso.jpg.asset.json";
import cupsGroup from "@/assets/coffee-cups-group.jpg.asset.json";
import storefrontNight from "@/assets/coffee-storefront-night.jpg.asset.json";
import nightWindow from "@/assets/coffee-night-window.jpg.asset.json";


/* ---------- small utilities ---------- */

function scrollDuration(href: string): number {
  const el = document.querySelector(href);
  if (!el) return 1.2;
  const distance = Math.abs(el.getBoundingClientRect().top);
  const maxDist = document.body.scrollHeight - window.innerHeight;
  const ratio = Math.min(distance / maxDist, 1);
  return 2.0 - ratio * 1.0;
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/* ---------- page ---------- */

export function CoffeePage() {
  const { transitioning } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const contentVisible = transitioning === "idle" || transitioning === "fading-in";
  const overlayVisible = transitioning !== "idle";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div
        className="relative z-[1] transition-all duration-[450ms] ease-out will-change-transform"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.99)",
        }}
      >
        <Hero />
        <Marquee />
        <Philosophy />
        <Coffee />
        <Desserts />
        <Signature />
        <Testimonials />
        <Gallery />
        <Stats />
        <Visit />
        <Footer />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[100] bg-espresso flex items-center justify-center transition-opacity duration-300 ease-out"
        style={{ opacity: overlayVisible ? 1 : 0 }}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div
              className="absolute inset-0 rounded-full border border-gold/15"
              style={{ animation: overlayVisible ? "spin 3s linear infinite" : "none" }}
            />
            <svg className="absolute -top-8 w-16 h-10 overflow-visible" viewBox="0 0 64 40" fill="none">
              <path d="M22 36 Q20 30 24 26 Q28 22 26 16" stroke="#C8A97E" strokeWidth="1" strokeLinecap="round"
                style={{ animation: overlayVisible ? "steam-rise 2.5s ease-out infinite 0s" : "none" }}
              />
              <path d="M32 38 Q30 30 34 24 Q38 18 36 12" stroke="#C8A97E" strokeWidth="1.2" strokeLinecap="round"
                style={{ animation: overlayVisible ? "steam-rise 2.5s ease-out infinite 0.4s" : "none" }}
              />
              <path d="M42 36 Q40 28 44 22 Q48 16 46 10" stroke="#C8A97E" strokeWidth="0.8" strokeLinecap="round"
                style={{ animation: overlayVisible ? "steam-rise 2.5s ease-out infinite 0.8s" : "none" }}
              />
              <path d="M16 34 Q14 26 18 22 Q22 18 20 12" stroke="#C8A97E" strokeWidth="0.7" strokeLinecap="round"
                style={{ animation: overlayVisible ? "steam-rise 2.5s ease-out infinite 1.2s" : "none" }}
              />
              <path d="M48 34 Q46 26 50 22 Q54 18 52 12" stroke="#C8A97E" strokeWidth="0.9" strokeLinecap="round"
                style={{ animation: overlayVisible ? "steam-rise 2.5s ease-out infinite 1.6s" : "none" }}
              />
            </svg>
            <svg viewBox="0 0 48 48" width={44} height={44} style={{ animation: overlayVisible ? "bean-pulse 2s ease-in-out infinite" : "none" }}>
              <path d="M24 4C14 4 6 12 6 22c0 12 10 22 18 22s18-10 18-22C42 12 34 4 24 4z" fill="#5C3A28"/>
              <path d="M24 6C16 6 9 13 9 22c0 10 8 19 15 19s15-9 15-19C39 13 32 6 24 6z" fill="#6B442A"/>
              <path d="M24 6c-2 8-2 18 0 26" stroke="#4A2C1A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <ellipse cx="20" cy="14" rx="4" ry="2.5" fill="#C8A97E" opacity="0.15" transform="rotate(-20 20 14)"/>
            </svg>
          </div>
          <span
            className="font-display text-2xl text-ivory tracking-tight"
            style={{
              opacity: overlayVisible ? 1 : 0,
              transform: overlayVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease-out 0.25s, transform 0.5s ease-out 0.25s"
            }}
          >
            Coffee
            <span className="italic text-ivory/60"> House</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- nav ---------- */

function Nav({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const scrolled = useScrolled(30);
  const { t, lang } = useI18n();
  const links = t("nav.links") as [string, string][];
  const isAr = lang === "ar";
  const lenis = useLenis();

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-ivory/75 backdrop-blur-xl border-b border-border/60 text-foreground"
          : "bg-transparent text-white",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <div className="font-display text-2xl leading-none tracking-tight select-none">
          Coffee
          <span className="ms-1 align-super text-[0.55rem] tracking-eyebrow font-sans text-muted-foreground">
            House
          </span>
        </div>
        <nav className="hidden items-center gap-10 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => { e.preventDefault(); lenis?.scrollTo(href, { duration: scrollDuration(href) }); }}
              className={`group relative text-[0.72rem] tracking-eyebrow transition-colors ${scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"}`}
            >
              {label}
              <span className={`absolute -bottom-1 start-0 h-px w-0 transition-all duration-500 group-hover:w-full ${scrolled ? "bg-foreground" : "bg-white"}`} />
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LangSwitcher light={!scrolled} onSwitch={() => setMobileOpen(false)} />
          <a href="#visit" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#visit", { duration: scrollDuration("#visit") }); }} className="btn-primary">{t("nav.reserve")}</a>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center md:hidden"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-px w-6 transition-transform ${scrolled ? "bg-foreground" : "bg-white"} ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 transition-transform ${scrolled ? "bg-foreground" : "bg-white"} ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-border/60 bg-ivory/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-6">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); lenis?.scrollTo(href, { duration: scrollDuration(href) }); setMobileOpen(false); }}
                className={`py-2 text-2xl ${isAr ? "font-arabic" : "font-serif"}`}
              >
                {label}
              </a>
            ))}
            <div className="mt-4 flex items-center gap-4">
              <LangSwitcher onSwitch={() => setMobileOpen(false)} />
            </div>
            <a href="#visit" className="btn-primary mt-4 self-start" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#visit", { duration: scrollDuration("#visit") }); setMobileOpen(false); }}>
              {t("nav.reserve")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  const { t, lang } = useI18n();
  const { content } = useSiteContent();
  const isAr = lang === "ar";
  const lenis = useLenis();

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-espresso">
      <div className="absolute inset-0">
        <img
          src={content.images.hero}
          alt="Coffee House, evening"
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-espresso/30 to-espresso/85" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-6 pb-16 pt-32 md:px-10 md:pt-40">
        <div className="flex flex-1 flex-col justify-end items-start">
          <p className="reveal tracking-eyebrow text-ivory/70">
            {t("hero.eyebrow")}
          </p>
          <h1 className="reveal reveal-delay-1 mt-6 font-display text-[clamp(3.5rem,11vw,10rem)] text-ivory">
            Coffee
            <span className="italic text-ivory/60"> House</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-xl font-serif text-xl leading-snug text-ivory/85 md:text-2xl text-start">
            {t("hero.subtitle")}
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-3">
            <a href="#visit" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#visit", { duration: scrollDuration("#visit") }); }} className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              {t("hero.ctaReserve")}
            </a>
            <a href="#coffee" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#coffee", { duration: scrollDuration("#coffee") }); }} className="btn-ghost">{t("hero.ctaMenu")}</a>
          </div>

          <div className="mt-16 flex w-full items-end justify-between border-t border-ivory/15 pt-6 text-ivory/70">
            <div className="flex items-center gap-6 text-[0.7rem] tracking-eyebrow">
              <span>{t("hero.rating")}</span>
              <span className="hidden md:inline">{t("hero.hours")}</span>
            </div>
            <div className="scroll-cue flex flex-col items-center gap-2 text-[0.65rem] tracking-eyebrow">
              <span>{t("hero.scroll")}</span>
              <span className="block h-8 w-px bg-ivory/40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- marquee ---------- */

function Marquee() {
  const { t, dir } = useI18n();
  const words = t("marquee") as string[];
  const items = [...words, ...words];
  const isRtl = dir === "rtl";

  return (
    <section className="border-y border-border bg-cream py-4 overflow-hidden">
      <div
        className="marquee-track flex gap-8 whitespace-nowrap"
        style={{ animationDirection: isRtl ? "reverse" : "normal" }}
      >
        {items.map((w, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="font-sans text-[11px] md:text-xs uppercase tracking-[0.25em] text-espresso/60">{w}</span>
            <span className="text-gold/50 text-[8px]">◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- philosophy ---------- */

function Philosophy() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { t, lang } = useI18n();
  const { content } = useSiteContent();
  const isAr = lang === "ar";
  const values = t("philosophy.values") as [string, string][];

  return (
    <section id="philosophy" className="relative bg-background py-28 md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <p className="tracking-eyebrow text-muted-foreground">{t("philosophy.eyebrow")}</p>
          <h2 className="mt-6 font-display text-5xl md:text-[5.25rem] leading-[0.95] tracking-tight">
            {t("philosophy.line1")}<br />
            <span className="italic text-muted-foreground">{t("philosophy.line1Italic")}</span>
          </h2>
          <p className="mt-4 font-display text-5xl md:text-[5.25rem] leading-[0.95] tracking-tight">
            {t("philosophy.line2")}<br />
            <span className="italic">{t("philosophy.line2Italic")}</span>
          </p>
        </div>

        <div
          ref={ref}
          className={`md:col-span-7 md:col-start-6 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-serif text-2xl leading-snug text-foreground/85 md:text-[1.75rem] text-start">
            {t("philosophy.body")}
          </p>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {values.map(([title, desc], i) => (
              <div key={title} className="flex flex-col">
                <p className="tracking-eyebrow text-muted-foreground">— {title}</p>
                <p className="mt-3 font-serif text-lg leading-snug text-start">{desc}</p>
                <figure className="group mt-auto pt-6">
                  <div className="aspect-square overflow-hidden rounded-sm">
                    <img
                      src={content.images.philosophyValues[i] || ["/17.png", "/18.png", "/5.png"][i]}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                    />
                  </div>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- coffee ---------- */

function Coffee() {
  const { t } = useI18n();
  const { content } = useSiteContent();
  const coffees = (content.coffeeItems.length > 0 ? content.coffeeItems : (t("coffee.items") as Array<{
    name: string;
    note: string;
    price: string;
    body: string;
  }>));

  return (
    <section id="coffee" className="relative bg-cream py-20 md:py-28 grain">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="tracking-eyebrow text-muted-foreground">{t("coffee.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-[5.25rem]">
              {t("coffee.title")} <span className="italic">{t("coffee.titleItalic")}</span>
            </h2>
          </div>
          <p className="md:col-span-7 font-serif text-2xl md:text-3xl text-foreground/80 leading-snug text-start">
            {t("coffee.body").split("\n\n")[0]}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5 md:row-span-2">
            <figure className="group relative overflow-hidden">
              <img
                src={content.images.coffee}
                alt="Coffee House signature espresso"
                loading="lazy"
                className="aspect-[2/3] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              />
              <figcaption className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span className="tracking-eyebrow">{t("coffee.figureCaption")}</span>
                <span className="font-serif italic">{t("coffee.figureSub")}</span>
              </figcaption>
            </figure>
          </div>

          <ul className="md:col-span-7 divide-y divide-border">
              {coffees.map((c, i) => (
                <li key={c.name} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-7">
                  <span className="tracking-eyebrow text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="font-serif text-3xl md:text-4xl transition-transform duration-500 group-hover:translate-x-1 text-start">
                        {c.name}
                      </h3>
                      <span className="hidden text-sm tracking-eyebrow text-muted-foreground md:inline">
                        {c.note}
                      </span>
                    </div>
                    <p className="mt-2 max-w-lg text-sm text-foreground/70 text-start">{c.body}</p>
                  </div>
                  <span className="font-serif text-lg text-foreground/80">{c.price}</span>
                </li>
              ))}
              <li className="py-7 text-2xl tracking-eyebrow text-muted-foreground">
                {t("coffee.andMore")}
              </li>
            </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- desserts ---------- */

function Desserts() {
  const { t } = useI18n();
  const { content } = useSiteContent();
  const desserts = (content.dessertItems.length > 0 ? content.dessertItems : (t("desserts.items") as Array<{
    name: string;
    note: string;
    price: string;
    body: string;
  }>));

  return (
    <section id="desserts" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="tracking-eyebrow text-muted-foreground">{t("desserts.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-[5.25rem]">
              {t("desserts.title")} <span className="italic">{t("desserts.titleItalic")}</span>
            </h2>
          </div>
          <p className="md:col-span-6 font-serif text-4xl leading-snug text-foreground/85 md:text-4xl text-start">
            {t("desserts.body")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <figure className="md:col-span-6">
            <div className="overflow-hidden">
              <img
                src={content.images.desserts}
                alt="Coffee House pastry selection"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
              />
            </div>
          </figure>

          <div className="md:col-span-6 flex flex-col justify-start">
            <ul className="divide-y divide-border">
              {desserts.map((d, i) => (
                <li key={d.name} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-7">
                  <span className="tracking-eyebrow text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="font-serif text-3xl md:text-4xl transition-transform duration-500 group-hover:translate-x-1 text-start">
                        {d.name}
                      </h3>
                      <span className="hidden text-sm tracking-eyebrow text-muted-foreground md:inline">
                        {d.note}
                      </span>
                    </div>
                    <p className="mt-2 max-w-lg text-sm text-foreground/70 text-start">{d.body}</p>
                  </div>
                  <span className="font-serif text-lg text-foreground/80">{d.price}</span>
                </li>
              ))}
              <li className="py-7 text-2xl tracking-eyebrow text-muted-foreground">
                {t("desserts.andMore")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- signature (handwritten cups) ---------- */

function Signature() {
  const { t, lang } = useI18n();
  const { content } = useSiteContent();
  const isAr = lang === "ar";

  return (
    <section className="relative overflow-hidden bg-espresso py-28 text-ivory md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">{t("signature.eyebrow")}</p>
          <h2 className="mt-6 font-display text-5xl md:text-[5.25rem]">
            {t("signature.title")}<br />
            <span className="italic text-ivory/70">{t("signature.titleItalic")}</span>
          </h2>
          <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory/80 text-start">
            {t("signature.body")}
          </p>
          <p className={`mt-10 tracking-eyebrow text-ivory/50 text-start ${isAr ? "font-arabic leading-loose" : ""}`}>
            {t("signature.quote")}
          </p>
          <p className="mt-2 text-sm italic text-ivory/40 text-start">{t("signature.quoteAttribution")}</p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={content.images.signatureCup} alt="Handwritten Coffee House cup" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -start-6 hidden aspect-square w-1/2 overflow-hidden border-8 border-espresso shadow-editorial md:block">
            <img src={content.images.signatureCups} alt="Illustrated Coffee House cups" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- testimonials ---------- */

function Testimonials() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  const [reviews, setReviews] = useState<Array<{ id: string; text: string; name: string; tag: string; rating: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-background py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">{t("testimonials.eyebrow")}</p>
            <h2 className="mt-6 font-display text-5xl md:text-6xl">
              {t("testimonials.title")} <span className="italic">{t("testimonials.titleItalic")}</span>
            </h2>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <p className="text-sm tracking-eyebrow text-muted-foreground">{t("testimonials.rating")}</p>
            <Dialog>
              <DialogTrigger asChild>
                <button className={`btn-primary ${isAr ? "font-arabic" : ""}`}>
                  {t("testimonials.writeReview")}
                </button>
              </DialogTrigger>
              <ReviewOverlay />
            </Dialog>
          </div>
        </div>

        {/* Mobile review button */}
        <div className="mt-6 md:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <button className={`btn-primary ${isAr ? "font-arabic" : ""}`}>
                {t("testimonials.writeReview")}
              </button>
            </DialogTrigger>
            <ReviewOverlay />
          </Dialog>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {loading ? (
            <p className="md:col-span-3 py-12 text-center text-muted-foreground">{t("testimonials.loading")}</p>
          ) : reviews.length === 0 ? (
            <p className="md:col-span-3 py-12 text-center text-muted-foreground">{t("testimonials.noReviews")}</p>
          ) : (
            [...reviews].reverse().slice(0, 6).map((r) => (
              <figure
                key={r.id}
                className="group relative flex flex-col justify-between border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-editorial"
              >
                <span className="block font-display text-4xl leading-none text-gold/80">&ldquo;</span>
                <div className="mt-2 flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill={i < r.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L10 15.3 4.8 17.7l1-5.9L1.5 7.7l5.9-.9z" strokeLinejoin="round" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-3 font-serif text-lg leading-snug text-foreground/90 text-start">
                  {r.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-serif italic">{r.name}</span>
                  <span className="tracking-eyebrow text-muted-foreground">{r.tag}</span>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- gallery ---------- */

function Gallery() {
  const { t } = useI18n();
  const { content } = useSiteContent();
  const alts = t("gallery.alts") as Record<string, string>;
  const defaultGallery = ["/2.png", "/5.png", "/c1.png"];
  const galleryImages = content.images.gallery;
  const items = [
    { src: galleryImages[0] || defaultGallery[0], alt: alts.storefront, span: "md:col-span-4 aspect-[3/5] md:aspect-[3/4]" },
    { src: galleryImages[1] || defaultGallery[1], alt: alts.interior, span: "md:col-span-5 aspect-[3/5] md:aspect-[5/4]" },
    { src: galleryImages[2] || defaultGallery[2], alt: alts.espresso, span: "md:col-span-3 aspect-[3/5] md:aspect-[3/4]" },
  ];

  return (
    <section id="gallery" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">{t("gallery.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-[5.25rem]">
              {t("gallery.title")} <span className="italic">{t("gallery.titleItalic")}</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70 text-start">
            {t("gallery.body")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
          {items.map((it, i) => (
            <figure
              key={i}
              className={`group relative overflow-hidden ${it.span} col-span-1`}
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </figure>
          ))}
          <figure className="group relative overflow-hidden md:col-span-4 aspect-[3/5] md:align-self-start">
            <img
              src={galleryImages[3] || "/14.png"}
              alt={alts.brandingPaper}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          </figure>
          <figure className="group relative overflow-hidden md:col-span-4 aspect-[3/5] md:aspect-[1/2] md:align-self-start md:-mt-[33.33%]">
            <img
              src={galleryImages[4] || "/c2.png"}
              alt={alts.nightWindow}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          </figure>
          <div className="md:col-span-4 aspect-[3/5] md:aspect-[1/2] md:align-self-start md:-mt-[33.33%] flex flex-col gap-4 overflow-hidden">
            <figure className="group relative overflow-hidden aspect-[10/11] shrink-0">
              <img
                src={galleryImages[5] || "/19.png"}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </figure>
            <figure className="group relative overflow-hidden flex-1">
              <img
                src={galleryImages[6] || "/c7.png"}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- stats ---------- */

function Stats() {
  const { t } = useI18n();
  const stats = t("stats.items") as [string, string][];

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="tracking-eyebrow text-muted-foreground">{t("stats.eyebrow")}</p>
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4 md:gap-4">
          {stats.map(([n, l]) => (
            <div key={l} className="border-e border-border/60 pe-6 last:border-e-0">
              <p className="font-display text-6xl md:text-[5.25rem]">{n}</p>
              <p className="mt-3 tracking-eyebrow text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- visit ---------- */

function Visit() {
  const { t, lang } = useI18n();
  const { content } = useSiteContent();
  const isAr = lang === "ar";
  const hours = content.hours;

  return (
    <section id="visit" className="relative overflow-hidden bg-walnut py-28 text-ivory md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">{t("visit.eyebrow")}</p>
          <h2 className="mt-6 font-display text-6xl md:text-[5.25rem]">
            {t("visit.title")}<br /><span className="italic text-ivory/70">{t("visit.titleItalic")}</span>
          </h2>
          <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory/80 text-start">
            {t("visit.body")}
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div>
                <dt className="tracking-eyebrow text-ivory/50">{t("visit.addressLabel")}</dt>
                <dd className="mt-2 font-serif text-lg text-start">
                  {content.address || t("visit.address")}
                </dd>
              </div>
              <div>
                <dt className="tracking-eyebrow text-ivory/50">{t("visit.reservationsLabel")}</dt>
                <dd className="mt-2 font-serif text-lg">{content.reservations || t("visit.reservations")}</dd>
              </div>
              <div>
                <dt className="tracking-eyebrow text-ivory/50">{t("visit.parkingLabel")}</dt>
                <dd className="mt-2 font-serif text-lg text-start">{content.parking || t("visit.parking")}</dd>
              </div>
            </div>
            <div>
              <dt className="tracking-eyebrow text-ivory/50">{t("visit.hoursLabel")}</dt>
              <dd className="mt-2 font-serif text-lg">
                {hours.map((h) => (
                  <div key={h.label} className="flex flex-col text-start">
                    <span>{h.label}</span>
                    <span className="text-ivory/80">{h.time}</span>
                  </div>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <a href="#" onClick={(e) => e.preventDefault()} className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              {t("visit.ctaReserve")}
            </a>
            <a
              href="https://maps.google.com/?q=Coffee+House+Riyadh"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              {t("visit.ctaDirections")}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={content.images.visit[0] || "/c11.png"} alt="Coffee House entrance in daylight" loading="lazy" className="h-full w-full object-cover object-bottom" />
          </div>
          <div className="absolute -top-6 end-0 hidden aspect-[4/3] w-1/2 overflow-hidden border-8 border-walnut shadow-editorial md:block">
            <img src={content.images.visit[1] || "/20.jpg"} alt="Coffee House interior" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const { t, lang } = useI18n();
  const social = t("footer.social") as string[];
  const isAr = lang === "ar";

  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-6xl">
              Coffee <span className="italic text-ivory/50">House</span>
            </p>
            <p className="mt-6 max-w-sm font-serif text-lg text-ivory/70 text-start">
              {t("footer.tagline")}
              <span className="ms-1 font-arabic text-xl text-ivory/60">{t("footer.arabicName")}</span>
            </p>

            <form
              suppressHydrationWarning
              onSubmit={(e) => { e.preventDefault(); window.open("https://mail.google.com/mail/?view=cm&fs=1&to=kmafraz12@gmail.com", "_blank"); }}
              className="mt-10 flex max-w-sm items-center border-b border-ivory/30 pb-2"
            >
              <input
                suppressHydrationWarning
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="w-full bg-transparent py-2 text-sm placeholder:text-ivory/40 focus:outline-none text-start"
              />
              <button className="tracking-eyebrow text-ivory/80 transition-colors hover:text-ivory whitespace-nowrap">
                {t("footer.send")}
              </button>
            </form>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="tracking-eyebrow text-ivory/50">{t("footer.visit")}</p>
            <p className="mt-4 font-serif text-lg leading-snug text-start">
              {t("visit.address")}<br />
              <span className="block mt-5 space-y-1">
                {t("visit.hours")?.map((h: { label: string; time: string }, i: number) => <span key={i} className="block">{h.label}: {h.time}</span>)}
              </span>
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="tracking-eyebrow text-ivory/50">{t("footer.follow")}</p>
            <ul className="mt-4 space-y-2 font-serif text-lg">
              {social.map((s) => (
                <li key={s}><a href={s === "Instagram" ? "https://www.instagram.com/mr_web_guy/" : s === "GitHub" ? "https://github.com/Muhamad-Afraz" : "mailto:kmafraz12@gmail.com"} target={s === "Instagram" || s === "GitHub" ? "_blank" : undefined} rel={s === "Instagram" || s === "GitHub" ? "noreferrer" : undefined} className="hover:text-gold transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-ivory/15 pt-6 text-xs tracking-eyebrow text-ivory/40 md:flex-row">
          <span>{t("footer.copyright").replace("{{year}}", String(new Date().getFullYear()))}</span>
          <span>{t("footer.tagline2")}</span>
          <span>{t("footer.closing")}</span>
        </div>
      </div>
    </footer>
  );
}
