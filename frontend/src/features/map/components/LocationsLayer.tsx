import { Marker, Popup } from "react-leaflet";
import { useLocations } from "@/features/location/api.ts";

export function LocationsLayer() {
  const { data: locations } = useLocations();

  return (
    <>
      {locations?.map((location) => (
        <Marker
          position={{
            lat: location.geometry.coordinates[1],
            lng: location.geometry.coordinates[0],
          }}
        >
          <Popup></Popup>
        </Marker>
      ))}
    </>
  );
}
