import type {AbstractIntlMessages} from "next-intl";
import {type Locale} from "@/i18n/config";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";

function isMessageObject(value: unknown): value is AbstractIntlMessages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeMessages(
  english: AbstractIntlMessages,
  messages: AbstractIntlMessages,
): AbstractIntlMessages {
  const merged: AbstractIntlMessages = {...english};

  for (const [key, value] of Object.entries(messages)) {
    const englishValue = english[key];
    merged[key] =
      isMessageObject(englishValue) && isMessageObject(value)
        ? mergeMessages(englishValue, value)
        : value;
  }

  return merged;
}

export function mergeWithEnglish(messages: AbstractIntlMessages): AbstractIntlMessages {
  return mergeMessages(enMessages, messages);
}

export function loadMessages(locale: Locale): AbstractIntlMessages {
  return mergeWithEnglish(locale === "id" ? idMessages : enMessages);
}
