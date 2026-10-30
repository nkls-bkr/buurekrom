import { Loader2Icon, SunIcon } from "lucide-react";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
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
    <DialogActionButton
      variant={active ? "default" : "outline"}
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={toggle}
    >
      {requesting ? (
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
      ) : (
        <SunIcon data-icon="inline-start" />
      )}
      {label}
    </DialogActionButton>
  );
}
