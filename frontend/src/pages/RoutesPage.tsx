import { Link, useSearchParams } from "react-router-dom";
import { MapIcon, RouteIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutes } from "@/features/routes/api";
import { useRouteVisibility } from "@/features/routes/visibility/visibility";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

export function RoutesPage() {
  const { data: routes = [], isPending, isError, refetch } = useRoutes();
  const { isVisible, toggleRoute, showAll, hideAll } = useRouteVisibility();
  const { selection, clear } = useSelection();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const filter = searchParams.get("visibility") ?? "all";
  const visibility =
    filter === "visible" || filter === "hidden" ? filter : "all";
  const query = search.trim().toLocaleLowerCase("de");
  const visibleCount = routes.filter((route) => isVisible(route.id)).length;
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = `${route.name ?? ""} Route #${route.id}`
      .toLocaleLowerCase("de")
      .includes(query);
    const matchesVisibility =
      visibility === "all" ||
      (visibility === "visible" ? isVisible(route.id) : !isVisible(route.id));
    return matchesSearch && matchesVisibility;
  });

  function updateFilter(key: string, value: string) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  function toggleVisibility(routeId: number) {
    if (
      isVisible(routeId) &&
      selection?.kind === SelectionKind.Route &&
      selection.id === routeId
    ) {
      clear();
    }
    toggleRoute(routeId);
  }

  function hideAllRoutes() {
    hideAll();
    if (selection?.kind === SelectionKind.Route) clear();
  }

  return (
    <main className="h-full overflow-y-auto bg-background">
      <div className="safe-page-content mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-headline-md font-semibold">
              Routen
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Finde deine Routen und wähle aus, welche auf der Karte erscheinen.
            </p>
          </div>
        </header>

        <section
          aria-label="Routen suchen und filtern"
          className="flex flex-col gap-4 rounded-xl border bg-card p-4"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="route-search">Routen suchen</Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="route-search"
                  type="search"
                  placeholder="Name oder Routennummer …"
                  className="pl-10"
                  value={search}
                  onChange={(event) => updateFilter("q", event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="route-visibility">
                Sichtbarkeit auf der Karte
              </Label>
              <select
                id="route-visibility"
                value={visibility}
                onChange={(event) =>
                  updateFilter(
                    "visibility",
                    event.target.value === "all" ? "" : event.target.value,
                  )
                }
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Alle Routen</option>
                <option value="visible">Eingeblendet</option>
                <option value="hidden">Ausgeblendet</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {visibleCount} von {routes.length} Routen auf der Karte
              eingeblendet
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={
                  isPending || isError || visibleCount === routes.length
                }
                onClick={() => showAll(routes.map((route) => route.id))}
              >
                Alle einblenden
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending || isError || visibleCount === 0}
                onClick={hideAllRoutes}
              >
                Alle ausblenden
              </Button>
            </div>
          </div>
        </section>

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
        ) : routes.length === 0 ? (
          <div className="space-y-2 py-8 text-center text-muted-foreground">
            <RouteIcon className="mx-auto size-8" />
            <p>Noch keine Routen vorhanden.</p>
            <p className="text-sm">Zeichne deine erste Route auf der Karte.</p>
          </div>
        ) : (
          <section aria-label="Gefundene Routen" className="space-y-3">
            <p className="text-sm text-muted-foreground" role="status">
              {filteredRoutes.length} Routen gefunden
            </p>
            {filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-muted-foreground">
                  Keine Routen für diese Suche und Filter gefunden.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({}, { replace: true })}
                >
                  Filter zurücksetzen
                </Button>
              </div>
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {filteredRoutes.map((route) => (
                  <li key={route.id} className="flex flex-wrap items-center gap-x-4 px-4 py-3 hover:bg-muted/50">
                    <label className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={isVisible(route.id)}
                        onCheckedChange={() => toggleVisibility(route.id)}
                        aria-label={`${route.name || `Route #${route.id}`} auf der Karte anzeigen`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-medium">
                          {route.name || `Route #${route.id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Route #{route.id} ·{" "}
                          {isVisible(route.id)
                            ? "Eingeblendet"
                            : "Ausgeblendet"}
                        </span>
                      </span>
                    </label>
                    <Button
                      render={<Link to={`/?route=${route.id}`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      aria-label={`${route.name || `Route #${route.id}`} auf Karte zeigen`}
                    >
                      <MapIcon /> Auf Karte zeigen
                    </Button>
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
