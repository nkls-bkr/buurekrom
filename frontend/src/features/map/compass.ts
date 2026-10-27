export interface CompassReading {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function angleDifference(from: number, to: number): number {
  return normalizeDegrees(to - from + 180) - 180;
}

// Heading of the top of the visible screen, clockwise from north. Relative
// alpha values have an arbitrary origin and must never be used as a compass.
export function compassHeading(
  reading: CompassReading,
  screenAngle: number,
): number | null {
  if (Number.isFinite(reading.webkitCompassHeading)) {
    const accuracy = reading.webkitCompassAccuracy;
    if (
      accuracy !== undefined &&
      (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 45)
    ) {
      return null;
    }
    return normalizeDegrees(reading.webkitCompassHeading! + screenAngle);
  }

  if (
    !reading.absolute ||
    reading.alpha === null ||
    !Number.isFinite(reading.alpha)
  ) {
    return null;
  }

  const radians = Math.PI / 180;
  const alpha = reading.alpha * radians;
  const beta = (reading.beta ?? 0) * radians;
  const gamma = (reading.gamma ?? 0) * radians;
  const screen = screenAngle * radians;
  // Project the screen's up vector onto the earth's horizontal plane using
  // DeviceOrientation's intrinsic Z-X'-Y'' rotations. This handles landscape
  // and tilted phones, not just a phone lying flat on a table.
  const east =
    Math.sin(screen) *
      (Math.cos(alpha) * Math.cos(gamma) -
        Math.sin(alpha) * Math.sin(beta) * Math.sin(gamma)) -
    Math.cos(screen) * Math.sin(alpha) * Math.cos(beta);
  const north =
    Math.sin(screen) *
      (Math.sin(alpha) * Math.cos(gamma) +
        Math.cos(alpha) * Math.sin(beta) * Math.sin(gamma)) +
    Math.cos(screen) * Math.cos(alpha) * Math.cos(beta);

  // A screen pointing nearly straight up has no stable horizontal heading.
  if (
    !Number.isFinite(east) ||
    !Number.isFinite(north) ||
    Math.hypot(east, north) < 0.1
  ) {
    return null;
  }
  return normalizeDegrees(Math.atan2(east, north) / radians);
}
