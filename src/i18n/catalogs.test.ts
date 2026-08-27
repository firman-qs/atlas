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

function interpolationArguments(messages: Catalog, prefix = ""): Record<string, string[]> {
  const argumentsByMessage: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      Object.assign(argumentsByMessage, interpolationArguments(value, path));
    } else if (typeof value === "string") {
      argumentsByMessage[path] = Array.from(
        value.matchAll(/{([a-zA-Z][\w]*)[,}]/g),
        ([, name]) => name,
      ).sort();
    }
  }

  return argumentsByMessage;
}

function isObject(value: unknown): value is Catalog {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

describe("message catalogs", () => {
  it("keeps Indonesian catalog keys and ICU arguments aligned with English", () => {
    expect(flattenKeys(idMessages)).toEqual(flattenKeys(enMessages));
    expect(interpolationArguments(idMessages)).toEqual(interpolationArguments(enMessages));
  });

  it("binds ICU arguments to their message key", () => {
    const english = {
      students: "{studentCount} students",
      assignments: "{assignmentCount} assignments",
    };
    const swappedIndonesian = {
      students: "{assignmentCount} students",
      assignments: "{studentCount} assignments",
    };

    expect(interpolationArguments(swappedIndonesian)).not.toEqual(interpolationArguments(english));
  });

  it("overrides English with Indonesian messages", () => {
    expect((loadMessages("id") as typeof idMessages).common.save).toBe("Simpan");
  });

  it("falls back to English for missing selected-locale messages", () => {
    expect((mergeWithEnglish({common: {save: "Simpan"}}) as typeof enMessages).common.cancel).toBe("Cancel");
  });
});
