import AppSidebar from "@/components/layouts/app-sidebar";
import Header from "@/components/layouts/header";
import Providers from "@/components/providers";
import WelcomeDialog from "@/components/welcome-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel de administración",
  description: "Acá podrás actualizar o crear datos para la página web.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const isAuthenticated = cookieStore.get("auth_token");

  if (!isAuthenticated) {
    redirect("/"); // Redirige al login si no hay sesión
  }

  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <Providers>{children}</Providers>
        <WelcomeDialog />
      </SidebarInset>
    </SidebarProvider>
  );
}
