
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a readable format
 * @param dateString - The date string to format
 * @param formatStr - Optional format string (default: 'PPP')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr: string = "PPP"): string {
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "Invalid date";
  }
}
