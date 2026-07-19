import * as Popover from "@radix-ui/react-popover";
import { Check, Globe } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const options: { value: Lang; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "ar", label: "العربية", native: "العربية" },
];

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={[
            "group inline-flex items-center gap-2 text-[0.72rem] tracking-eyebrow text-foreground/60 transition-colors hover:text-foreground focus:outline-none",
            className,
          ].join(" ")}
          aria-label={t("langSwitcher.en") + " / " + t("langSwitcher.ar")}
        >
          <Globe className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
          <span>EN</span>
          <span className="opacity-40">/</span>
          <span className="font-arabic text-sm">ع</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="end"
          className="z-[100] min-w-[10rem] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-1.5 shadow-soft backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <div className="flex flex-col gap-0.5">
            {options.map((opt) => {
              const active = lang === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLang(opt.value)}
                  className={[
                    "flex w-full items-center justify-between gap-6 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-foreground/5 text-foreground"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                  ].join(" ")}
                >
                  <span className={opt.value === "ar" ? "font-arabic" : ""}>{opt.native}</span>
                  {active && <Check className="h-3.5 w-3.5 text-gold" strokeWidth={2} />}
                </button>
              );
            })}
          </div>
          <Popover.Arrow className="fill-background/95" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
