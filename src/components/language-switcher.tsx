"use client";

import { useTransition } from "react";
import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { persistLocale } from "@/i18n/client";
import { localeLabels, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("language");
  const [isPending, startRefreshTransition] = useTransition();

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale || isPending) {
      return;
    }

    persistLocale(nextLocale);
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "sm"}
            aria-label={t("change")}
            disabled={isPending}
          />
        }
      >
        <Languages data-icon="inline-start" />
        {!compact && <span>{localeLabels[locale]}</span>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {SUPPORTED_LOCALES.map((nextLocale) => {
            const isActive = locale === nextLocale;

            return (
              <DropdownMenuItem
                key={nextLocale}
                aria-current={isActive ? "true" : undefined}
                onClick={() => changeLocale(nextLocale)}
              >
                <span className="flex-1">
                  {nextLocale === "en" ? t("english") : t("indonesian")}
                </span>
                {isActive && <Check data-icon="inline-end" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
