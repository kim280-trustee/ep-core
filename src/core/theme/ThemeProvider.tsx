import {
  createContext,
  useState,
  type ReactNode,
} from "react";

import type {
  ThemeMode,
} from "./theme.types";

interface Context {
  theme: ThemeMode;
  setTheme: (
    theme: ThemeMode,
  ) => void;
}

export const ThemeContext =
  createContext<Context | null>(
    null,
  );

interface Props {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: Props) {
  const [
    theme,
    setTheme,
  ] = useState<ThemeMode>(
    "light",
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}