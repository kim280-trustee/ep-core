export type ThemeMode =
  | "light"
  | "dark";

export interface Theme {
  name: string;
  mode: ThemeMode;
}