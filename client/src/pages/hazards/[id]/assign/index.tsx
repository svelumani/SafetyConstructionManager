import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHazardAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { cn, formatUTCToLocal } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "wouter";

interface HazardDetail {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  siteId: number;
  site: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Subcontractor {
  id: number;
  name: string;
  contactPerson: string;
}

// Assignment target options
const TARGET_OPTIONS = {
  USER: "user",
  SUBCONTRACTOR: "subcontractor",
};

// Extended schema with validation
const formSchema = insertHazardAssignmentSchema.extend({
  assignmentTarget: z.enum([TARGET_OPTIONS.USER, TARGET_OPTIONS.SUBCONTRACTOR]),
  dueDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AssignHazard() {
  const params = useParams<{ id: string }>();
  const hazardId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [assignmentTarget, setAssignmentTarget] = useState(TARGET_OPTIONS.USER);

  // Fetch hazard details
  const { data: hazard, isLoading: isLoadingHazard } = useQuery<HazardDetail>({
    queryKey: ["/api/hazards", hazardId],
  });

  // Fetch site personnel
  const { data: personnelData, isLoading: isLoadingPersonnel } = useQuery<{
    personnel: User[];
  }>({
    queryKey: ["/api/sites", hazard?.siteId, "personnel"],
    enabled: !!hazard?.siteId,
  });

  // Fetch subcontractors
  const { data: subcontractorsData, isLoading: isLoadingSubcontractors } = useQuery<{
    subcontractors: Subcontractor[];
  }>({
    queryKey: ["/api/subcontractors"],
    enabled: assignmentTarget === TARGET_OPTIONS.SUBCONTRACTOR,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hazardId,
      assignmentTarget: TARGET_OPTIONS.USER,
      notes: "",
    },
  });

  // Watch for changes to assignmentTarget
  const currentAssignmentTarget = form.watch("assignmentTarget");
  
  // Update UI state when form field changes
  if (currentAssignmentTarget !== assignmentTarget) {
    setAssignmentTarget(currentAssignmentTarget);
  }

  const assignHazardMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { assignmentTarget, dueDate, ...assignmentData } = data;
      
      // Convert due date to ISO string if present
      const payload = {
        ...assignmentData,
        ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
      };
      
      const response = await apiRequest("POST", `/api/hazards/${hazardId}/assignments`, payload);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hazard assigned",
        description: "Hazard has been successfully assigned",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/hazards', hazardId] });
      queryClient.invalidateQueries({ queryKey: ['/api/hazards', hazardId, 'assignments'] });
      
      // Redirect back to hazard details
      setLocation(`/hazards/${hazardId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to assign hazard: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    assignHazardMutation.mutate(data);
  };

  const isLoading = isLoadingHazard || isLoadingPersonnel || (assignmentTarget === TARGET_OPTIONS.SUBCONTRACTOR && isLoadingSubcontractors);

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href={`/hazards/${hazardId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Hazard
            </Link>
          </Button>
        </div>
        
        <PageHeader 
          title="Assign Hazard" 
          description={hazard ? `Assign "${hazard.title}" to a user or subcontractor` : "Loading hazard details..."}
        />
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {assignHazardMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {assignHazardMutation.error.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Display hazard summary */}
                {hazard && (
                  <div className="bg-muted p-4 rounded-md mb-6">
                    <h3 className="font-medium mb-2">Hazard Summary</h3>
                    <p className="text-sm mb-1"><strong>Title:</strong> {hazard.title}</p>
                    <p className="text-sm mb-1"><strong>Severity:</strong> {hazard.severity}</p>
                    <p className="text-sm mb-1"><strong>Site:</strong> {hazard.site ? hazard.site.name : "Unknown Site"}</p>
                    <p className="text-sm"><strong>Description:</strong> {hazard.description ? `${hazard.description.substring(0, 100)}...` : "No description available"}</p>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="assignmentTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TARGET_OPTIONS.USER}>Personnel</SelectItem>
                          <SelectItem value={TARGET_OPTIONS.SUBCONTRACTOR}>Subcontractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose whether to assign to site personnel or a subcontractor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {assignmentTarget === TARGET_OPTIONS.USER && (
                  <FormField
                    control={form.control}
                    name="assignedToUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personnel</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select personnel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isLoadingPersonnel && personnelData?.personnel.map((person) => (
                              <SelectItem key={person.id} value={person.id.toString()}>
                                {person.firstName} {person.lastName}
                              </SelectItem>
                            ))}
                            {isLoadingPersonnel && (
                              <SelectItem value="loading" disabled>
                                Loading personnel...
                              </SelectItem>
                            )}
                            {!isLoadingPersonnel && (!personnelData?.personnel || personnelData.personnel.length === 0) && (
                              <SelectItem value="none" disabled>
                                No personnel available for this site
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the person responsible for addressing this hazard
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {assignmentTarget === TARGET_OPTIONS.SUBCONTRACTOR && (
                  <FormField
                    control={form.control}
                    name="assignedToSubcontractorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcontractor</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcontractor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isLoadingSubcontractors && subcontractorsData?.subcontractors.map((subcontractor) => (
                              <SelectItem key={subcontractor.id} value={subcontractor.id.toString()}>
                                {subcontractor.name}
                              </SelectItem>
                            ))}
                            {isLoadingSubcontractors && (
                              <SelectItem value="loading" disabled>
                                Loading subcontractors...
                              </SelectItem>
                            )}
                            {!isLoadingSubcontractors && (!subcontractorsData?.subcontractors || subcontractorsData.subcontractors.length === 0) && (
                              <SelectItem value="none" disabled>
                                No subcontractors available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the subcontractor responsible for addressing this hazard
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Set a deadline for resolving this hazard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any special instructions or context"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide any additional information that might help with addressing the hazard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/hazards/${hazardId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={assignHazardMutation.isPending || isLoading}
                  >
                    {assignHazardMutation.isPending ? "Assigning..." : "Assign Hazard"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}