import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

import storefront from "@/assets/fair-storefront.jpg.asset.json";
import interior from "@/assets/fair-interior.jpg.asset.json";
import espresso from "@/assets/fair-espresso.jpg.asset.json";
import handwritten from "@/assets/fair-handwritten.jpg.asset.json";
import cupsGroup from "@/assets/fair-cups-group.jpg.asset.json";
import storefrontNight from "@/assets/fair-storefront-night.jpg.asset.json";
import nightWindow from "@/assets/fair-night-window.jpg.asset.json";
import dessert from "@/assets/fair-dessert.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: FairPage,
  head: () => ({
    meta: [
      { property: "og:image", content: storefrontNight.url },
      { name: "twitter:image", content: storefrontNight.url },
    ],
  }),
});

/* ---------- small utilities ---------- */

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

function FairPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
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
  );
}

/* ---------- nav ---------- */

function Nav() {
  const scrolled = useScrolled(30);
  const [open, setOpen] = useState(false);
  const { t, lang } = useI18n();
  const links = t("nav.links") as [string, string][];
  const isAr = lang === "ar";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-ivory/75 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className="font-display text-2xl leading-none tracking-tight">
          F<span className="italic">ā</span>ir
          <span className="ms-1 align-super text-[0.55rem] tracking-eyebrow font-sans text-muted-foreground">
            enough
          </span>
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative text-[0.72rem] tracking-eyebrow text-foreground/70 transition-colors hover:text-foreground"
            >
              {label}
              <span className="absolute -bottom-1 start-0 h-px w-0 bg-foreground transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LangSwitcher />
          <a href="#visit" className="btn-primary">{t("nav.reserve")}</a>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center md:hidden"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-ivory/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-6">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`py-2 text-2xl ${isAr ? "font-arabic" : "font-serif"}`}
              >
                {label}
              </a>
            ))}
            <div className="mt-4 flex items-center gap-4">
              <LangSwitcher />
            </div>
            <a href="#visit" className="btn-primary mt-4 self-start" onClick={() => setOpen(false)}>
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
  const isAr = lang === "ar";

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-espresso">
      <div className="absolute inset-0">
        <img
          src={storefrontNight.url}
          alt="FAIR enough coffee shop, evening"
          className="h-full w-full object-cover ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-espresso/30 to-espresso/85" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-6 pb-16 pt-32 md:px-10 md:pt-40">
        <div className="flex flex-1 flex-col justify-end items-start">
          <p className="reveal tracking-eyebrow text-ivory/70">
            {t("hero.eyebrow")}
          </p>
          <h1 className="reveal reveal-delay-1 mt-6 font-display text-[clamp(3.5rem,11vw,10rem)] text-ivory">
            F<span className="italic">ā</span>ir
            <span className="italic text-ivory/60"> enough</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-xl font-serif text-xl leading-snug text-ivory/85 md:text-2xl text-start">
            {t("hero.subtitle")}
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-3">
            <a href="#visit" className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              {t("hero.ctaReserve")}
            </a>
            <a href="#coffee" className="btn-ghost">{t("hero.ctaMenu")}</a>
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
    <section className="border-y border-border bg-cream py-8 overflow-hidden">
      <div
        className="marquee-track flex gap-14 whitespace-nowrap"
        style={{ animationDirection: isRtl ? "reverse" : "normal" }}
      >
        {items.map((w, i) => (
          <div key={i} className="flex items-center gap-14">
            <span className="font-serif text-3xl italic text-espresso/80 md:text-4xl">{w}</span>
            <span className="text-gold">✦</span>
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
  const isAr = lang === "ar";
  const values = t("philosophy.values") as [string, string][];

  return (
    <section id="philosophy" className="relative bg-background py-28 md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <p className="tracking-eyebrow text-muted-foreground">{t("philosophy.eyebrow")}</p>
          <h2 className="mt-6 font-display text-5xl md:text-6xl">
            {t("philosophy.line1")}<br />
            <span className="italic text-muted-foreground">{t("philosophy.line1Italic")}</span>
          </h2>
          <p className="mt-4 font-display text-5xl md:text-6xl">
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
            {values.map(([title, desc]) => (
              <div key={title}>
                <p className="tracking-eyebrow text-muted-foreground">— {title}</p>
                <p className="mt-3 font-serif text-lg leading-snug text-start">{desc}</p>
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
  const coffees = t("coffee.items") as Array<{
    name: string;
    note: string;
    price: string;
    body: string;
  }>;

  return (
    <section id="coffee" className="relative bg-cream py-28 md:py-36 grain">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">{t("coffee.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
              {t("coffee.title")} <span className="italic">{t("coffee.titleItalic")}</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70 text-start">
            {t("coffee.body")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5 md:row-span-2">
            <figure className="group relative overflow-hidden">
              <img
                src={espresso.url}
                alt="FAIR signature espresso"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
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
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- desserts ---------- */

function Desserts() {
  const { t } = useI18n();
  const desserts = t("desserts.items") as Array<{
    name: string;
    note: string;
    body: string;
  }>;

  return (
    <section id="desserts" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">{t("desserts.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
              {t("desserts.title")} <span className="italic">{t("desserts.titleItalic")}</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70 text-start">
            {t("desserts.body")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <figure className="md:col-span-6">
            <div className="overflow-hidden">
              <img
                src={dessert.url}
                alt="Lavender cake with FAIR mug"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
              />
            </div>
          </figure>

          <div className="md:col-span-6 flex flex-col justify-center">
            <ul className="divide-y divide-border">
              {desserts.map((d, i) => (
                <li key={d.name} className="grid grid-cols-[auto_1fr] gap-6 py-6">
                  <span className="tracking-eyebrow text-muted-foreground pt-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-3xl text-start">{d.name}</h3>
                      <span className="text-sm tracking-eyebrow text-muted-foreground">{d.note}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/70 text-start">{d.body}</p>
                  </div>
                </li>
              ))}
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
  const isAr = lang === "ar";

  return (
    <section className="relative overflow-hidden bg-espresso py-28 text-ivory md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">{t("signature.eyebrow")}</p>
          <h2 className="mt-6 font-display text-5xl md:text-7xl">
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
            <img src={handwritten.url} alt="Handwritten FAIR cup" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -start-6 hidden aspect-square w-1/2 overflow-hidden border-8 border-espresso shadow-editorial md:block">
            <img src={cupsGroup.url} alt="Illustrated FAIR cups" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- testimonials ---------- */

function Testimonials() {
  const { t } = useI18n();
  const reviews = t("testimonials.items") as Array<{
    text: string;
    name: string;
    tag: string;
  }>;

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
          <p className="hidden text-sm tracking-eyebrow text-muted-foreground md:block">{t("testimonials.rating")}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="group relative flex flex-col justify-between border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-editorial"
            >
              <span className="font-display text-6xl leading-none text-gold/80">"</span>
              <blockquote className="mt-4 font-serif text-xl leading-snug text-foreground/90 text-start">
                {r.text}
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="font-serif italic">{r.name}</span>
                <span className="tracking-eyebrow text-muted-foreground">{r.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- gallery ---------- */

function Gallery() {
  const { t } = useI18n();
  const alts = t("gallery.alts") as Record<string, string>;
  const items = [
    { src: storefront.url, alt: alts.storefront, span: "md:col-span-4 md:row-span-2 aspect-[3/4]" },
    { src: interior.url, alt: alts.interior, span: "md:col-span-5 aspect-[5/4]" },
    { src: espresso.url, alt: alts.espresso, span: "md:col-span-3 aspect-square" },
    { src: nightWindow.url, alt: alts.nightWindow, span: "md:col-span-3 aspect-[3/4]" },
    { src: cupsGroup.url, alt: alts.cupsGroup, span: "md:col-span-5 aspect-[5/4]" },
  ];

  return (
    <section id="gallery" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">{t("gallery.eyebrow")}</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
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
              <p className="font-display text-6xl md:text-7xl">{n}</p>
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
  const hours = t("visit.hours") as Array<{ label: string; time: string }>;
  const isAr = lang === "ar";

  return (
    <section id="visit" className="relative overflow-hidden bg-walnut py-28 text-ivory md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">{t("visit.eyebrow")}</p>
          <h2 className="mt-6 font-display text-6xl md:text-7xl">
            {t("visit.title")}<br /><span className="italic text-ivory/70">{t("visit.titleItalic")}</span>
          </h2>
          <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory/80 text-start">
            {t("visit.body")}
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="tracking-eyebrow text-ivory/50">{t("visit.addressLabel")}</dt>
              <dd className="mt-2 font-serif text-lg text-start">
                {t("visit.address")}
              </dd>
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
            <div>
              <dt className="tracking-eyebrow text-ivory/50">{t("visit.reservationsLabel")}</dt>
              <dd className="mt-2 font-serif text-lg">{t("visit.reservations")}</dd>
            </div>
            <div>
              <dt className="tracking-eyebrow text-ivory/50">{t("visit.parkingLabel")}</dt>
              <dd className="mt-2 font-serif text-lg text-start">{t("visit.parking")}</dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <a href="mailto:reserve@fair-enough.coffee" className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              {t("visit.ctaReserve")}
            </a>
            <a
              href="https://maps.google.com/?q=FAIR+enough+coffee+Riyadh"
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
            <img src={storefront.url} alt="FAIR entrance in daylight" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -top-6 end-0 hidden aspect-[4/3] w-1/2 overflow-hidden border-8 border-walnut shadow-editorial md:block">
            <img src={interior.url} alt="FAIR interior" loading="lazy" className="h-full w-full object-cover" />
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
              F<span className="italic">ā</span>ir <span className="italic text-ivory/50">enough</span>
            </p>
            <p className="mt-6 max-w-sm font-serif text-lg text-ivory/70 text-start">
              {t("footer.tagline")}
              <span className="ms-1 font-arabic text-xl text-ivory/60">{t("footer.arabicName")}</span>
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-10 flex max-w-sm items-center border-b border-ivory/30 pb-2"
            >
              <input
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
              {t("visit.hours")?.map((h: { label: string; time: string }) => `${h.label}: ${h.time}`).join(" · ")}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="tracking-eyebrow text-ivory/50">{t("footer.follow")}</p>
            <ul className="mt-4 space-y-2 font-serif text-lg">
              {social.map((s) => (
                <li key={s}><a href="#" className="hover:text-gold transition-colors">{s}</a></li>
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
