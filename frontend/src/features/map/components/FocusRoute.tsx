import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useLocation, useSearchParams } from "react-router-dom";
import { useRoutes } from "@/features/routes/api";
import { useRouteVisibility } from "@/features/routes/visibility/visibility";
import { fitToCoordinates } from "@/features/map/mapNavigation";
import { SelectionKind, useSelection } from "@/features/map/selection/selection";

export function FocusRoute() {
  const map = useMap();
  const { key } = useLocation();
  const [searchParams] = useSearchParams();
  const routeId = Number(searchParams.get("route"));
  const { data: routes } = useRoutes();
  const { isVisible, toggleRoute } = useRouteVisibility();
  const { select } = useSelection();
  const focusedNavigation = useRef<string | null>(null);

  useEffect(() => {
    if (focusedNavigation.current === key) return;
    if (!Number.isSafeInteger(routeId) || routeId <= 0) return;
    const route = routes?.find((route) => route.id === routeId);
    if (!route) return;

    // Focus once per navigation, so refetching does not undo manual panning.
    focusedNavigation.current = key;
    if (!isVisible(route.id)) toggleRoute(route.id);
    select(SelectionKind.Route, route.id);
    map.invalidateSize({ pan: false });
    fitToCoordinates(map, route.geometry.coordinates, {
      paddingTopLeft: [48, 80],
      paddingBottomRight: [80, 48],
      maxZoom: 17,
      animate: false,
    });
  }, [key, routeId, routes, map, isVisible, toggleRoute, select]);

  return null;
}
