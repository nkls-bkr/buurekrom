import { useState } from "react";
import {
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  MapIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
import { Separator } from "@/components/ui/separator";
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
              ? "Route dauerhaft löschen?"
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
              {remove.isPending ? "Löschen …" : "Dauerhaft löschen"}
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
              <PencilIcon data-icon="inline-start" /> Bearbeiten
            </DialogActionButton>
            <ShareRouteButton routeId={route.id} showLabel />
            {onShowOnMap && (
              <DialogActionButton onClick={() => run(onShowOnMap)}>
                <MapIcon data-icon="inline-start" /> Auf der Karte ansehen
              </DialogActionButton>
            )}
            {onToggleVisibility && (
              <DialogActionButton onClick={() => run(onToggleVisibility)}>
                {visible ? (
                  <EyeOffIcon data-icon="inline-start" />
                ) : (
                  <EyeIcon data-icon="inline-start" />
                )}
                {visible ? "Von der Karte ausblenden" : "Zur Karte hinzufügen"}
              </DialogActionButton>
            )}
            <Separator className="my-2" />
            <DialogActionButton
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2Icon data-icon="inline-start" /> Dauerhaft löschen
            </DialogActionButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
