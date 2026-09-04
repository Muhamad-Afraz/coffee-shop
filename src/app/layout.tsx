import type { Metadata } from "next";
import { Inter, Amiri, Great_Vibes } from "next/font/google";
import { SmoothScrolling } from "@/components/smooth-scrolling";
import { AuthProvider } from "@/lib/auth-context";
import { SiteContentProvider } from "@/lib/site-content";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coffee-house.vercel.app"),
  title: "Coffee House — Specialty Coffee, Riyadh",
  description:
    "A boutique specialty coffee house in Riyadh. Handwritten cups, warm hospitality, quiet luxury — open until 2 AM.",
  authors: [{ name: "Coffee House" }],
  icons: {
    icon: "/favicon.svg?v=6",
  },
  openGraph: {
    title: "Coffee House — Specialty Coffee, Riyadh",
    description:
      "A boutique specialty coffee house in Riyadh. Handwritten cups, warm hospitality, quiet luxury.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

const langInitScript = `
(function() {
  try {
    if (window.history && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    var lang = localStorage.getItem('app-lang');
    if (lang === 'ar' || lang === 'en') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${amiri.variable} ${greatVibes.variable}`}>
        <SmoothScrolling>
          <SiteContentProvider>
            <AuthProvider>{children}</AuthProvider>
          </SiteContentProvider>
        </SmoothScrolling>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
