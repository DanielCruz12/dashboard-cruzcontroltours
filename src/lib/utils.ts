import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Primeros 8 caracteres de un UUID para mostrarlo compacto en la UI. */
export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}
