import { createContext, useContext } from "react";

export interface RouteVisibilityContextValue {
  visibleRouteIds: Set<number>;
  toggleRoute: (routeId: number) => void;
  showAll: (routeIds: number[]) => void;
  hideAll: () => void;
  isVisible: (routeId: number) => boolean;
}

export const RouteVisibilityContext =
  createContext<RouteVisibilityContextValue | null>(null);

export function useRouteVisibility(): RouteVisibilityContextValue {
  const context = useContext(RouteVisibilityContext);
  if (!context) {
    throw new Error(
      "useRouteVisibility must be used within RouteVisibilityProvider",
    );
  }
  return context;
}
