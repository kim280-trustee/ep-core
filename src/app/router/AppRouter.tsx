import {
  useRoutes,
} from "react-router-dom";

import {
  routes,
} from "./routes";

export function AppRouter() {
  const element = useRoutes(routes);

  return (
    <div>
      {element}
    </div>
  );
}