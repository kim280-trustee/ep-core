import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export function Header({
  children,
}: Props) {
  return (
    <header>
      {children}
    </header>
  );
}