import {
  useState,
  type ReactNode,
} from "react";

import {
  ThemeContext,
} from "./theme.context";

import type {
  ThemeMode,
} from "./theme.types";

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