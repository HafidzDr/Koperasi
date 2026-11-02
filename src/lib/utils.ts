import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Combines Tailwind class names cleanly using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount into Indonesian Rupiah (IDR) standard.
 * Format: Rp 1.250.000, Rp 0, or (Rp 250.000) for negative numbers.
 */
export function formatIDR(amount: number): string {
  if (isNaN(amount)) return "Rp 0";
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(absVal);

  if (isNegative) {
    return `(Rp ${formatted})`;
  }
  return `Rp ${formatted}`;
}

/**
 * Formats date into standard Indonesian date representation.
 * Default pattern: "d MMMM yyyy" -> e.g. "2 November 2026"
 */
export function formatDate(
  dateInput: string | Date,
  patternStr: string = "d MMMM yyyy"
): string {
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return format(d, patternStr, { locale: id });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats date and time into standard Indonesian representation.
 * Pattern: "d MMM yyyy, HH.mm WIB"
 */
export function formatDateTime(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return `${format(d, "d MMM yyyy, HH.mm", { locale: id })} WIB`;
  } catch {
    return String(dateInput);
  }
}
