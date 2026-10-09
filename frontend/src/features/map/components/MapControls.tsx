import { useEffect, useRef, type ReactNode } from "react";
import { DomEvent } from "leaflet";

export function MapControls({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    DomEvent.disableClickPropagation(element);
    DomEvent.disableScrollPropagation(element);
    return () => {
      DomEvent.off(element);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="map-controls absolute z-1000 flex flex-col-reverse gap-4"
    >
      {children}
    </div>
  );
}
