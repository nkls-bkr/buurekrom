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
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

export function DeleteFieldsButton() {
  const { selection, clear } = useSelection();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFields = useDeleteFieldsMutation();

  const selectedFieldId =
    selection?.kind === SelectionKind.Field ? selection.id : null;

  function handleConfirm() {
    if (selectedFieldId === null) return;
    deleteFields.mutate([selectedFieldId], {
      onSuccess: () => {
        toast.success("Feld gelöscht.");
        setConfirmOpen(false);
        clear();
      },
      onError: () => {
        toast.error("Feld konnte nicht gelöscht werden.");
      },
    });
  }

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setConfirmOpen(true)}
        disabled={selectedFieldId === null}
        className="relative shadow-card"
        aria-label="Feld löschen"
      >
        <Trash2Icon className="size-4" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feld löschen?</DialogTitle>
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
              disabled={deleteFields.isPending}
            >
              {deleteFields.isPending ? "Löschen …" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
