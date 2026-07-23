"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from "react";

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
  address: "Saybawiyyah, Ar Rawdah / Riyadh 13211, Saudi Arabia",
  parking: "Street parking",
  reservations: "Kindly notify us at least two hours before your arrival",
  coffeeItems: [],
  dessertItems: [],
  images: {
    hero: "/16.png",
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

  function fetchContent() {
    fetch("/api/admin/content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, refresh: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export type { SiteContent, HoursEntry, MenuItem, SiteImages };
