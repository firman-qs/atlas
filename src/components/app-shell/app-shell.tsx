import { cookies } from "next/headers";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;

  const defaultSidebarOpen = sidebarState !== "false";

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />

      <SidebarInset className="relative h-svh min-w-0 overflow-hidden">
        <AppHeader />

        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 pb-4 pt-20 md:px-6 md:pb-6 md:pt-22">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
