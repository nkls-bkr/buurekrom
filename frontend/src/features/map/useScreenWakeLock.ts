import { useEffect, useState } from "react";
import { toast } from "sonner";

type WakeLockStatus = "requesting" | "active" | "paused";

export function useScreenWakeLock() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<WakeLockStatus>("paused");

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let requestId = 0;
    let sentinel: WakeLockSentinel | null = null;

    function release() {
      const previous = sentinel;
      sentinel = null;
      // Clear our reference first so an intentional release cannot be mistaken
      // for the operating system withdrawing an active wake lock.
      void previous?.release().catch(() => {});
    }

    async function acquire() {
      const currentRequest = ++requestId;
      try {
        const acquired = await navigator.wakeLock.request("screen");
        // Requests can finish after switching tabs, toggling off or unmounting.
        // Always release those handles instead of leaving an orphaned lock.
        if (disposed || currentRequest !== requestId || document.hidden) {
          await acquired.release();
          return;
        }
        if (acquired.released) throw new Error("Wake lock already released");
        sentinel = acquired;
        acquired.addEventListener(
          "release",
          () => {
            if (disposed || sentinel !== acquired) return;
            sentinel = null;
            if (document.hidden) {
              setStatus("paused");
            } else {
              setEnabled(false);
              setStatus("paused");
              toast.info("Das Gerät hat „Display wach halten“ beendet.");
            }
          },
          { once: true },
        );
        setStatus("active");
      } catch {
        if (disposed || currentRequest !== requestId) return;
        setStatus("paused");
        if (!document.hidden) {
          setEnabled(false);
          toast.error(
            "Display konnte nicht wach gehalten werden. Möglicherweise verhindert der Energiesparmodus die Aktivierung.",
          );
        }
      }
    }

    function onVisibilityChange() {
      ++requestId;
      release();
      if (document.hidden) {
        setStatus("paused");
      } else {
        setStatus("requesting");
        void acquire();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) void acquire();
    return () => {
      disposed = true;
      ++requestId;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      release();
    };
  }, [enabled]);

  function enable() {
    if (enabled) return;
    if (
      !window.isSecureContext ||
      typeof navigator.wakeLock?.request !== "function"
    ) {
      toast.error(
        "Display wach halten ist hier nicht verfügbar. Verwende einen aktuellen Browser und öffne die Seite über HTTPS.",
      );
      return;
    }
    setStatus("requesting");
    setEnabled(true);
  }

  function toggle() {
    if (enabled) {
      setEnabled(false);
      setStatus("paused");
    } else {
      enable();
    }
  }

  return {
    enabled,
    active: enabled && status === "active",
    requesting: enabled && status === "requesting",
    enable,
    toggle,
  };
}
