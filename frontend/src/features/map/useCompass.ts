import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Browser, type Map } from "leaflet";
import { toast } from "sonner";
import { angleDifference, compassHeading, normalizeDegrees } from "./compass";

type CompassStatus = "off" | "requesting" | "waiting" | "active";
type CompassMode = "compass" | "navigation";
type OrientationPermission = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<PermissionState>;
};

export function useCompass(map: Map, editing: boolean) {
  const [status, setStatus] = useState<CompassStatus>("off");
  const [mode, setMode] = useState<CompassMode>("compass");
  const [drawing, setDrawing] = useState(false);
  const permissionRequest = useRef(0);
  const stopTracking = useRef<(() => void) | null>(null);
  const paused = editing || drawing;
  const enabled = status === "waiting" || status === "active";

  useEffect(() => {
    return () => {
      permissionRequest.current += 1;
    };
  }, []);

  useEffect(() => {
    function drawModeChanged(event: { enabled: boolean }) {
      // Stop synchronously: Geoman emits this inside enableDraw(), before the
      // React state update commits. No pending animation may move its handles.
      if (event.enabled) {
        stopTracking.current?.();
        map.setBearing(0);
      }
      setDrawing(event.enabled);
    }
    map.on("pm:globaldrawmodetoggled", drawModeChanged);
    return () => {
      map.off("pm:globaldrawmodetoggled", drawModeChanged);
    };
  }, [map]);

  useLayoutEffect(() => {
    map.setBearing(0);
    if (!enabled || paused) return;

    let stopped = false;
    let frame = 0;
    let timeout = 0;
    let target: number | null = null;
    let lastFrame = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function stopAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    }

    function armTimeout() {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        stop();
        setStatus("off");
        toast.error(
          "Keine verlässlichen Kompassdaten verfügbar. Die Karte bleibt nach Norden ausgerichtet.",
        );
      }, 8000);
    }

    function animate(time: number) {
      frame = 0;
      if (stopped || target === null) return;
      const current = map.getBearing();
      const difference = angleDifference(current, target);
      const elapsed = lastFrame ? Math.min(time - lastFrame, 64) : 16;
      lastFrame = time;
      if (Math.abs(difference) < 0.2 || reducedMotion) {
        map.setBearing(target);
        lastFrame = 0;
        return;
      }
      map.setBearing(
        normalizeDegrees(current + difference * (1 - Math.exp(-elapsed / 120))),
      );
      frame = requestAnimationFrame(animate);
    }

    function onOrientation(event: DeviceOrientationEvent) {
      if (stopped || document.hidden) return;
      const screenAngle =
        window.screen.orientation?.angle ??
        (typeof window.orientation === "number" ? window.orientation : 0);
      const heading = compassHeading(event, screenAngle);
      if (heading === null) return;
      // Some browsers emit events only when the phone moves. Once acquired,
      // a stationary heading must remain active even without further events.
      window.clearTimeout(timeout);
      setStatus("active");
      const bearing = normalizeDegrees(-heading);
      if (target !== null && Math.abs(angleDifference(target, bearing)) < 1.5)
        return;
      target = bearing;
      if (!frame) frame = requestAnimationFrame(animate);
    }

    function onVisibilityChange() {
      stopAnimation();
      window.clearTimeout(timeout);
      target = null;
      map.setBearing(0);
      if (!document.hidden) {
        setStatus("waiting");
        armTimeout();
      }
    }

    function stop() {
      stopped = true;
      stopAnimation();
      window.clearTimeout(timeout);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("deviceorientationabsolute", onOrientation);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      map.setBearing(0);
    }

    stopTracking.current = stop;
    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("deviceorientationabsolute", onOrientation);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) armTimeout();
    return () => {
      stop();
      stopTracking.current = null;
    };
  }, [map, enabled, paused]);

  async function toggle(nextMode: CompassMode = "compass") {
    // Both controls share one sensor subscription and permission request.
    if (status !== "off" && mode !== nextMode && nextMode === "navigation") {
      setMode(nextMode);
      return true;
    }
    const request = ++permissionRequest.current;
    if (status !== "off") {
      stopTracking.current?.();
      map.setBearing(0);
      setStatus("off");
      return;
    }
    if (paused) return;
    setMode(nextMode);
    if (
      !window.isSecureContext ||
      !window.DeviceOrientationEvent ||
      !Browser.any3d
    ) {
      toast.error(
        "Der Kompass ist hier nicht verfügbar. Öffne die App auf einem Smartphone über HTTPS.",
      );
      return;
    }
    setStatus("requesting");
    try {
      const orientation =
        window.DeviceOrientationEvent as OrientationPermission;
      // Must run directly in the button's click handler for iOS permission.
      const permission = orientation.requestPermission
        ? await orientation.requestPermission(true)
        : "granted";
      if (request !== permissionRequest.current) return;
      if (permission !== "granted") {
        setStatus("off");
        toast.error(
          "Kompasszugriff nicht erlaubt. Die Karte bleibt nach Norden ausgerichtet.",
        );
        return;
      }
      setStatus("waiting");
      return true;
    } catch {
      if (request !== permissionRequest.current) return;
      setStatus("off");
      toast.error(
        "Kompass konnte nicht aktiviert werden. Prüfe die Sensorfreigabe im Browser.",
      );
    }
  }

  return { status, paused, mode, toggle };
}
