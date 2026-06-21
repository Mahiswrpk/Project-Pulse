import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday, isPast, isFuture, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy h:mm a");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d) && !isToday(d);
}

export function isDueToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isToday(d);
}

export function isDueSoon(date: Date | string | null | undefined, days = 7): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isFuture(d) && d <= addDays(new Date(), days);
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}

export const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PLANNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  BACKLOG: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  TODO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  PENDING: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS_MS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  COMPLETED_MS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  MISSED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
} as const;

export const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MEDIUM: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
} as const;
