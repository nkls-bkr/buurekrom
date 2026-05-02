import {Marker, Popup} from "react-leaflet";
import {useLocations} from "@/features/location/api.ts";

export function LocationsLayer() {

    const {data: locations} = useLocations();

    return <>
        <Marker
            position={[10,10]}
        >
            <Popup>
            </Popup>
        </Marker>
    </>
}