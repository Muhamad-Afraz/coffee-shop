import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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

/* ---------- data ---------- */

const coffees = [
  {
    name: "Coffee of the Day",
    note: "Rotating single origin",
    price: "SAR 22",
    body: "A daily selection from our roasters — bright, clean, considered.",
  },
  {
    name: "Espresso",
    note: "Signature blend",
    price: "SAR 18",
    body: "Dense, syrupy, quietly floral. The heart of the house.",
  },
  {
    name: "Coconut Coffee",
    note: "House specialty",
    price: "SAR 28",
    body: "Cold-pressed coconut folded into a slow-pulled shot.",
  },
  {
    name: "Specialty Latte",
    note: "Whole milk or oat",
    price: "SAR 24",
    body: "Micro-foam textured to silk. Poured with intention.",
  },
];

const desserts = [
  { name: "Lavender Cake", note: "Signature", body: "Layered sponge, lavender cream, a whisper of gold." },
  { name: "Kozama Cake", note: "House favorite", body: "Toasted nuts, honeyed cream, brown butter finish." },
  { name: "Coffee Cake", note: "For the purists", body: "Espresso-soaked crumb with mascarpone." },
  { name: "Seasonal", note: "Changing weekly", body: "Guided by the season. Ask what's new today." },
];

const reviews = [
  {
    text: "The handwritten note on my cup made my whole week. Coffee is beautifully balanced.",
    name: "Layla A.",
    tag: "Regular",
  },
  {
    text: "It doesn't feel like a café. It feels like a small, quiet piece of somewhere else.",
    name: "Mohammed R.",
    tag: "Google review",
  },
  {
    text: "Every detail — the tray, the cup, the light — everything is considered. Rare in Riyadh.",
    name: "Nora S.",
    tag: "Visitor",
  },
];

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
  const links = [
    ["Story", "#philosophy"],
    ["Coffee", "#coffee"],
    ["Desserts", "#desserts"],
    ["Gallery", "#gallery"],
    ["Visit", "#visit"],
  ];
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
          <span className="ml-1 align-super text-[0.55rem] tracking-eyebrow font-sans text-muted-foreground">
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
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button className="text-[0.72rem] tracking-eyebrow text-foreground/60 transition-colors hover:text-foreground">
            EN <span className="mx-1 opacity-40">/</span> <span className="font-arabic text-sm">ع</span>
          </button>
          <a href="#visit" className="btn-primary">Reserve</a>
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
                className="py-2 font-serif text-2xl"
              >
                {label}
              </a>
            ))}
            <a href="#visit" className="btn-primary mt-4 self-start" onClick={() => setOpen(false)}>
              Reserve
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
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
        <div className="flex flex-1 flex-col justify-end">
          <p className="reveal tracking-eyebrow text-ivory/70">
            Riyadh · Est. Boutique Coffee House
          </p>
          <h1 className="reveal reveal-delay-1 mt-6 font-display text-[clamp(3.5rem,11vw,10rem)] text-ivory">
            F<span className="italic">ā</span>ir
            <span className="italic text-ivory/60"> enough</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-xl font-serif text-xl leading-snug text-ivory/85 md:text-2xl">
            Coffee, crafted with enough care to become unforgettable —
            <span className="italic text-ivory/60"> and enough calm to be remembered.</span>
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-3">
            <a href="#visit" className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              Reserve a Table
            </a>
            <a href="#coffee" className="btn-ghost">View the Menu</a>
          </div>

          <div className="mt-16 flex items-end justify-between border-t border-ivory/15 pt-6 text-ivory/70">
            <div className="flex items-center gap-6 text-[0.7rem] tracking-eyebrow">
              <span>★ 4.8 · 250+ reviews</span>
              <span className="hidden md:inline">Open until 2 AM</span>
            </div>
            <div className="scroll-cue flex flex-col items-center gap-2 text-[0.65rem] tracking-eyebrow">
              <span>Scroll</span>
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
  const words = [
    "Single Origin",
    "Handwritten Cups",
    "Slow Craft",
    "Warm Hospitality",
    "Quiet Luxury",
    "Open Until 2 AM",
    "Riyadh",
  ];
  const items = [...words, ...words];
  return (
    <section className="border-y border-border bg-cream py-8 overflow-hidden">
      <div className="marquee-track flex gap-14 whitespace-nowrap">
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
  return (
    <section id="philosophy" className="relative bg-background py-28 md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <p className="tracking-eyebrow text-muted-foreground">01 · Our Philosophy</p>
          <h2 className="mt-6 font-display text-5xl md:text-6xl">
            Enough<br />
            <span className="italic text-muted-foreground">isn't average.</span>
          </h2>
          <p className="mt-4 font-display text-5xl md:text-6xl">
            Enough<br />
            <span className="italic">is excellence.</span>
          </p>
        </div>

        <div
          ref={ref}
          className={`md:col-span-7 md:col-start-6 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-serif text-2xl leading-snug text-foreground/85 md:text-[1.75rem]">
            We opened FAIR because we believed a café could feel like a room in a friend's home —
            warm wood, soft light, a cup made with attention. Not a chain. Not a rush.
            <em className="text-muted-foreground"> A small, considered ritual you look forward to.</em>
          </p>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              ["Craft", "Beans sourced with care. Shots pulled with patience."],
              ["Hospitality", "A greeting by name. A note on your cup."],
              ["Calm", "A room built for lingering, until the last hour."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="tracking-eyebrow text-muted-foreground">— {t}</p>
                <p className="mt-3 font-serif text-lg leading-snug">{d}</p>
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
  return (
    <section id="coffee" className="relative bg-cream py-28 md:py-36 grain">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">02 · The Bar</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
              Signature <span className="italic">Coffee</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70">
            A short list, on purpose. Everything we serve, we serve with intention — beans changed
            with the season, milk textured by hand.
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
                <span className="tracking-eyebrow">Signature Espresso</span>
                <span className="font-serif italic">— the heart of the house</span>
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
                    <h3 className="font-serif text-3xl md:text-4xl transition-transform duration-500 group-hover:translate-x-1">
                      {c.name}
                    </h3>
                    <span className="hidden text-sm tracking-eyebrow text-muted-foreground md:inline">
                      {c.note}
                    </span>
                  </div>
                  <p className="mt-2 max-w-lg text-sm text-foreground/70">{c.body}</p>
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
  return (
    <section id="desserts" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">03 · Pastry</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
              Small <span className="italic">Indulgences</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70">
            Baked in small batches. Plated on hand-thrown ceramics. Meant for slow afternoons.
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
                      <h3 className="font-serif text-3xl">{d.name}</h3>
                      <span className="text-sm tracking-eyebrow text-muted-foreground">{d.note}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/70">{d.body}</p>
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
  return (
    <section className="relative overflow-hidden bg-espresso py-28 text-ivory md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">04 · A Signature</p>
          <h2 className="mt-6 font-display text-5xl md:text-7xl">
            The cup<br />
            <span className="italic text-ivory/70">is a letter.</span>
          </h2>
          <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory/80">
            Every cup that leaves our bar carries a small handwritten note — sometimes a wish,
            sometimes a drawing, always a moment. It is our quietest gesture, and our most beloved.
          </p>
          <p className="mt-10 tracking-eyebrow text-ivory/50">
            "Someday you will smile while saying it took too long — but this is more than what I prayed for."
          </p>
          <p className="mt-2 text-sm italic text-ivory/40">— found on a FAIR cup</p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={handwritten.url} alt="Handwritten FAIR cup" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -left-6 hidden aspect-square w-1/2 overflow-hidden border-8 border-espresso shadow-editorial md:block">
            <img src={cupsGroup.url} alt="Illustrated FAIR cups" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- testimonials ---------- */

function Testimonials() {
  return (
    <section className="bg-background py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">05 · In Their Words</p>
            <h2 className="mt-6 font-display text-5xl md:text-6xl">
              A room people <span className="italic">write home about.</span>
            </h2>
          </div>
          <p className="hidden text-sm tracking-eyebrow text-muted-foreground md:block">★ 4.8 / 5</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="group relative flex flex-col justify-between border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-editorial"
            >
              <span className="font-display text-6xl leading-none text-gold/80">"</span>
              <blockquote className="mt-4 font-serif text-xl leading-snug text-foreground/90">
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
  const items = [
    { src: storefront.url, alt: "FAIR entrance", span: "md:col-span-4 md:row-span-2 aspect-[3/4]" },
    { src: interior.url, alt: "FAIR interior", span: "md:col-span-5 aspect-[5/4]" },
    { src: espresso.url, alt: "Espresso", span: "md:col-span-3 aspect-square" },
    { src: nightWindow.url, alt: "Night window", span: "md:col-span-3 aspect-[3/4]" },
    { src: cupsGroup.url, alt: "Illustrated cups", span: "md:col-span-5 aspect-[5/4]" },
  ];
  return (
    <section id="gallery" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="tracking-eyebrow text-muted-foreground">06 · Gallery</p>
            <h2 className="mt-6 font-display text-6xl md:text-7xl">
              Around the <span className="italic">room</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-lg text-foreground/70">
            Details you'll only notice when you slow down. That's the point.
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
  const stats = [
    ["4.8", "Google rating"],
    ["250+", "Written reviews"],
    ["2 AM", "Doors close at"],
    ["12", "Cups on the menu"],
  ];
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="tracking-eyebrow text-muted-foreground">07 · Why FAIR</p>
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4 md:gap-4">
          {stats.map(([n, l]) => (
            <div key={l} className="border-r border-border/60 pr-6 last:border-r-0">
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
  return (
    <section id="visit" className="relative overflow-hidden bg-walnut py-28 text-ivory md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="tracking-eyebrow text-ivory/50">08 · Visit</p>
          <h2 className="mt-6 font-display text-6xl md:text-7xl">
            Come sit<br /><span className="italic text-ivory/70">a while.</span>
          </h2>
          <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory/80">
            Whether it is early morning or the quiet hour before close — the door is open, the light
            is warm, the coffee is ready.
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="tracking-eyebrow text-ivory/50">Address</dt>
              <dd className="mt-2 font-serif text-lg">
                Saybawiyyah, Ar Rawdah,<br />Riyadh 13211
              </dd>
            </div>
            <div>
              <dt className="tracking-eyebrow text-ivory/50">Hours</dt>
              <dd className="mt-2 font-serif text-lg">
                Daily<br />7:00 AM — 2:00 AM
              </dd>
            </div>
            <div>
              <dt className="tracking-eyebrow text-ivory/50">Reservations</dt>
              <dd className="mt-2 font-serif text-lg">reserve@fair-enough.coffee</dd>
            </div>
            <div>
              <dt className="tracking-eyebrow text-ivory/50">Parking</dt>
              <dd className="mt-2 font-serif text-lg">Street parking, valet after 8 PM</dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <a href="mailto:reserve@fair-enough.coffee" className="btn-primary" style={{ background: "var(--ivory)", color: "var(--espresso)" }}>
              Reserve a Table
            </a>
            <a
              href="https://maps.google.com/?q=FAIR+enough+coffee+Riyadh"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Get Directions
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={storefront.url} alt="FAIR entrance in daylight" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -top-6 right-0 hidden aspect-[4/3] w-1/2 overflow-hidden border-8 border-walnut shadow-editorial md:block">
            <img src={interior.url} alt="FAIR interior" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-6xl">
              F<span className="italic">ā</span>ir <span className="italic text-ivory/50">enough</span>
            </p>
            <p className="mt-6 max-w-sm font-serif text-lg text-ivory/70">
              A small letter, printed daily and handed to you warm.
              <span className="ml-1 font-arabic text-xl text-ivory/60">قهوة فير اينف</span>
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-10 flex max-w-sm items-center border-b border-ivory/30 pb-2"
            >
              <input
                type="email"
                placeholder="Your email — occasional letters, never spam"
                className="w-full bg-transparent py-2 text-sm placeholder:text-ivory/40 focus:outline-none"
              />
              <button className="tracking-eyebrow text-ivory/80 transition-colors hover:text-ivory">
                Send →
              </button>
            </form>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="tracking-eyebrow text-ivory/50">Visit</p>
            <p className="mt-4 font-serif text-lg leading-snug">
              Saybawiyyah, Ar Rawdah,<br />Riyadh 13211<br />Daily 7 AM — 2 AM
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="tracking-eyebrow text-ivory/50">Follow</p>
            <ul className="mt-4 space-y-2 font-serif text-lg">
              <li><a href="#" className="hover:text-gold transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Google</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-ivory/15 pt-6 text-xs tracking-eyebrow text-ivory/40 md:flex-row">
          <span>© {new Date().getFullYear()} FAIR enough Coffee</span>
          <span>Riyadh · Boutique Specialty Coffee</span>
          <span>Fair doesn't mean equal · Fair doesn't mean...</span>
        </div>
      </div>
    </footer>
  );
}
