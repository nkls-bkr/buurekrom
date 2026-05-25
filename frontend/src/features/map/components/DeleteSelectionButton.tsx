import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteFieldsMutation } from "@/features/fields/api";
import { useDeleteLocationMutation } from "@/features/location/api";
import { useDeleteRouteMutation } from "@/features/routes/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

const LABELS = {
  [SelectionKind.Field]: {
    aria: "Feld löschen",
    title: "Feld löschen?",
    success: "Feld gelöscht.",
    failure: "Feld konnte nicht gelöscht werden.",
  },
  [SelectionKind.Location]: {
    aria: "Standort löschen",
    title: "Standort löschen?",
    success: "Standort gelöscht.",
    failure: "Standort konnte nicht gelöscht werden.",
  },
  [SelectionKind.Route]: {
    aria: "Route löschen",
    title: "Route löschen?",
    success: "Route gelöscht.",
    failure: "Route konnte nicht gelöscht werden.",
  },
} as const;

export function DeleteSelectionButton() {
  const { selection, clear } = useSelection();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFields = useDeleteFieldsMutation();
  const deleteLocation = useDeleteLocationMutation();
  const deleteRoute = useDeleteRouteMutation();

  const labels = selection ? LABELS[selection.kind] : null;
  const isPending =
    deleteFields.isPending || deleteLocation.isPending || deleteRoute.isPending;

  function handleConfirm() {
    if (!selection) return;
    const onSuccess = () => {
      toast.success(LABELS[selection.kind].success);
      setConfirmOpen(false);
      clear();
    };
    const onError = () => {
      toast.error(LABELS[selection.kind].failure);
    };

    switch (selection.kind) {
      case SelectionKind.Field:
        deleteFields.mutate([selection.id], { onSuccess, onError });
        break;
      case SelectionKind.Location:
        deleteLocation.mutate(selection.id, { onSuccess, onError });
        break;
      case SelectionKind.Route:
        deleteRoute.mutate(selection.id, { onSuccess, onError });
        break;
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setConfirmOpen(true)}
        disabled={selection === null}
        className="relative shadow-card"
        aria-label={labels?.aria ?? "Auswahl löschen"}
      >
        <Trash2Icon className="size-4" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels?.title ?? "Löschen?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Löschen …" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
