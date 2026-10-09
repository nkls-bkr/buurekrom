import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/components/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { RoutesPage } from "../pages/RoutesPage";
import { MapPage } from "../pages/MapPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SharedRoutePage } from "../pages/SharedRoutePage";
import { RequireAuth } from "./RequireAuth";
import { SelectionProvider } from "@/features/map/selection/SelectionProvider";
import { VisibilityProvider } from "@/features/routes/visibility/VisibilityProvider";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/share/:token", element: <SharedRoutePage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: (
          <VisibilityProvider>
            <SelectionProvider>
              <AppLayout />
            </SelectionProvider>
          </VisibilityProvider>
        ),
        children: [
          { index: true, element: <MapPage /> },
          { path: "routes", element: <RoutesPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
