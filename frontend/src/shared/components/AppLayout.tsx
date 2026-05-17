import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOutIcon, MapIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/features/auth/api";

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logoutMutation = useLogoutMutation();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-2">
            <img
              src="/buurekrom.svg"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 object-contain"
            />
            <div className="ml-1 flex flex-col leading-tight">
              <span className="inline-flex items-baseline gap-1 font-display text-lg font-semibold">
                Buurekrom
                <span className="relative -top-1.5 rounded-sm border border-outline-variant bg-surface-container-highest px-1 py-px text-[0.5rem] font-semibold uppercase tracking-wide text-on-surface shadow-sm">
                  Alpha
                </span>
              </span>
              <span className="text-[0.625rem] font-medium text-outline-variant">
                v0.0.6 | Entwicklungsumgebung
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  render={<NavLink to="/" end />}
                >
                  <MapIcon />
                  Karte
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOutIcon />
                Abmelden
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="relative">
        <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-3 bg-sidebar px-4 text-sidebar-foreground md:hidden">
          <SidebarTrigger />
        </header>
        <div className="absolute inset-0 top-14 md:top-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
