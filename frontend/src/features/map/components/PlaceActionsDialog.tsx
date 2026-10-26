import { useState } from "react";
import { EllipsisIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteFieldsMutation } from "@/features/fields/api";
import { useDeleteLocationMutation } from "@/features/location/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

const LABELS = {
  [SelectionKind.Field]: {
    fallback: "Feld",
    description: "Was möchtest du mit diesem Feld machen?",
    aria: "Feld löschen",
    title: "Feld löschen?",
    success: "Feld gelöscht.",
    failure: "Feld konnte nicht gelöscht werden.",
  },
  [SelectionKind.Location]: {
    fallback: "Standort",
    description: "Was möchtest du mit diesem Standort machen?",
    aria: "Standort löschen",
    title: "Standort löschen?",
    success: "Standort gelöscht.",
    failure: "Standort konnte nicht gelöscht werden.",
  },
} as const;

export function PlaceActionsDialog({
  kind,
  id,
  name,
}: {
  kind: typeof SelectionKind.Field | typeof SelectionKind.Location;
  id: number;
  name: string | null;
}) {
  const { selection, clear } = useSelection();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFields = useDeleteFieldsMutation();
  const deleteLocation = useDeleteLocationMutation();

  const labels = LABELS[kind];
  const isPending = deleteFields.isPending || deleteLocation.isPending;

  function handleConfirm() {
    const onSuccess = () => {
      toast.success(labels.success);
      setOpen(false);
      if (selection?.kind === kind && selection.id === id) clear();
    };
    const onError = () => {
      toast.error(labels.failure);
    };

    switch (kind) {
      case SelectionKind.Field:
        deleteFields.mutate([id], { onSuccess, onError });
        break;
      case SelectionKind.Location:
        deleteLocation.mutate(id, { onSuccess, onError });
        break;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
        if (next) setConfirmOpen(false);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Aktionen für ${name || `${labels.fallback} #${id}`}`}
          />
        }
      >
        <EllipsisIcon />
      </DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>
            {confirmOpen ? labels.title : name || `${labels.fallback} #${id}`}
          </DialogTitle>
          <DialogDescription>
            {confirmOpen
              ? "Diese Aktion kann nicht rückgängig gemacht werden."
              : labels.description}
          </DialogDescription>
        </DialogHeader>
        {confirmOpen ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Löschen …" : labels.aria}
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Zurück
            </Button>
          </div>
        ) : (
          <DialogActionButton
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2Icon /> {labels.aria}
          </DialogActionButton>
        )}
      </DialogContent>
    </Dialog>
  );
}
