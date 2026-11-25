/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems } from "@/constants/data";
import {
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { clearSession, useSession } from "@/lib/session";
import { UserNav } from "./user-nav";

export const company = {
  name: "Cruz Control Tours",
  plan: "Panel de administración",
};

const HOME_URL = "/panel/clientes";

const FAVORITE_TITLES = ["Tours", "Reservas", "Despachos"];

const CREATE_ITEMS = [
  { title: "Nuevo tour", url: "/panel/tours/nuevo", icon: "product" },
  { title: "Nuevo artículo", url: "/panel/blog/nuevo", icon: "blog" },
  { title: "Nuevo protocolo", url: "/panel/protocolos/nuevo", icon: "page" },
  { title: "Nuevo formulario", url: "/panel/formularios/nuevo", icon: "forms" },
];

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Administrador",
  host: "Anfitrión",
};

function isSectionActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, canWrite } = useSession();
  // Items con `roles` solo se muestran a esos roles (p. ej. Usuarios).
  const visibleItems = navItems.filter(
    (item) =>
      !("roles" in item) ||
      ((item as { roles?: string[] }).roles ?? []).includes(role ?? ""),
  );
  const favorites = visibleItems.filter((item) =>
    FAVORITE_TITLES.includes(item.title),
  );

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const showUpgrade = () => {
    toast("Para cambiar de plan, contacta a tu administrador.");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-1 px-1 py-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Selector de espacio de trabajo"
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 text-left transition-[background-color] duration-[120ms] hover:bg-sidebar-accent"
              >
                <Image
                  src="/logocruztours.png"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 rounded-md object-cover"
                />
                <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                  {company.name}
                </span>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <span className="truncate text-sm font-medium">
                    {company.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {company.plan}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={HOME_URL}>
                  <Home className="h-4 w-4" />
                  <span>Ir al inicio</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="shrink-0 group-data-[collapsible=icon]:hidden">
            <UserNav />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        {favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Favoritos</SidebarGroupLabel>
            <SidebarMenu>
              {favorites.map((item) => {
                const Icon = item.icon ? (Icons as any)[item.icon] : Icons.logo;
                const active = isSectionActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                    >
                      <Link
                        href={item.url}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {visibleItems.map((item) => {
              const Icon = item.icon ? (Icons as any)[item.icon] : Icons.logo;
              const active = isSectionActive(pathname, item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                  >
                    <Link
                      href={item.url}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        {canWrite && (
          <div className="px-2 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full">
                  <Plus />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Nuevo
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Crear nuevo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {CREATE_ITEMS.map((item) => {
                  const Icon = (Icons as any)[item.icon] ?? FileText;
                  return (
                    <DropdownMenuItem key={item.url} asChild className="cursor-pointer">
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-xl border border-border bg-card p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
            />
            <p className="text-xs font-medium">Espacio activo</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Rol: {ROLE_LABELS[role ?? ""] ?? "Miembro"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={showUpgrade}
          >
            Upgrade
          </Button>
          <div className="mt-2 flex items-center justify-between text-xs">
            <Link
              href="/panel/faqs"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Ayuda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
