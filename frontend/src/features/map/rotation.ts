import "leaflet";
import "leaflet-rotate";
import type { MapOptions } from "leaflet";

declare module "leaflet" {
  interface MapOptions {
    rotate?: boolean;
    rotateControl?: boolean;
    touchRotate?: boolean;
    shiftKeyRotate?: boolean;
    compassBearing?: boolean;
  }

  interface Map {
    setBearing(degrees: number): void;
    getBearing(): number;
  }
}

// Only our explicit compass control may rotate the map. In particular, keep
// the plugin's automatic sensor handler and default wheel/control UI disabled.
export const ROTATABLE_MAP_OPTIONS: MapOptions = {
  rotate: true,
  rotateControl: false,
  touchRotate: false,
  shiftKeyRotate: false,
  compassBearing: false,
};
