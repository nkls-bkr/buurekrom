import { useCallback, useMemo, useState, type ReactNode } from "react";
import { RouteVisibilityContext } from "./visibility";

interface VisibilityProviderProps {
  children: ReactNode;
}

export function VisibilityProvider({ children }: VisibilityProviderProps) {
  const [visibleRouteIds, setVisibleRouteIds] = useState<Set<number>>(
    new Set(),
  );

  const toggleRoute = useCallback((routeId: number) => {
    setVisibleRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  }, []);

  const showRoute = useCallback((routeId: number) => {
    setVisibleRouteIds((previous) => new Set(previous).add(routeId));
  }, []);

  const showAll = useCallback((routeIds: number[]) => {
    setVisibleRouteIds(new Set(routeIds));
  }, []);

  const hideAll = useCallback(() => {
    setVisibleRouteIds(new Set());
  }, []);

  const isVisible = useCallback(
    (routeId: number) => visibleRouteIds.has(routeId),
    [visibleRouteIds],
  );

  const value = useMemo(
    () => ({
      visibleRouteIds,
      toggleRoute,
      showRoute,
      showAll,
      hideAll,
      isVisible,
    }),
    [visibleRouteIds, toggleRoute, showRoute, showAll, hideAll, isVisible],
  );

  return (
    <RouteVisibilityContext.Provider value={value}>
      {children}
    </RouteVisibilityContext.Provider>
  );
}
