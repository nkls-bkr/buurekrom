import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../features/auth/api";

export function RequireAuth() {
  const location = useLocation();
  const { data, isLoading } = useAuthSession();

  if (isLoading) {
    return null;
  }
  if (!data?.authenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search + location.hash }}
        replace
      />
    );
  }
  return <Outlet />;
}
