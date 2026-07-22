import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function FormActions({
  children,
}: Props) {
  return (
    <div>
      {children}
    </div>
  );
}