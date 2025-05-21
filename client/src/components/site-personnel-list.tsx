import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash2, UserCheck, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface SitePersonnelListProps {
  siteId: number;
  onEdit?: (personnelId: number) => void;
}

export function SitePersonnelList({ siteId, onEdit }: SitePersonnelListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  interface SitePersonnel {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    siteId: number;
    siteRole: string; // Changed from 'role' to 'siteRole' to match database schema
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface PersonnelResponse {
    personnel: SitePersonnel[];
  }

  // Query to fetch site personnel
  const { data, isLoading, isError, error } = useQuery<PersonnelResponse, Error>({
    queryKey: [`/api/sites/${siteId}/personnel`],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Mutation to remove personnel from site
  const removeMutation = useMutation({
    mutationFn: async (personnelId: number) => {
      const response = await apiRequest("DELETE", `/api/sites/${siteId}/personnel/${personnelId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Personnel Removed",
        description: "The user has been removed from this site.",
      });
      
      // Invalidate site personnel queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove personnel from site.",
        variant: "destructive",
      });
      setDeleteId(null);
    },
  });
  
  // Format date helper function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  // Get role badge color based on role
  const getRoleBadge = (role: string) => {
    const roleStyles = {
      site_manager: "bg-blue-500",
      safety_coordinator: "bg-green-500",
      foreman: "bg-amber-500",
      worker: "bg-slate-500",
      subcontractor: "bg-purple-500",
      visitor: "bg-gray-500",
    };
    
    return (
      <Badge className={roleStyles[role as keyof typeof roleStyles] || "bg-gray-500"}>
        {role.replace("_", " ")}
      </Badge>
    );
  };
  
  // Determine if user can edit/delete based on permissions
  const canModify = () => {
    return user?.role === "super_admin" || user?.role === "safety_officer";
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading personnel: {(error as Error).message}</p>
      </div>
    );
  }
  
  // Render empty state
  if (!data?.personnel || data.personnel.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <UserMinus className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No Personnel Assigned</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are no personnel assigned to this site yet.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableCaption>Site personnel list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.personnel.map((person: any) => (
            <TableRow key={person.id}>
              <TableCell className="font-medium">{person.userName}</TableCell>
              <TableCell>{person.userEmail}</TableCell>
              <TableCell>{getRoleBadge(person.siteRole)}</TableCell>
              <TableCell>{formatDate(person.startDate)}</TableCell>
              <TableCell>{formatDate(person.endDate)}</TableCell>
              <TableCell className="text-right">
                {canModify() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit && onEdit(person.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(person.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Confirmation dialog for removal */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the personnel from this site. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && removeMutation.mutate(deleteId)}
              className="bg-red-600 focus:ring-red-600"
            >
              {removeMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Removing...
                </span>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}