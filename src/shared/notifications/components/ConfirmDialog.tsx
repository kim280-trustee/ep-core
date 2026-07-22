import type {
  ReactNode,
} from "react";

interface Props {
  open: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  children,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div>
      {children}
    </div>
  );
}