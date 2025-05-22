import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  if (!date) return "";
  
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (error) {
    console.error("Error formatting UTC date:", error);
    return "";
  }
}

export function formatUTCToLocal(utcDateString: string, format?: string) {
  if (!utcDateString) return "";
  
  try {
    const date = new Date(utcDateString);
    
    // If date is invalid, return empty string
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", utcDateString);
      return "";
    }
    
    // If a specific format is provided using date-fns format
    if (format) {
      // Basic implementation of date-fns-like format patterns
      switch (format) {
        case "PP": // Jul 2, 2023
          return new Intl.DateTimeFormat("en-US", {
            month: "short", 
            day: "numeric", 
            year: "numeric"
          }).format(date);
        case "PPpp": // Jul 2, 2023, 12:30 PM
          return new Intl.DateTimeFormat("en-US", {
            month: "short", 
            day: "numeric", 
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          }).format(date);
        case "p": // 12:30 PM
          return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true
          }).format(date);
        default:
          return new Intl.DateTimeFormat("en-US").format(date);
      }
    }
    
    // Default format if no format is provided
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Error formatting UTC date:", error);
    return "";
  }
}

export function formatRoleName(role: string): string {
  if (!role) return "";
  
  // First, handle camelCase or snake_case by splitting on capital letters or underscores
  const words = role.replace(/([A-Z])/g, ' $1')  // Insert a space before capital letters
                  .replace(/_/g, ' ')           // Replace underscores with spaces
                  .trim();
  
  // Capitalize the first letter of each word
  return words.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getInitials(name?: string): string {
  if (!name) return "?";
  
  const nameParts = name.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  return (
    nameParts[0].charAt(0).toUpperCase() +
    nameParts[nameParts.length - 1].charAt(0).toUpperCase()
  );
}

export function getStatusColor(status?: string): string {
  if (!status) return "#6b7280"; // default to gray if no status provided
  
  const statusMap: Record<string, string> = {
    active: "#10b981", // green
    inactive: "#6b7280", // gray
    pending: "#f59e0b", // amber
    completed: "#3b82f6", // blue
    approved: "#10b981", // green
    rejected: "#ef4444", // red
    open: "#10b981", // green
    closed: "#6b7280", // gray
    in_progress: "#f59e0b", // amber for in_progress
    assigned: "#3b82f6", // blue for assigned
    resolved: "#10b981", // green for resolved
  };
  
  return statusMap[status.toLowerCase()] || "#6b7280"; // default to gray
}