import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function FormActions({
  children,
}: Props) {
  return (
    <div className="
      mt-6
      flex
      flex-col-reverse
      gap-3
      border-t
      border-gray-200
      pt-5
      sm:flex-row
      sm:items-center
      sm:justify-end
    ">
      {children}
    </div>
  );
}
