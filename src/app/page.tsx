"use client";

import { I18nProvider } from "@/lib/i18n";
import { CoffeePage } from "@/components/CoffeePage";

export default function Home() {
  return (
    <I18nProvider>
      <CoffeePage />
    </I18nProvider>
  );
}
