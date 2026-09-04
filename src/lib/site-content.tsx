"use client";

import { useEffect, useState, useRef, createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface HoursEntry {
  label: string;
  time: string;
}

interface MenuItem {
  name: string;
  note: string;
  price?: string;
  body: string;
}

interface SiteImages {
  hero: string;
  philosophyValues: string[];
  coffee: string;
  desserts: string;
  signatureCup: string;
  signatureCups: string;
  gallery: string[];
  visit: string[];
}

interface SiteContent {
  hours: HoursEntry[];
  address: string;
  parking: string;
  reservations: string;
  coffeeItems: MenuItem[];
  dessertItems: MenuItem[];
  images: SiteImages;
}

const DEFAULTS: SiteContent = {
  hours: [
    { label: "Sun — Wed", time: "6:00 AM — 1:00 AM" },
    { label: "Thursday", time: "6:00 AM — 2:00 AM" },
    { label: "Friday", time: "12:30 PM — 2:00 AM" },
    { label: "Saturday", time: "6:00 AM — 1:00 AM" },
  ],
  address: "Riyadh, Saudi Arabia",
  parking: "Street parking",
  reservations: "Kindly notify us at least two hours before your arrival",
  coffeeItems: [],
  dessertItems: [],
  images: {
    hero: "/uploads/5b81f50c-b35f-463b-862f-c9e5a049faf9.png",
    philosophyValues: ["/17.png", "/18.png", "/5.png"],
    coffee: "/4.png",
    desserts: "/13.png",
    signatureCup: "/1.png",
    signatureCups: "/c6.png",
    gallery: ["/2.png", "/5.png", "/c1.png", "/14.png", "/c2.png", "/19.png", "/c7.png"],
    visit: ["/c11.png", "/20.jpg"],
  },
};

interface SiteContentContextValue {
  content: SiteContent;
  loading: boolean;
  refresh: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: DEFAULTS,
  loading: true,
  refresh: () => {},
});

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  function fetchContent() {
    if (isAdminRoute) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++fetchIdRef.current;

    fetch("/api/admin/content", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (id !== fetchIdRef.current) return;
        if (data) {
          setContent({
            hours: data.hours || DEFAULTS.hours,
            address: data.address || DEFAULTS.address,
            parking: data.parking || DEFAULTS.parking,
            reservations: data.reservations || DEFAULTS.reservations,
            coffeeItems: data.coffeeItems?.length ? data.coffeeItems : DEFAULTS.coffeeItems,
            dessertItems: data.dessertItems?.length ? data.dessertItems : DEFAULTS.dessertItems,
            images: { ...DEFAULTS.images, ...(data.images || {}) },
          });
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") console.error("Failed to fetch content:", err);
      })
      .finally(() => {
        if (id === fetchIdRef.current) setLoading(false);
      });
  }

  useEffect(() => {
    fetchContent();
    return () => abortRef.current?.abort();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, refresh: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export type { SiteContent, HoursEntry, MenuItem, SiteImages };
