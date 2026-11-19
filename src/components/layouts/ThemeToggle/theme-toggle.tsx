"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        onClick={() => setTheme(dark ? "light" : "dark")}
      >
        {dark ? (
          <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
    </div>
  );
}
