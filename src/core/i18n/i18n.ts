import {
  en,
} from "./locales/en";

import {
  th,
} from "./locales/th";

import {
  sw,
} from "./locales/sw";

export const languages = {
  en,
  th,
  sw,
};

export type Language =
  keyof typeof languages;

let currentLanguage: Language = "en";

const listeners = new Set<() => void>();

export function setLanguage(
  language: Language,
) {
  currentLanguage = language;

  listeners.forEach((listener) => {
    listener();
  });
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function subscribeToLanguage(
  listener: () => void,
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function translate(
  key: string,
) {
  const keys = key.split(".");

  let value: unknown =
    languages[currentLanguage];

  for (const item of keys) {
    if (
      typeof value === "object" &&
      value !== null
    ) {
      value =
        (value as Record<string, unknown>)[
          item
        ];
    }
  }

  return typeof value === "string"
    ? value
    : key;
}
