import { useCallback, useState } from "react";
import type { LatLngLiteral } from "leaflet";

export function useOwnPosition() {
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [locationFailed, setLocationFailed] = useState(false);

  const handlePosition = useCallback((pos: LatLngLiteral) => {
    setPosition(pos);
    setLocationFailed(false);
  }, []);

  const handleLocationError = useCallback(() => setLocationFailed(true), []);

  const handleLocationRequest = useCallback(() => setLocationFailed(false), []);

  return {
    position,
    locationFailed,
    handlePosition,
    handleLocationError,
    handleLocationRequest,
  };
}
