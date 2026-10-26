import { useState } from "react";
import {
  EllipsisIcon,
  EyeIcon,
  MapIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
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
import { ShareRouteButton } from "@/features/map/components/ShareRouteButton";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";
import {
  useDeleteRouteMutation,
  type RouteResponse,
} from "@/features/routes/api";

export function RouteActionsDialog({
  route,
  onEdit,
  onShowOnMap,
  onToggleVisibility,
  visible,
}: {
  route: RouteResponse;
  onEdit: () => void;
  onShowOnMap?: () => void;
  onToggleVisibility?: () => void;
  visible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteRouteMutation();
  const { selection, clear } = useSelection();

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  function deleteRoute() {
    remove.mutate(route.id, {
      onSuccess: () => {
        if (
          selection?.kind === SelectionKind.Route &&
          selection.id === route.id
        )
          clear();
        setOpen(false);
        toast.success("Route gelöscht.");
      },
      onError: () => toast.error("Route konnte nicht gelöscht werden."),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (remove.isPending) return;
        setOpen(next);
        if (next) setConfirmDelete(false);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Aktionen für ${route.name || `Route #${route.id}`}`}
          />
        }
      >
        <EllipsisIcon />
      </DialogTrigger>
      <DialogContent showCloseButton={!remove.isPending}>
        <DialogHeader>
          <DialogTitle>
            {confirmDelete
              ? "Route löschen?"
              : route.name || `Route #${route.id}`}
          </DialogTitle>
          <DialogDescription>
            {confirmDelete
              ? "Diese Aktion kann nicht rückgängig gemacht werden. Auch der Teilen-Link funktioniert danach nicht mehr."
              : "Was möchtest du mit dieser Route machen?"}
          </DialogDescription>
        </DialogHeader>
        {confirmDelete ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={deleteRoute}
            >
              {remove.isPending ? "Löschen …" : "Route löschen"}
            </Button>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setConfirmDelete(false)}
            >
              Zurück
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <DialogActionButton onClick={() => run(onEdit)}>
              <PencilIcon /> Route bearbeiten
            </DialogActionButton>
            <ShareRouteButton routeId={route.id} showLabel />
            {onShowOnMap && (
              <DialogActionButton onClick={() => run(onShowOnMap)}>
                <MapIcon /> Auf Karte zeigen
              </DialogActionButton>
            )}
            {onToggleVisibility && (
              <DialogActionButton onClick={() => run(onToggleVisibility)}>
                <EyeIcon />{" "}
                {visible ? "Auf Karte ausblenden" : "Auf Karte einblenden"}
              </DialogActionButton>
            )}
            <DialogActionButton
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2Icon /> Route löschen
            </DialogActionButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
