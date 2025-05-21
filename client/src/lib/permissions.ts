import { useAuth } from "@/hooks/use-auth";

// Define resource types
export type Resource = "users" | "sites" | "sitePersonnel" | "teams" | "hazards" | "inspections" | "permits" | "incidents" | "training";
export type Action = "create" | "read" | "update" | "delete";

// Permission checking function that can throw or return boolean
export function requirePermission(resource: Resource, action: Action, throwError = true): boolean {
  const { user } = useAuth();

  // Super Admin has all permissions
  if (user?.role === "superAdmin") {
    return true;
  }
  
  // Safety Officer has management permissions for their tenant
  if (user?.role === "safetyOfficer") {
    return true;
  }
  
  // Supervisor has limited permissions
  if (user?.role === "supervisor") {
    // Supervisors can read all resources
    if (action === "read") {
      return true;
    }
    
    // Supervisors can create/update certain resources
    if ((action === "create" || action === "update") && 
        (resource === "hazards" || resource === "inspections" || resource === "teams")) {
      return true;
    }
  }
  
  // Employee has very limited permissions
  if (user?.role === "employee") {
    // Employees can read most resources
    if (action === "read" && 
        resource !== "users" && 
        resource !== "sitePersonnel") {
      return true;
    }
    
    // Employees can create hazards
    if (action === "create" && resource === "hazards") {
      return true;
    }
  }
  
  // If authenticated but no specific role, allow basic read access to teams and other resources
  if (user && action === "read" && 
      (resource === "teams" || resource === "hazards" || 
       resource === "inspections" || resource === "permits" ||
       resource === "incidents")) {
    return true;
  }
  
  // Subcontractor has minimal permissions
  if (user?.role === "subcontractor") {
    // Subcontractors can read certain resources
    if (action === "read" && 
        (resource === "hazards" || resource === "permits")) {
      return true;
    }
    
    // Subcontractors can create hazards
    if (action === "create" && resource === "hazards") {
      return true;
    }
  }
  
  // If we get here, user doesn't have permission
  if (throwError) {
    throw new Error(`You don't have permission to ${action} ${resource}`);
  }
  
  return false;
}