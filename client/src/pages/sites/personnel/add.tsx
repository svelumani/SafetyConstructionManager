import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

// Define the schema for adding personnel to a site
const formSchema = z.object({
  userId: z.string().min(1, "User is required"),
  siteRole: z.enum(["site-manager", "safety-coordinator", "foreman", "worker", "subcontractor", "visitor"], {
    required_error: "Site role is required",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddSitePersonnel() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const siteId = location.split("/")[2]; // Get siteId from URL /sites/1/personnel/add

  // Query to get site details
  const siteQuery = useQuery({
    queryKey: ['/api/sites', siteId],
    queryFn: ({ signal }) => fetch(`/api/sites/${siteId}`, { signal }).then(res => res.json()),
  });

  // Query to get users that are not already assigned to this site
  const usersQuery = useQuery({
    queryKey: ['/api/users'],
    queryFn: ({ signal }) => fetch('/api/users', { signal }).then(res => res.json()),
  });

  // Query to get personnel already assigned to the site
  const sitePersonnelQuery = useQuery({
    queryKey: ['/api/sites', siteId, 'personnel'],
    queryFn: ({ signal }) => fetch(`/api/sites/${siteId}/personnel`, { signal }).then(res => res.json()),
  });

  // Filter out users who are already assigned to this site
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // Update available users when queries complete
  useEffect(() => {
    if (usersQuery.data?.users && sitePersonnelQuery.data?.personnel) {
      const users = usersQuery.data.users || [];
      const personnel = sitePersonnelQuery.data.personnel || [];
      
      // Get IDs of users already assigned to this site
      const assignedUserIds = personnel.map((person: any) => person.userId);
      
      // Filter out users who are already assigned to this site
      const available = users.filter((user: any) => !assignedUserIds.includes(user.id));
      setAvailableUsers(available);
    }
  }, [usersQuery.data, sitePersonnelQuery.data]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      siteRole: undefined,
      notes: "",
    },
  });

  const addPersonnelMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Format dates if provided
      const formattedData = {
        ...data,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : null,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
      };
      
      return apiRequest('POST', `/api/sites/${siteId}/personnel`, formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personnel successfully added to site",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sites', siteId, 'personnel'] });
      setLocation(`/sites/${siteId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add personnel to site: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    addPersonnelMutation.mutate(data);
  };

  const isLoading = siteQuery.isLoading || usersQuery.isLoading || 
                   sitePersonnelQuery.isLoading || addPersonnelMutation.isPending;

  return (
    <Layout>
      <PageHeader
        title="Add Personnel to Site"
        subtitle={`Add user to ${siteQuery.data?.name || 'site'}`}
        backButton={`/sites/${siteId}`}
      />

      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Personnel</CardTitle>
            <CardDescription>
              Assign a user to this site with a specific role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUsers.length === 0 && (
                            <SelectItem value="none" disabled>
                              No available users
                            </SelectItem>
                          )}
                          {availableUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name || user.username || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a user to assign to this site.
                      </FormDescription>
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
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="site-manager">Site Manager</SelectItem>
                          <SelectItem value="safety-coordinator">Safety Coordinator</SelectItem>
                          <SelectItem value="foreman">Foreman</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="subcontractor">Subcontractor</SelectItem>
                          <SelectItem value="visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The role of this person at the site.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                        />
                        <FormDescription>
                          When this person starts working at the site.
                        </FormDescription>
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
                        />
                        <FormDescription>
                          When this person finishes working at the site (optional).
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information about this assignment"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional notes about this personnel assignment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/sites/${siteId}`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || availableUsers.length === 0}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add to Site
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