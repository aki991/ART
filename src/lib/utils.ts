import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return `pre ${diff}s`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `pre ${minutes} min`;

  const hours = Math.floor(diff / 3600);
  if (hours < 24) return `pre ${hours}h`;

  const days = Math.floor(diff / 86400);
  if (days < 7) return `pre ${days} ${days === 1 ? "dan" : "dana"}`;

  return date.toLocaleDateString("sr-RS");
}
