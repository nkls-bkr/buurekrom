export function describeGeolocationError(
  error: GeolocationPositionError,
): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Standortzugriff wurde verweigert. Bitte Berechtigung im Browser erlauben.";
    case error.POSITION_UNAVAILABLE:
      return "Standort ist derzeit nicht verfügbar.";
    case error.TIMEOUT:
      return "Standortabfrage hat zu lange gedauert.";
    default:
      return "Standort konnte nicht ermittelt werden.";
  }
}
