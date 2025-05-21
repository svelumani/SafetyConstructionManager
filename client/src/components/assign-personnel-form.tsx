import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

// Create a schema for the form that matches our SitePersonnel type
const assignPersonnelSchema = z.object({
  userId: z.string().min(1, { message: "Please select a user" }),
  siteRole: z.string().min(1, { message: "Please select a role" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

type AssignPersonnelValues = z.infer<typeof assignPersonnelSchema>;

interface AssignPersonnelFormProps {
  siteId: number;
  onSuccess?: () => void;
}

export function AssignPersonnelForm({ siteId, onSuccess }: AssignPersonnelFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to get all users for dropdown
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
    select: (data) => data.users,
  });
  
  // Form definition
  const form = useForm<AssignPersonnelValues>({
    resolver: zodResolver(assignPersonnelSchema),
    defaultValues: {
      userId: "",
      siteRole: "worker",
      notes: "",
    },
  });
  
  // Get the current user for assignedById
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
  });
  
  // Handle form submission
  const assignMutation = useMutation({
    mutationFn: async (values: AssignPersonnelValues) => {
      if (!currentUser) {
        throw new Error("User must be logged in to assign personnel");
      }
      
      const response = await apiRequest("POST", `/api/sites/${siteId}/personnel`, {
        userId: parseInt(values.userId),
        siteRole: values.siteRole,
        startDate: values.startDate ? format(values.startDate, "yyyy-MM-dd") : undefined,
        endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : undefined,
        notes: values.notes,
        tenantId: currentUser.tenantId,
        assignedById: currentUser.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Personnel Assigned",
        description: "The user has been successfully assigned to this site.",
      });
      
      // Invalidate site personnel queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      
      // Reset the form
      form.reset({
        userId: "",
        siteRole: "worker",
        startDate: undefined,
        endDate: undefined,
        notes: "",
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign personnel to site.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: AssignPersonnelValues) {
    assignMutation.mutate(values);
  }
  
  // Handle validation of date ranges
  useEffect(() => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate && startDate > endDate) {
      form.setError("endDate", {
        type: "manual",
        message: "End date cannot be before start date",
      });
    } else {
      form.clearErrors("endDate");
    }
  }, [form.watch("startDate"), form.watch("endDate")]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingUsers || assignMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={assignMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="site_manager">Site Manager</SelectItem>
                  <SelectItem value="safety_coordinator">Safety Coordinator</SelectItem>
                  <SelectItem value="foreman">Foreman</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  disabled={assignMutation.isPending}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  disabled={assignMutation.isPending}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional information here..."
                  {...field}
                  disabled={assignMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={assignMutation.isPending}>
            {assignMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign to Site
          </Button>
        </div>
      </form>
    </Form>
  );
}