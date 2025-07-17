import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeDateString(dateString: string | undefined | null): string {
  if (!dateString) return '';
  if (dateString.includes('T')) return dateString;
  // Convert 'YYYY-MM-DD HH:mm:ss' to 'YYYY-MM-DDTHH:mm:ssZ'
  return dateString.replace(' ', 'T') + 'Z';
}
