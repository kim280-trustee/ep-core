import {
  translate,
  setLanguage,
  type Language,
} from "./i18n";

export function useTranslation() {
  return {
    t: translate,

    changeLanguage:
      (language: Language) =>
        setLanguage(language),
  };
}