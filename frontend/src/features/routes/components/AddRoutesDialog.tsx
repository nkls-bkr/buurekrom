import { useState } from "react";
import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import type { RouteResponse } from "@/features/routes/api";
import { useRouteVisibility } from "@/features/routes/visibility/visibility";

export function AddRoutesDialog({
  open,
  onOpenChange,
  routes,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routes: RouteResponse[];
  onAdded: () => void;
}) {
  const [search, setSearch] = useState("");
  const { isVisible, showRoute } = useRouteVisibility();
  const query = search.trim().toLocaleLowerCase("de");
  const matches = routes.filter((route) =>
    `${route.name ?? ""} Route #${route.id}`
      .toLocaleLowerCase("de")
      .includes(query),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Routen hinzufügen</DialogTitle>
          <DialogDescription>
            Wähle gespeicherte Routen aus, die auf deiner Karte erscheinen
            sollen.
          </DialogDescription>
        </DialogHeader>
        {routes.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p>
              Noch keine Routen gespeichert. Zeichne deine erste Route auf der
              Karte.
            </p>
            <Button render={<Link to="/" />} nativeButton={false}>
              Zur Karte
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-route-search">
                Gespeicherte Routen suchen
              </Label>
              <Input
                id="add-route-search"
                type="search"
                placeholder="Name oder Routennummer …"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {matches.length === 0 ? (
              <p role="status">
                Keine gespeicherten Routen für diese Suche gefunden.
              </p>
            ) : (
              <ul
                aria-label="Gespeicherte Routen"
                className="flex max-h-[45dvh] flex-col gap-2 overflow-y-auto"
              >
                {matches.map((route) => {
                  const name = route.name || `Route #${route.id}`;
                  const visible = isVisible(route.id);
                  return (
                    <li
                      key={route.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <span className="min-w-0 flex-1 break-words">{name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={visible}
                        aria-label={
                          visible
                            ? `${name} ist auf der Karte`
                            : `${name} hinzufügen`
                        }
                        onClick={() => {
                          showRoute(route.id);
                          onAdded();
                        }}
                      >
                        {visible ? (
                          <CheckIcon data-icon="inline-start" />
                        ) : (
                          <PlusIcon data-icon="inline-start" />
                        )}
                        {visible ? "Auf der Karte" : "Hinzufügen"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
