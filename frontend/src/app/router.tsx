import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/components/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { MapPage } from "../pages/MapPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RequireAuth } from "./RequireAuth";
import { SelectionProvider } from "@/features/map/selection/SelectionProvider";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <SelectionProvider>
          <AppLayout />
        </SelectionProvider>
      </RequireAuth>
    ),
    children: [{ index: true, element: <MapPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
