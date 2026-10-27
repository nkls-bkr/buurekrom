import { useLayoutEffect, useRef } from "react";
import type { LatLngLiteral, Map } from "leaflet";

export function useFollowPosition(
  map: Map,
  enabled: boolean,
  position: LatLngLiteral | null,
) {
  const latestPosition = useRef(position);
  const recenter = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    latestPosition.current = position;
    recenter.current?.();
  }, [position]);

  useLayoutEffect(() => {
    if (!enabled) return;
    let suspended = false;
    let centered = false;
    let moving = false;
    const handlers = [map.dragging, map.keyboard, map.boxZoom].filter(
      (handler) => handler.enabled(),
    );
    handlers.forEach((handler) => handler.disable());

    function center() {
      const point = latestPosition.current;
      if (suspended || moving || !point || document.hidden) return;
      moving = true;
      // Zoom in once on activation; preserve the user's zoom afterwards.
      const zoom = centered ? map.getZoom() : Math.max(map.getZoom(), 16);
      centered = true;
      map.stop();
      map.setView(point, zoom, { animate: false });
      moving = false;
    }

    function onDrawing(event: { enabled: boolean }) {
      // Geoman starts drawing before React commits the paused state.
      if (event.enabled) suspended = true;
    }

    recenter.current = center;
    map.on("moveend resize", center);
    map.on("pm:globaldrawmodetoggled", onDrawing);
    document.addEventListener("visibilitychange", center);
    center();
    return () => {
      recenter.current = null;
      map.off("moveend resize", center);
      map.off("pm:globaldrawmodetoggled", onDrawing);
      document.removeEventListener("visibilitychange", center);
      handlers.forEach((handler) => handler.enable());
    };
  }, [map, enabled]);
}
