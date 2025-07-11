import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, ClipboardList, Clock } from "lucide-react";
import { format } from "date-fns";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Interface definitions for API responses
interface Site {
  id: number;
  name: string;
  address: string;
  // ... other site properties
}

interface SitesResponse {
  sites: Site[];
  total: number;
}

interface InspectionTemplate {
  id: number;
  name: string;
  description?: string;
  // ... other template properties
}

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  role: string;
  // ... other user properties
}

interface UsersResponse {
  users: User[];
  total: number;
}

// Schema validation for the form
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  siteId: z.coerce.number().min(1, "Site is required"),
  templateId: z.coerce.number().min(1, "Template is required"),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewInspection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get query params
  const params = new URLSearchParams(window.location.search);
  const templateIdParam = params.get('templateId');

  // Fetch sites
  const { data: sitesResponse } = useQuery({
    queryKey: ['/api/sites'],
  });
  
  // Ensure sites is always an array with proper type guard
  const sites = (sitesResponse as SitesResponse)?.sites || [];

  // Fetch templates
  const { data: templatesResponse } = useQuery({
    queryKey: ['/api/inspection-templates'],
  });
  
  // Ensure templates is always an array
  const templates = Array.isArray(templatesResponse) ? templatesResponse as InspectionTemplate[] : [];

  // Fetch users
  const { data: usersResponse } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Ensure users is always an array with proper type guard
  const users = (usersResponse as UsersResponse)?.users || [];

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      siteId: 0,
      templateId: templateIdParam ? parseInt(templateIdParam) : 0,
      scheduledDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days after scheduled date
      notes: "",
    },
  });

  // Fetch the current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
  });

  // Type guard for currentUser
  const typedCurrentUser = currentUser as User | undefined;

  // Mutation for creating a new inspection
  const createInspectionMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!typedCurrentUser?.id) {
        throw new Error("You must be logged in to create an inspection");
      }
      
      const response = await apiRequest("POST", "/api/inspections", {
        ...data,
        status: "scheduled",
        created_by_id: typedCurrentUser.id,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create inspection");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      toast({
        title: "Success",
        description: "Inspection scheduled successfully",
      });
      navigate("/inspections");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule inspection",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createInspectionMutation.mutate(data);
  };

  // Pre-fill title and description when template changes
  useEffect(() => {
    const templateId = form.watch("templateId");
    if (templateId) {
      const selectedTemplate = templates.find((t) => t.id === templateId);
      if (selectedTemplate) {
        form.setValue("title", `${selectedTemplate.name}`);
        form.setValue("description", selectedTemplate.description || '');
      }
    }
  }, [form.watch("templateId"), templates, form]);

  return (
    <Layout>
      <PageHeader
        title="Schedule New Inspection"
        description="Create a new safety inspection using a template"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Template</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem
                              key={template.id}
                              value={template.id.toString()}
                            >
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem
                              key={site.id}
                              value={site.id.toString()}
                            >
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Fire Safety Inspection - Building A" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for this specific inspection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose and scope of this inspection"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date</FormLabel>
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
                        When this inspection should be conducted
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an inspector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Unassigned</SelectItem>
                          {users
                            .filter((user) => user.role === "safety_officer" || user.role === "supervisor")
                            .map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Safety officer or supervisor who will conduct this inspection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
                              <Clock className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues("scheduledDate")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Deadline by which this inspection must be completed
                      </FormDescription>
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
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information or special instructions for this inspection"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/inspections")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Scheduling...</>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  Schedule Inspection
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}