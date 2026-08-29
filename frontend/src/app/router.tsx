import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/components/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { MapPage } from "../pages/MapPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SharedRoutePage } from "../pages/SharedRoutePage";
import { RequireAuth } from "./RequireAuth";
import { SelectionProvider } from "@/features/map/selection/SelectionProvider";
import { VisibilityProvider } from "@/features/map/visibility/VisibilityProvider";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/share/:token", element: <SharedRoutePage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <VisibilityProvider>
          <SelectionProvider>
            <AppLayout />
          </SelectionProvider>
        </VisibilityProvider>
      </RequireAuth>
    ),
    children: [{ index: true, element: <MapPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
