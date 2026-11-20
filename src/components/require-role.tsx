"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, type RoleName } from "@/lib/session";

type RequireRoleProps = {
  allow: RoleName[];
  fallback?: string;
  children: React.ReactNode;
};

/** Muestra los hijos solo si el rol de la sesión está permitido. */
export default function RequireRole({
  allow,
  fallback = "/panel/clientes",
  children,
}: RequireRoleProps) {
  const { user, role } = useSession();
  const router = useRouter();
  const allowed = user !== null && role !== null && allow.includes(role);

  useEffect(() => {
    if (user && !allowed) router.replace(fallback);
  }, [user, allowed, fallback, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
