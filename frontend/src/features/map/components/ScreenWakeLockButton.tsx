import { Loader2Icon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useScreenWakeLock } from "@/features/map/useScreenWakeLock";

export function ScreenWakeLockButton({
  enabled,
  active,
  requesting,
  toggle,
}: ReturnType<typeof useScreenWakeLock>) {
  const label = requesting
    ? "Display wach halten wird aktiviert – abbrechen"
    : enabled
      ? "Display wach halten ausschalten"
      : "Display wach halten";

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="icon"
      className="shadow-card"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={toggle}
    >
      {requesting ? <Loader2Icon className="animate-spin" /> : <SunIcon />}
    </Button>
  );
}
