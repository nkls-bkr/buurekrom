import { useState } from "react";
import { Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteRouteMutation,
  type RouteResponse,
} from "@/features/routes/api";

interface RouteToolbarProps {
  route: RouteResponse | null;
  onClose: () => void;
}

export function RouteToolbar({ route, onClose }: RouteToolbarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteRoute = useDeleteRouteMutation();

  function handleConfirm() {
    if (!route) return;
    deleteRoute.mutate(
      { fieldId: route.fieldId, routeId: route.id },
      {
        onSuccess: () => {
          toast.success("Route gelöscht.");
          setConfirmOpen(false);
          onClose();
        },
        onError: () => {
          toast.error("Route konnte nicht gelöscht werden.");
        },
      },
    );
  }

  return (
    <>
      {route && (
        <div className="absolute top-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Schließen"
          >
            <XIcon className="size-4" />
          </Button>
          <span className="text-label-md">{route.name ?? "Route"}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-1.5"
          >
            <Trash2Icon className="size-4" />
            Löschen
          </Button>
        </div>
      )}

      <Dialog
        open={confirmOpen && !!route}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Route löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirm} disabled={deleteRoute.isPending}>
              {deleteRoute.isPending ? "Löschen …" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
