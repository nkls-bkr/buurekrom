import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  MapIcon,
  PlusIcon,
  RouteIcon,
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
import { RouteActionsDialog } from "@/features/routes/components/RouteActionsDialog";
import { AddRoutesDialog } from "@/features/routes/components/AddRoutesDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutes } from "@/features/routes/api";
import { useRouteVisibility } from "@/features/routes/visibility/visibility";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

export function RoutesPage() {
  const navigate = useNavigate();
  const { data: routes = [], isPending, isError, refetch } = useRoutes();
  const { isVisible, toggleRoute, showRoute, showAll, hideAll } =
    useRouteVisibility();
  const { selection, clear } = useSelection();
  const [searchParams, setSearchParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const search = searchParams.get("q") ?? "";
  const query = search.trim().toLocaleLowerCase("de");
  const visibleRoutes = routes.filter((route) => isVisible(route.id));
  const filteredRoutes = visibleRoutes.filter((route) =>
    `${route.name ?? ""} Route #${route.id}`
      .toLocaleLowerCase("de")
      .includes(query),
  );

  function updateSearch(value: string) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("visibility");
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }

  function hideRoute(routeId: number) {
    if (selection?.kind === SelectionKind.Route && selection.id === routeId)
      clear();
    toggleRoute(routeId);
    toast("Route ausgeblendet", {
      action: { label: "Rückgängig", onClick: () => showRoute(routeId) },
    });
  }

  function hideAllRoutes() {
    const previousIds = visibleRoutes.map((route) => route.id);
    hideAll();
    if (selection?.kind === SelectionKind.Route) clear();
    setMoreOpen(false);
    toast("Alle Routen ausgeblendet", {
      action: {
        label: "Rückgängig",
        onClick: () => previousIds.forEach(showRoute),
      },
    });
  }

  return (
    <main className="h-full overflow-y-auto bg-background">
      <div className="safe-page-content mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-headline-md font-semibold">
              Routen auf der Karte
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Tippe auf eine Route, um sie auf der Karte anzusehen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setAdding(true)}
              disabled={isPending || isError}
            >
              <PlusIcon data-icon="inline-start" /> Routen hinzufügen
            </Button>
            <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    disabled={isPending || isError || routes.length === 0}
                  />
                }
              >
                <EllipsisIcon data-icon="inline-start" /> Weitere Aktionen
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Weitere Aktionen</DialogTitle>
                  <DialogDescription>
                    Ändere, welche Routen auf der Karte erscheinen. Deine
                    gespeicherten Routen bleiben erhalten.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <DialogActionButton
                    disabled={visibleRoutes.length === routes.length}
                    onClick={() => {
                      showAll(routes.map((route) => route.id));
                      updateSearch("");
                      setMoreOpen(false);
                    }}
                  >
                    <EyeIcon data-icon="inline-start" /> Alle einblenden
                  </DialogActionButton>
                  <DialogActionButton
                    disabled={visibleRoutes.length === 0}
                    onClick={hideAllRoutes}
                  >
                    <EyeOffIcon data-icon="inline-start" /> Alle ausblenden
                  </DialogActionButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <AddRoutesDialog
          open={adding}
          onOpenChange={setAdding}
          routes={routes}
          onAdded={() => updateSearch("")}
        />

        {isPending ? (
          <p role="status" className="py-8 text-center text-muted-foreground">
            Routen werden geladen …
          </p>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-8">
            <p>Routen konnten nicht geladen werden.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Erneut versuchen
            </Button>
          </div>
        ) : visibleRoutes.length === 0 ? (
          <section
            aria-label="Keine Routen auf der Karte"
            className="flex flex-col items-center gap-3 py-8 text-center"
          >
            <RouteIcon className="size-8 text-muted-foreground" />
            <h2 className="font-medium">Noch keine Routen auf der Karte</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {routes.length === 0
                ? "Es sind noch keine Routen gespeichert. Zeichne deine erste Route auf der Karte."
                : "Füge gespeicherte Routen hinzu, um sie hier und auf der Karte zu sehen."}
            </p>
            <Button onClick={() => setAdding(true)}>
              <PlusIcon data-icon="inline-start" /> Routen hinzufügen
            </Button>
          </section>
        ) : (
          <section
            aria-label="Eingeblendete Routen"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="route-search">Eingeblendete Routen suchen</Label>
              <Input
                id="route-search"
                type="search"
                placeholder="Name oder Routennummer …"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground" role="status">
              {query
                ? `${filteredRoutes.length} Treffer`
                : `${visibleRoutes.length} Routen auf der Karte`}
            </p>
            {filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-muted-foreground">
                  Keine eingeblendeten Routen für diese Suche gefunden.
                </p>
                <Button variant="outline" onClick={() => updateSearch("")}>
                  Suche zurücksetzen
                </Button>
              </div>
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {filteredRoutes.map((route) => (
                  <li
                    key={route.id}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Link
                      to={`/?route=${route.id}`}
                      aria-label={`${route.name || `Route #${route.id}`} auf der Karte ansehen`}
                      className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg py-2 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <MapIcon className="size-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-medium">
                          {route.name || `Route #${route.id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Auf der Karte ansehen
                        </span>
                      </span>
                    </Link>
                    <RouteActionsDialog
                      route={route}
                      onEdit={() => navigate(`/?route=${route.id}&edit=1`)}
                      onToggleVisibility={() => hideRoute(route.id)}
                      visible
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
