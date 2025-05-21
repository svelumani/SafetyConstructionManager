import React, { useEffect } from "react";
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

// Create a schema for the form
const editPersonnelSchema = z.object({
  siteRole: z.string().min(1, { message: "Please select a role" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

type EditPersonnelValues = z.infer<typeof editPersonnelSchema>;

interface EditPersonnelFormProps {
  siteId: number;
  personnelId: number;
  onSuccess?: () => void;
}

export function EditPersonnelForm({ siteId, personnelId, onSuccess }: EditPersonnelFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form definition - define this first so we can use it in the useEffect
  const form = useForm<EditPersonnelValues>({
    resolver: zodResolver(editPersonnelSchema),
    defaultValues: {
      siteRole: "",
      notes: "",
    },
  });
  
  // Get pre-filled data from the personnel list directly
  const { data: personnelListData, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: [`/api/sites/${siteId}/personnel`],
    enabled: !!siteId,
  });
  
  // Manually find the selected personnel from the list data
  React.useEffect(() => {
    if (personnelListData && personnelId) {
      const selectedPersonnel = personnelListData.personnel.find((p) => p.id === personnelId);
      if (selectedPersonnel) {
        console.log("Found personnel data:", selectedPersonnel);
        form.reset({
          siteRole: selectedPersonnel.siteRole,
          startDate: selectedPersonnel.startDate ? parseISO(selectedPersonnel.startDate) : undefined,
          endDate: selectedPersonnel.endDate ? parseISO(selectedPersonnel.endDate) : undefined,
          notes: selectedPersonnel.notes || "",
        });
      }
    }
  }, [personnelListData, personnelId, form]);
  
  // Handle form submission
  const updateMutation = useMutation({
    mutationFn: async (values: EditPersonnelValues) => {
      const response = await apiRequest("PATCH", `/api/sites/${siteId}/personnel/${personnelId}`, {
        siteRole: values.siteRole,
        startDate: values.startDate ? format(values.startDate, "yyyy-MM-dd") : undefined,
        endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : undefined,
        notes: values.notes,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update personnel");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Personnel Updated",
        description: "The personnel assignment has been successfully updated.",
      });
      
      // Invalidate site personnel queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update personnel assignment.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: EditPersonnelValues) {
    updateMutation.mutate(values);
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
  
  if (isLoadingPersonnel) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="siteRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={updateMutation.isPending}
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
                  disabled={updateMutation.isPending}
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
                  disabled={updateMutation.isPending}
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
                  disabled={updateMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Assignment
          </Button>
        </div>
      </form>
    </Form>
  );
}