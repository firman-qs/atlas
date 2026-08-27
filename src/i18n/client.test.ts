import { afterEach, describe, expect, it } from "vitest";

import { LOCALE_COOKIE_NAME } from "@/i18n/config";
import { persistLocale } from "@/i18n/client";

describe("persistLocale", () => {
  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; max-age=0; path=/`;
    document.documentElement.lang = "en";
  });

  it("persists Indonesian and updates the document language", () => {
    persistLocale("id");

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=id`);
    expect(document.documentElement.lang).toBe("id");
  });

  it("persists English and updates the document language", () => {
    persistLocale("en");

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
    expect(document.documentElement.lang).toBe("en");
  });
});
