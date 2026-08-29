import { FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoutes } from "@/features/routes/api";
import { useRouteVisibility } from "@/features/map/visibility/visibility";

export function RouteVisibilityControl() {
  const { data } = useRoutes();
  const { visibleRouteIds, toggleRoute, showAll, hideAll, isVisible } =
    useRouteVisibility();
  const routes = data ?? [];

  const handleShowAll = () => showAll(routes.map((r) => r.id));

  const visibleCount = visibleRouteIds.size;
  const displayCount = visibleCount > 9 ? "9+" : visibleCount.toString();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="shadow-card"
              aria-label="Routen filtern"
            >
              <FilterIcon className="size-4" />
            </Button>
            {visibleCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                {displayCount}
              </span>
            )}
          </div>
        }
      />
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Routen filtern</SheetTitle>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShowAll}>
              Alle anzeigen
            </Button>
            <Button variant="outline" size="sm" onClick={hideAll}>
              Alle ausblenden
            </Button>
          </div>
        </SheetHeader>
        <div className="-mt-2 max-h-96 overflow-y-auto">
          {routes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Keine Routen vorhanden
            </p>
          ) : (
            <div className="flex flex-col">
              {routes.map((route) => (
                <label
                  key={route.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-4 py-2 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={isVisible(route.id)}
                    onCheckedChange={() => toggleRoute(route.id)}
                  />
                  <span className="flex-1">
                    {route.name || `Route #${route.id}`}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
