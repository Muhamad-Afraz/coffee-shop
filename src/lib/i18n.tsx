import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type TransitionState = "idle" | "fading-out" | "fading-in";

interface I18nContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (path: string) => any;
  transitioning: TransitionState;
  navigateHome: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("fair-lang") as Lang | null;
    return saved === "ar" || saved === "en" ? saved : "en";
  });
  const [transitioning, setTransitioning] = useState<TransitionState>("fading-out");

  const navigateHome = () => {
    if (transitioning !== "idle") return;
    setTransitioning("fading-out");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      setTransitioning("fading-in");
      setTimeout(() => {
        setTransitioning("idle");
      }, 600);
    }, 450);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    let t2: ReturnType<typeof setTimeout>;
    const t1 = setTimeout(() => {
      setTransitioning("fading-in");
      t2 = setTimeout(() => {
        setTransitioning("idle");
      }, 600);
    }, 450);
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, []);

  const setLang = (next: Lang) => {
    if (next === lang || transitioning !== "idle") return;
    setTransitioning("fading-out");
    setTimeout(() => {
      setLangState(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fair-lang", next);
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      }
      setTransitioning("fading-in");
      setTimeout(() => {
        setTransitioning("idle");
      }, 600);
    }, 450);
  };

  const value: I18nContextValue = {
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    setLang,
    t: (path: string) => getPath(translations[lang], path) ?? path,
    transitioning,
    navigateHome,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

const translations = {
  en: {
    nav: {
      links: [
        ["Story", "#philosophy"],
        ["Coffee", "#coffee"],
        ["Desserts", "#desserts"],
        ["Gallery", "#gallery"],
        ["Visit", "#visit"],
      ],
      reserve: "Reserve",
      langLabel: "EN / ع",
    },
    hero: {
      eyebrow: "Riyadh · Est. Boutique Coffee House",
      title: "FAIR enough",
      subtitle:
        "Coffee, crafted with enough care to become unforgettable — and enough calm to be remembered.",
      ctaReserve: "Reserve a Table",
      ctaMenu: "View the Menu",
      rating: "★ 4.8 · 250+ reviews",
      hours: "Fine coffee made with care",
      scroll: "Scroll",
    },
    marquee: [
      "Single Origin",
      "Handwritten Cups",
      "Slow Craft",
      "Warm Hospitality",
      "Quiet Luxury",
      "Premium",
      "Riyadh",
    ],
    philosophy: {
      eyebrow: "01 · Our Philosophy",
      line1: "Enough",
      line1Italic: "isn't average.",
      line2: "Enough",
      line2Italic: "is excellence.",
      body:
        "We opened FAIR because we believed a café could feel like a room in a friend's home — warm wood, soft light, a cup made with attention. Not a chain. Not a rush. A small, considered ritual you look forward to.",
      values: [
        ["Craft", "Beans sourced with care. Shots pulled with patience."],
        ["Hospitality", "A greeting by name. A note on your cup."],
        ["Calm", "A room built for lingering, until the last hour."],
      ],
    },
    coffee: {
      eyebrow: "02 · The Bar",
      title: "Signature",
      titleItalic: "Coffee",
      body:
        "A carefully crafted collection of specialty coffee, signature drinks, and quality food—made with the finest ingredients and served with uncompromising attention to detail.\n\nSimple. Refined. Memorable.",
      figureCaption: "Signature Espresso",
      figureSub: "— the heart of the house",
      andMore: "…and more",
      items: [
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
      ],
    },
    desserts: {
      eyebrow: "03 · Pastry",
      title: "Small",
      titleItalic: "Indulgences",
      body:
        "Baked in small batches. Plated on hand-thrown ceramics. Meant for slow afternoons.",
      items: [
        {
          name: "Lavender Cake",
          note: "Signature",
          body: "Layered sponge, lavender cream, a whisper of gold.",
        },
        {
          name: "Kozama Cake",
          note: "House favorite",
          body: "Toasted nuts, honeyed cream, brown butter finish.",
        },
        {
          name: "Coffee Cake",
          note: "For the purists",
          body: "Espresso-soaked crumb with mascarpone.",
        },
        {
          name: "Seasonal",
          note: "Changing weekly",
          body: "Guided by the season. Ask what's new today.",
        },
      ],
    },
    signature: {
      eyebrow: "04 · A Signature",
      title: "The cup",
      titleItalic: "is a letter.",
      body:
        "Every cup made by us carries more than coffee — sometimes a wish, sometimes a memory, always a moment. It is our quietest gesture, and our most beloved.",
      quote:
        '"Someday you will smile while saying it took too long — but this is more than what I prayed for."',
      quoteAttribution: "— found on a FAIR cup",
    },
    testimonials: {
      eyebrow: "05 · In Their Words",
      title: "A room people",
      titleItalic: "write home about.",
      rating: "★ 4.8 / 5",
      items: [
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
      ],
    },
    gallery: {
      eyebrow: "06 · Gallery",
      title: "Around the",
      titleItalic: "room",
      body: "Details you'll only notice when you slow down. That's the point.",
      alts: {
        storefront: "FAIR entrance",
        interior: "FAIR interior",
        espresso: "FAIR bag",
        nightWindow: "FAIR dessert and coffee",
        cupsGroup: "Purple coffee",
        brandingPaper: "FAIR branding paper",
      },
    },
    stats: {
      eyebrow: "07 · Why FAIR",
      items: [
        ["4.8", "Google rating"],
        ["250+", "Written reviews"],
        ["10+", "Years of barista expertise"],
        ["100%", "Specialty-grade beans"],
      ],
    },
    visit: {
      eyebrow: "08 · Visit",
      title: "Come sit",
      titleItalic: "a while.",
      body:
        "Whether it is early morning or the quiet hour before close — the door is open, the light is warm, the coffee is ready.",
      addressLabel: "Address",
      address: "Saybawiyyah, Ar Rawdah / Riyadh 13211, Saudi Arabia",
      hoursLabel: "Hours",
      hours: [
        { label: "Sun — Wed", time: "6:00 AM — 1:00 AM" },
        { label: "Thursday", time: "6:00 AM — 2:00 AM" },
        { label: "Friday", time: "12:30 PM — 2:00 AM" },
        { label: "Saturday", time: "6:00 AM — 1:00 AM" },
      ],
      reservationsLabel: "Reservations",
      reservations: "reserve@fair-enough.coffee",
      parkingLabel: "Parking",
      parking: "Street parking, valet after 8 PM",
      ctaReserve: "Reserve a Table",
      ctaDirections: "Get Directions",
    },
    footer: {
      tagline: "A small letter, printed daily and handed to you warm.",
      arabicName: "قهوة فير اينف",
      emailPlaceholder: "Your email — occasional letters, never spam",
      send: "Send →",
      visit: "Visit",
      follow: "Follow",
      social: ["Instagram", "TikTok", "Google"],
      copyright: "© {{year}} FAIR enough Coffee",
      tagline2: "Riyadh · Boutique Specialty Coffee",
      closing: "Fair doesn't mean equal · Fair doesn't mean...",
    },
    langSwitcher: {
      en: "English",
      ar: "العربية",
    },
  },
  ar: {
    nav: {
      links: [
        ["القصة", "#philosophy"],
        ["القهوة", "#coffee"],
        ["الحلويات", "#desserts"],
        ["المعرض", "#gallery"],
        ["الزيارة", "#visit"],
      ],
      reserve: "احجز",
      langLabel: "EN / ع",
    },
    hero: {
      eyebrow: "الرياض · بيت قهوة بوتيكي",
      title: "FAIR enough",
      subtitle:
        "قهوة صُنعت بعناية كافية لتبقى في الذاكرة — وهدوء كافٍ لتُروى عنها.",
      ctaReserve: "احجز طاولتك",
      ctaMenu: "اكتشف القائمة",
      rating: "★ ٤.٨ · +٢٥٠ تقييم",
      hours: "قهوة مختارة بعناية",
      scroll: "استكشف",
    },
    marquee: [
      "أصل واحد",
      "أكواب مكتوبة باليد",
      "صناعة بطيئة",
      "ضيافة دافئة",
      "فخامة هادئة",
      "فخامة",
      "الرياض",
    ],
    philosophy: {
      eyebrow: "٠١ · فلسفتنا",
      line1: "الكافي",
      line1Italic: "ليس عادياً.",
      line2: "الكافي",
      line2Italic: "هو التميز.",
      body:
        "فتحنا فير لأننا آمنّا بأن المقهى يمكن أن يكون كغرفة في بيت صديق — خشب دافئ، ضوء ناعم، كوب صُنع باهتمام. ليس سلسلة، لا عجلة. طقس صغير مدروس تتطلع إليه.",
      values: [
        ["الحرفية", "حبوب تُختار بعناية. إكسبرسو يُسحب بهدوء."],
        ["الضيافة", "تحية باسمك. رسالة على كوبك."],
        ["الهدوء", "مكان بُني للبقاء، حتى الساعة الأخيرة."],
      ],
    },
    coffee: {
      eyebrow: "٠٢ · البار",
      title: "قهوة",
      titleItalic: "مميزة",
      body:
        "قائمة قصيرة عن قصد. كل ما نقدمه، نقدمه بقصد — حبوب تتغير مع الموسم، حليب يُحضّر باليد.",
      figureCaption: "إكسبرسو مميز",
      figureSub: "— قلب المكان",
      andMore: "…وغيرها",
      items: [
        {
          name: "قهوة اليوم",
          note: "أصل واحد متغير",
          price: "٢٢ ر.س",
          body: "اختيار يومي من محامصنا — ناصع، نقي، مدروس.",
        },
        {
          name: "إكسبرسو",
          note: "المزيج المميز",
          price: "١٨ ر.س",
          body: "كثيف، حريري، زهري بهدوء. قلب المكان.",
        },
        {
          name: "قهوة جوز الهند",
          note: "تخصص المنزل",
          price: "٢٨ ر.س",
          body: "جوز هند معصور على البارد ممزوج مع إكسبرسو مُسحب ببطء.",
        },
        {
          name: "لاتيه مميز",
          note: "حليب كامل أو شوفان",
          price: "٢٤ ر.س",
          body: "رغوة دقيقة كالحرير. تُسكب بقصد.",
        },
      ],
    },
    desserts: {
      eyebrow: "٠٣ · المخبوزات",
      title: "لحظات",
      titleItalic: "لذيذة",
      body:
        "تُخبز بكميات صغيرة. تُقدم على سيراميك يدوي. لأوقات هادئة.",
      items: [
        {
          name: "كيك اللافندر",
          note: "المميز",
          body: "إسفنجة طبقية، كريمة لافندر، لمسة ذهب.",
        },
        {
          name: "كيك كوزاما",
          note: "المفضل لدينا",
          body: "مكسرات محمصة، كريمة بالعسل، نكهة الزبدة البنية.",
        },
        {
          name: "كيك القهوة",
          note: "لعشاق النقاء",
          body: "فتات منقوع بالإكسبرسو مع ماسكاربوني.",
        },
        {
          name: "موسمي",
          note: "يتغير أسبوعياً",
          body: "يُختار حسب الموسم. اسأل ما هو جديد اليوم.",
        },
      ],
    },
    signature: {
      eyebrow: "٠٤ · بصمتنا",
      title: "الكوب",
      titleItalic: "رسالة.",
      body:
        "كل كوب نصنعه يحمل أكثر من قهوة — أحياناً أمنية، وأحياناً ذكرى، دائماً لحظة. إنها أهدئ هديتنا وأحبّها.",
      quote:
        '"سيأتي يوم تبتسم فيه وأنت تقول إنها طالت — لكن هذا أكثر مما دعوت به."',
      quoteAttribution: "— عُثر عليها على كوب من فير",
    },
    testimonials: {
      eyebrow: "٠٥ · بكلماتهم",
      title: "مكان",
      titleItalic: "يُروى عنه.",
      rating: "★ ٤.٨ / ٥",
      items: [
        {
          text: "الرسالة المكتوبة على كوبي أضاءت أسبوعي. القهوة متوازنة بشكل جميل.",
          name: "ليلى أ.",
          tag: "زبونة دائمة",
        },
        {
          text: "لا يشعرك كمقهى. يشعرك كقطعة صغيرة وهادئة من مكان آخر.",
          name: "محمد ر.",
          tag: "تقييم غوغل",
        },
        {
          text: "كل التفاصيل — الصينية، الكوب، الضوء — كل شيء مدروس. نادر في الرياض.",
          name: "نورا س.",
          tag: "زائرة",
        },
      ],
    },
    gallery: {
      eyebrow: "٠٦ · المعرض",
      title: "حول",
      titleItalic: "المكان",
      body: "تفاصيل لن تلاحظها إلا عندما تبطئ. هذا هو المقصد.",
      alts: {
        storefront: "مدخل فير",
        interior: "داخل فير",
        espresso: "حقيبة فير",
        nightWindow: "حلويات وقهوة فير",
        cupsGroup: "قهوة بنفسجية",
        brandingPaper: "ورق تعريف فير",
      },
    },
    stats: {
      eyebrow: "٠٧ · لماذا فير",
      items: [
        ["٤.٨", "تقييم غوغل"],
        ["+٢٥٠", "تقييم مكتوب"],
        ["١٠+", "سنوات خبرة البارستا"],
        ["١٠٠٪", "حبوب قهوة مختصة"],
      ],
    },
    visit: {
      eyebrow: "٠٨ · زورنا",
      title: "تعال",
      titleItalic: "واجلس قليلاً.",
      body:
        "سواء كان الصباح الباكر أو الساعة الهادئة قبل الإغلاق — الباب مفتوح، الضوء دافئ، والقهوة جاهزة.",
      addressLabel: "العنوان",
      address: "الصيبوية، الروضة / الرياض ١٣٢١١، المملكة العربية السعودية",
      hoursLabel: "المواعيد",
      hours: [
        { label: "الأحد — الأربعاء", time: "٦:٠٠ ص — ١:٠٠ ص" },
        { label: "الخميس", time: "٦:٠٠ ص — ٢:٠٠ ص" },
        { label: "الجمعة", time: "١٢:٣٠ ظ — ٢:٠٠ ص" },
        { label: "السبت", time: "٦:٠٠ ص — ١:٠٠ ص" },
      ],
      reservationsLabel: "الحجوزات",
      reservations: "reserve@fair-enough.coffee",
      parkingLabel: "المواقف",
      parking: "مواقف شارعية، خدمة صف السيارات بعد ٨ مساءً",
      ctaReserve: "احجز طاولتك",
      ctaDirections: "احصل على الاتجاهات",
    },
    footer: {
      tagline: "رسالة صغيرة، تُطبع يومياً وتُقدم إليك دافئة.",
      arabicName: "قهوة فير اينف",
      emailPlaceholder: "بريدك — رسائل أحياناً، لا رسائل مزعجة",
      send: "إرسال →",
      visit: "الزيارة",
      follow: "تابعنا",
      social: ["إنستغرام", "تيك توك", "غوغل"],
      copyright: "© {{year}} قهوة فير اينف",
      tagline2: "الرياض · قهوة مختصة بوتيكية",
      closing: "Fair لا يعني متساوٍ · Fair يعني...",
    },
    langSwitcher: {
      en: "English",
      ar: "العربية",
    },
  },
};
