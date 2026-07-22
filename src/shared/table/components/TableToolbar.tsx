import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export function TableToolbar({
  children,
}: Props) {
  return (
    <div>
      {children}
    </div>
  );
}