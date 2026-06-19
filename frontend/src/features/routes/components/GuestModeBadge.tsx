import { Link } from "react-router-dom";

export function GuestModeBadge() {
  return (
    <div className="absolute top-6 left-1/2 z-[1000] flex w-72 -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2 text-on-primary shadow-card">
      <img
        src="/buurekrom.svg"
        alt="Buurekrom"
        className="h-5 w-5 object-contain"
      />
      <span className="text-label-md">
        Gastansicht von{" "}
        <Link to="/" className="underline underline-offset-2">
          Buurekrom
        </Link>
      </span>
    </div>
  );
}
