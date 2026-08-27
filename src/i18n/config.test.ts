import {describe, expect, it} from "vitest";
import {DEFAULT_LOCALE, isLocale, resolveLocale} from "@/i18n/config";

describe("locale configuration", () => {
  it("defaults missing and unsupported values to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("fr")).toBe("en");
  });

  it("accepts only the supported English and Indonesian locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en-US")).toBe(false);
  });
});
