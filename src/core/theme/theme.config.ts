import type {
  Theme,
} from "./theme.types";

export const themes = {
  light: {
    name: "Light",
    mode: "light",
  },

  dark: {
    name: "Dark",
    mode: "dark",
  },
} satisfies Record<
  string,
  Theme
>;