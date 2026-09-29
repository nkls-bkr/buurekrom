import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SharedRouteNotFoundPage() {
  return (
    <div className="safe-page flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-primary">
      <div className="flex max-w-md flex-col items-center rounded-2xl bg-primary-container p-4 text-center text-on-primary shadow-card">
        <img
          src="/buurekrom-inprogress.png"
          alt=""
          className="mx-auto mb-2 size-60 object-contain"
        />
        <h1 className="text-headline-md mb-2">
          Wir konnten keine Route finden...
        </h1>
        <p className="text-body-md opacity-80 mb-4">
          Überprüfe ob der Link korrekt ist und versuche es erneut.
        </p>
        <Button render={<Link to="/" />} nativeButton={false} className="gap-2">
          Zurück zur Startseite
        </Button>
      </div>
      <div className="flex flex-row items-center gap-2 text-on-primary">
        <img
          src="/buurekrom.svg"
          alt="Buurekrom"
          className="h-8 w-8 object-contain"
        />
        <span className="text-[1.25rem]">Buurekrom</span>
      </div>
    </div>
  );
}
