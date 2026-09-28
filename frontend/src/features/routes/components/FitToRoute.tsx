import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { fitToCoordinates } from "@/features/map/mapNavigation";
import type { SharedRouteResponse } from "@/features/routes/api";

export function FitToRoute({ route }: { route: SharedRouteResponse }) {
  const map = useMap();
  useEffect(() => {
    fitToCoordinates(map, route.geometry.coordinates);
  }, [map, route]);
  return null;
}