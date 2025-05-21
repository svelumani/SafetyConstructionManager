import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, formatStr: string = "PPP"): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatUTCToLocal(utcDateString: string | null | undefined, formatStr: string = "PPP p"): string {
  if (!utcDateString) return "N/A";
  
  try {
    const date = parseISO(utcDateString);
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting UTC date:", error);
    return "Invalid date";
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return "?";
  
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  
  return `${first}${last}`;
}

export function getFullName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return "Unknown User";
  return `${firstName || ""} ${lastName || ""}`.trim();
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatRoleName(role: string): string {
  if (!role) return "";
  return role
    .split("_")
    .map(word => capitalizeFirstLetter(word))
    .join(" ");
}

export function formatEnumValue(value: string): string {
  if (!value) return "";
  return value
    .split("_")
    .map(word => capitalizeFirstLetter(word))
    .join(" ");
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-red-500 bg-red-100";
    case "high":
      return "text-orange-500 bg-orange-100";
    case "medium":
      return "text-amber-500 bg-amber-100";
    case "low":
      return "text-blue-500 bg-blue-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "text-red-500 bg-red-100";
    case "assigned":
      return "text-gray-500 bg-gray-100";
    case "in_progress":
      return "text-blue-500 bg-blue-100";
    case "resolved":
      return "text-green-500 bg-green-100";
    case "closed":
      return "text-purple-500 bg-purple-100";
    case "requested":
      return "text-amber-500 bg-amber-100";
    case "approved":
      return "text-green-500 bg-green-100";
    case "denied":
      return "text-red-500 bg-red-100";
    case "expired":
      return "text-gray-500 bg-gray-100";
    case "pending":
      return "text-amber-500 bg-amber-100";
    case "completed":
      return "text-green-500 bg-green-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
}
