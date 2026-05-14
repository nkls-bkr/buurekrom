import L from "leaflet";

const pinSvg = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
  <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
</svg>`;

const baseOptions = {
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
} satisfies Partial<L.DivIconOptions>;

export const LOCATION_ICON = L.divIcon({
  ...baseOptions,
  html: pinSvg("#17341d"),
});

export const LOCATION_ICON_SELECTED = L.divIcon({
  ...baseOptions,
  html: pinSvg("#561a00"),
});
