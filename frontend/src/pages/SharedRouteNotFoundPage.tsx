import { Unlink2Icon } from "lucide-react";

export function SharedRouteNotFoundPage() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-primary p-6">
      <div className="max-w-md rounded-2xl bg-primary-container p-8 text-center text-on-primary shadow-card">
        <Unlink2Icon className="mx-auto mb-4 size-10" strokeWidth={1.5} />
        <h1 className="text-headline-md mb-2">Route nicht gefunden</h1>
        <p className="text-body-md opacity-80">
          Wir konnten zu diesem Link keine Route finden.
        </p>
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-row items-center gap-2 text-on-primary">
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
