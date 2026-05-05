import { Marker, Popup, useMap } from "react-leaflet";
import { useLocations } from "@/features/location/api.ts";

export function LocationsLayer() {
  const { data: locations } = useLocations();

  console.log(locations);

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
