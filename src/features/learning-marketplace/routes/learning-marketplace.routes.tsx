import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import { lazy } from "react";

const LearningMarketplacePage = lazy(() => import("../pages/LearningMarketplacePage"));

export const learningMarketplaceRoutes: RouteObject[] = [{ path: "marketplace", element: <ProtectedRoute><LearningMarketplacePage /></ProtectedRoute> }];
