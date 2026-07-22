import type {
  ReactNode,
} from "react";

import {
  ProtectedRoute,
} from "@/core/auth";

interface Props {
  children: ReactNode;
}

export function RouteGuard({
  children,
}: Props) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}