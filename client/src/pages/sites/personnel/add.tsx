import { useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { format } from "date-fns";

// Define the schema for adding personnel to a site
const formSchema = z.object({
  userId: z.string().min(1, "User is required"),
  siteRole: z.enum(["site_manager", "safety_coordinator", "foreman", "worker", "subcontractor", "visitor"]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  teamId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddSitePersonnel() {
  const [location] = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const siteId = location.split("/")[2]; // Get siteId from URL /sites/1/personnel/add

  // Query to get site details
  const siteQuery = useQuery({
    queryKey: ['/api/sites', siteId],
    queryFn: ({ signal }) => fetch(`/api/sites/${siteId}`, { signal }).then(res => res.json()),
  });

  // Query to get all users for selection
  const usersQuery = useQuery({
    queryKey: ['/api/users'],
    queryFn: ({ signal }) => fetch(`/api/users`, { signal }).then(res => res.json()).then(data => data.users || []),
  });

  // Query to get teams for this site
  const teamsQuery = useQuery({
    queryKey: ['/api/sites', siteId, 'teams'],
    queryFn: ({ signal }) => fetch(`/api/sites/${siteId}/teams`, { signal })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
      })
      .then(data => data.teams || data || []),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      siteRole: "worker",
      notes: "",
    },
  });

  const assignPersonnelMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert dates to ISO strings for the API
      const apiData = {
        ...data,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : null,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        userId: parseInt(data.userId),
        teamId: data.teamId ? parseInt(data.teamId) : null,
      };

      return apiRequest('POST', `/api/sites/${siteId}/personnel`, apiData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personnel successfully assigned to site",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sites', siteId, 'personnel'] });
      navigate(`/sites/${siteId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to assign personnel: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    assignPersonnelMutation.mutate(data);
  };

  const isLoading = usersQuery.isLoading || siteQuery.isLoading || teamsQuery.isLoading || assignPersonnelMutation.isPending;

  return (
    <Layout>
      <PageHeader
        title="Assign Personnel to Site"
        subtitle={`Assign personnel to ${siteQuery.data?.name || 'site'}`}
        backButton={`/sites/${siteId}`}
      />

      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Assign Personnel</CardTitle>
            <CardDescription>
              Assign a user to this site with a specific role and optional team membership.
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
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usersQuery.data?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstName} {user.lastName} ({user.email})
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
                          <SelectItem value="site_manager">Site Manager</SelectItem>
                          <SelectItem value="safety_coordinator">Safety Coordinator</SelectItem>
                          <SelectItem value="foreman">Foreman</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="subcontractor">Subcontractor</SelectItem>
                          <SelectItem value="visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Specify the role this person will have at the site.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Team</SelectItem>
                          {teamsQuery.data?.map((team: any) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optionally assign this person to a team at the site.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          }
                        }}
                        disabled={isLoading}
                      />
                      <FormDescription>
                        When this person will start working at the site.
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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          }
                        }}
                        disabled={isLoading}
                      />
                      <FormDescription>
                        When this person will finish working at the site.
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
                          placeholder="Any additional notes about this personnel assignment..."
                          className="resize-none"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional information about this assignment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/sites/${siteId}`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Assign Personnel
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