"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cct-welcomed";

/**
 * Modal de bienvenida/onboarding: se muestra una sola vez por navegador.
 * El foco queda atrapado dentro (Radix Dialog) y se cierra con Esc.
 */
export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "welcome-overlay fixed inset-0 z-50 bg-white/60 backdrop-blur-[6px]",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "welcome-content fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border bg-white p-6 focus:outline-none",
          )}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-[#F7F7F8]">
            <Image
              src="/logocruztours.png"
              alt="Vista previa de Cruz Control Tours"
              width={432}
              height={160}
              className="h-40 w-full object-contain p-6"
              priority
            />
          </div>
          <DialogTitle className="mt-5 text-center text-[18px] font-medium">
            Te damos la bienvenida a Cruz Control Tours
          </DialogTitle>
          <DialogDescription className="mt-2 text-center text-[15px] text-muted-foreground">
            Gestiona tours, reservas, clientes y el contenido de tu sitio desde
            un solo lugar.
          </DialogDescription>
          <Button className="mt-5 w-full" onClick={() => handleOpenChange(false)}>
            Comenzar
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
