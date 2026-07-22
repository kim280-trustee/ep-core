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

let currentLanguage: Language =
  "en";

export function setLanguage(
  language: Language,
) {
  currentLanguage =
    language;
}

export function translate(
  key: string,
) {
  const keys =
    key.split(".");

  let value: unknown =
    languages[
      currentLanguage
    ];

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