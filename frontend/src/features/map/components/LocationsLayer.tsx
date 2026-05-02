import {Marker, Popup} from "react-leaflet";
import {useLocations} from "@/features/location/api.ts";
import { divIcon } from "leaflet";

export function LocationsLayer() {


    const locationIcon = divIcon({
        html: `<div class="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    const {data: locations} = useLocations();

    return <>
        <Marker
            position={[10,10]}
            icon={locationIcon}
        >
            <Popup>
                Reitanlage Gut-Hohn
            </Popup>
        </Marker>
    </>
}