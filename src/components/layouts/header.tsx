"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ThemeToggle from "./ThemeToggle/theme-toggle";
import { navItems } from "@/constants/data";
import { shortId } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  editar: "Editar",
};

function labelForSegment(segment: string, href: string): string {
  const navMatch = navItems.find((item) => item.url === href);
  if (navMatch) return navMatch.title;
  const decoded = decodeURIComponent(segment);
  if (decoded === "panel") return "Panel";
  if (ACTION_LABELS[decoded]) return ACTION_LABELS[decoded];
  if (decoded.length > 12) return `#${shortId(decoded)}`;
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

export default function Header() {
  const pathname = usePathname();
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />

        {pathSegments.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList className="text-[13px]">
              {pathSegments.map((segment, index) => {
                const href = "/" + pathSegments.slice(0, index + 1).join("/");
                const isLast = index === pathSegments.length - 1;
                const isFirst = index === 0;
                const isSectionRoot = navItems.some(
                  (item) => item.url === href,
                );
                const label = labelForSegment(segment, href);

                return (
                  <React.Fragment key={href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <span className="inline-flex items-center gap-1">
                          <BreadcrumbPage className="font-medium text-foreground">
                            {label}
                          </BreadcrumbPage>
                          <ChevronDown
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-muted-foreground"
                          />
                        </span>
                      ) : !isFirst && isSectionRoot ? (
                        <Link
                          href={href}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
