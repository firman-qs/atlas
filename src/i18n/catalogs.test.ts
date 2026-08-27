import {describe, expect, it} from "vitest";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import {loadMessages, mergeWithEnglish} from "@/i18n/messages";

type Catalog = Record<string, unknown>;

function flattenKeys(messages: Catalog, prefix = ""): string[] {
  return Object.entries(messages)
    .flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      return isObject(value) ? flattenKeys(value, path) : [path];
    })
    .sort();
}

function interpolationArguments(messages: Catalog): string[] {
  return Object.values(messages)
    .flatMap((value) => {
      if (isObject(value)) return interpolationArguments(value);
      if (typeof value !== "string") return [];

      return Array.from(value.matchAll(/{([a-zA-Z][\w]*)[,}]/g), ([, name]) => name).sort();
    })
    .sort();
}

function isObject(value: unknown): value is Catalog {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

describe("message catalogs", () => {
  it("keeps Indonesian catalog keys and ICU arguments aligned with English", () => {
    expect(flattenKeys(idMessages)).toEqual(flattenKeys(enMessages));
    expect(interpolationArguments(idMessages)).toEqual(interpolationArguments(enMessages));
  });

  it("overrides English with Indonesian messages", () => {
    expect((loadMessages("id") as typeof idMessages).common.save).toBe("Simpan");
  });

  it("falls back to English for missing selected-locale messages", () => {
    expect((mergeWithEnglish({common: {save: "Simpan"}}) as typeof enMessages).common.cancel).toBe("Cancel");
  });
});
