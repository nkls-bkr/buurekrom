import { useParams } from "react-router-dom";
import { useSharedRoute } from "@/features/routes/api";
import { SharedRouteNotFoundPage } from "@/pages/SharedRouteNotFoundPage";
import { SharedRouteMap } from "@/features/routes/components/SharedRouteMap";
import { GuestModeBadge } from "@/features/routes/components/GuestModeBadge";

export function SharedRoutePage() {
  const { token } = useParams<{ token: string }>();
  const { data: route, isError } = useSharedRoute(token ?? "");

  if (isError) {
    return <SharedRouteNotFoundPage />;
  }

  return (
    <div className="relative h-screen w-screen">
      {route && <SharedRouteMap route={route} />}
      <GuestModeBadge />
    </div>
  );
}
