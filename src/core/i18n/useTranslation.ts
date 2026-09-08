import { useSyncExternalStore } from "react";

import {
  translate,
  setLanguage,
  getLanguage,
  subscribeToLanguage,
} from "./i18n";

export function useTranslation() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguage,
    getLanguage,
  );

  return {
    t: translate,
    language,
    changeLanguage: setLanguage,
  };
}
