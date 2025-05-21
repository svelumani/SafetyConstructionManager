import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status color utility function
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'pending':
    case 'in progress':
    case 'in review':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'inactive':
    case 'expired':
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'awaiting approval':
    case 'suspended':
    case 'on hold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// Format UTC date to local date string
export function formatUTCToLocal(utcDateString: string | null, formatString: string = 'PPP'): string {
  if (!utcDateString) return 'N/A';
  try {
    const date = parseISO(utcDateString);
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

// Format date for display
export function formatDate(date: Date | string | null, formatString: string = 'PPP'): string {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

// Format role name for display
export function formatRoleName(role: string): string {
  if (!role) return 'N/A';
  
  // Split by underscores or hyphens and capitalize each word
  return role
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return name.slice(0, 2).toUpperCase();
  }
  
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}