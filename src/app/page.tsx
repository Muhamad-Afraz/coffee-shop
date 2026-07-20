"use client";

import { I18nProvider } from "@/lib/i18n";
import { FairPage } from "@/components/FairPage";

export default function Home() {
  return (
    <I18nProvider>
      <FairPage />
    </I18nProvider>
  );
}
