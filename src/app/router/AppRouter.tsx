import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

export function AppRouter() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<div role="status" aria-live="polite">Loading page…</div>}>
      <div>{element}</div>
    </Suspense>
  );
}
