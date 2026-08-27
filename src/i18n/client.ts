"use client";

import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/i18n/config";

export function persistLocale(locale: Locale): void {
  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}`,
    `max-age=${LOCALE_COOKIE_MAX_AGE}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
  document.documentElement.lang = locale;
}
