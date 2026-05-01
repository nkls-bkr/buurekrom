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

interface DeleteFieldsButtonProps {
  selectedIds: ReadonlySet<number>;
  onCleared: () => void;
}

export function DeleteFieldsButton({
  selectedIds,
  onCleared,
}: DeleteFieldsButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFields = useDeleteFieldsMutation();
  const count = selectedIds.size;

  function handleConfirm() {
    deleteFields.mutate([...selectedIds], {
      onSuccess: () => {
        toast.success(
          count === 1 ? "Feld gelöscht." : `${count} Felder gelöscht.`,
        );
        setConfirmOpen(false);
        onCleared();
      },
      onError: () => {
        toast.error("Felder konnten nicht gelöscht werden.");
      },
    });
  }

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setConfirmOpen(true)}
        disabled={count === 0}
        className="relative shadow-card"
        aria-label={count === 1 ? "1 Feld löschen" : `${count} Felder löschen`}
      >
        <Trash2Icon className="size-4" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {count === 1 ? "Feld löschen?" : `${count} Felder löschen?`}
            </DialogTitle>
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
