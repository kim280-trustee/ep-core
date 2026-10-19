import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import LearningMarketplacePage from "../pages/LearningMarketplacePage";
export const learningMarketplaceRoutes: RouteObject[] = [{ path: "marketplace", element: <ProtectedRoute><LearningMarketplacePage /></ProtectedRoute> }];
