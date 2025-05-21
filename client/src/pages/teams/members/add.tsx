import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout";
import { PageHeader } from "@/components/page-header";

// Define the schema for adding personnel to a team
const formSchema = z.object({
  personnelId: z.string().min(1, "Personnel is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddTeamMember() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const teamId = location.split("/")[2]; // Get teamId from URL /teams/1/members/add

  // Query to get team details
  const teamQuery = useQuery({
    queryKey: ['/api/teams', teamId],
    queryFn: ({ signal }) => fetch(`/api/teams/${teamId}`, { signal }).then(res => res.json()),
  });

  // Query to get site details to retrieve site personnel
  const siteQuery = useQuery({
    queryKey: ['/api/sites', teamQuery.data?.siteId],
    queryFn: ({ signal }) => 
      teamQuery.data?.siteId 
        ? fetch(`/api/sites/${teamQuery.data.siteId}`, { signal }).then(res => res.json())
        : Promise.resolve(null),
    enabled: !!teamQuery.data?.siteId,
  });

  // Query to get site personnel that are not already on the team
  const personnelQuery = useQuery({
    queryKey: ['/api/sites', teamQuery.data?.siteId, 'personnel'],
    queryFn: ({ signal }) => 
      teamQuery.data?.siteId 
        ? fetch(`/api/sites/${teamQuery.data.siteId}/personnel`, { signal }).then(res => res.json())
        : Promise.resolve({ personnel: [] }),
    enabled: !!teamQuery.data?.siteId,
  });

  // Query to get current team members to filter out from available personnel
  const teamMembersQuery = useQuery({
    queryKey: ['/api/teams', teamId, 'members'],
    queryFn: ({ signal }) => fetch(`/api/teams/${teamId}/members`, { signal }).then(res => res.json()),
  });

  // Filter out personnel who are already team members
  const [availablePersonnel, setAvailablePersonnel] = useState<any[]>([]);

  useEffect(() => {
    console.log("Personnel data:", personnelQuery.data);
    console.log("Team members data:", teamMembersQuery.data);
    
    if (personnelQuery.data?.personnel && teamMembersQuery.data) {
      const personnel = personnelQuery.data.personnel || [];
      const teamMembers = teamMembersQuery.data || [];
      
      console.log("Personnel before filtering:", personnel);
      console.log("Team members:", teamMembers);
      
      // Get IDs of current team members
      const teamMemberIds = teamMembers.map((member: any) => member.id);
      console.log("Team member IDs:", teamMemberIds);
      
      // Filter out personnel who are already on the team
      const available = personnel.filter((person: any) => !teamMemberIds.includes(person.id));
      console.log("Available personnel after filtering:", available);
      
      setAvailablePersonnel(available);
    }
  }, [personnelQuery.data, teamMembersQuery.data]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnelId: "",
    },
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Ensure we're sending with credentials included
      const response = await fetch(`/api/teams/${teamId}/members/${data.personnelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personnel successfully added to team",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId, 'members'] });
      setLocation(`/teams/${teamId}`);
    },
    onError: (error: Error) => {
      console.error("Team member addition error:", error);
      toast({
        title: "Error",
        description: `Failed to add personnel to team: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    addTeamMemberMutation.mutate(data);
  };

  const isLoading = teamQuery.isLoading || siteQuery.isLoading || personnelQuery.isLoading || 
                   teamMembersQuery.isLoading || addTeamMemberMutation.isPending;

  return (
    <Layout>
      <PageHeader
        title="Add Team Member"
        subtitle={`Add personnel to ${teamQuery.data?.name || 'team'}`}
        backButton={`/teams/${teamId}`}
      />

      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Team Member</CardTitle>
            <CardDescription>
              Add personnel from this site to the team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="personnelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personnel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select personnel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePersonnel.length === 0 && (
                            <SelectItem value="none" disabled>
                              No available personnel
                            </SelectItem>
                          )}
                          {availablePersonnel.map((person: any) => (
                            <SelectItem key={person.id} value={person.id.toString()}>
                              {person.userName || `User ${person.userId}`} - {person.siteRole.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select personnel to add to this team. Only personnel from the same site are available.
                      </FormDescription>
                      <FormMessage />
                      {availablePersonnel.length === 0 && (
                        <div className="mt-2 text-sm text-amber-600 bg-amber-50 rounded p-3 border border-amber-200">
                          <p className="font-medium mb-1">No available personnel found for this site.</p>
                          <p className="mb-1">This could be because:</p>
                          <ul className="list-disc ml-5 mb-1">
                            <li>All site personnel are already assigned to this team</li>
                            <li>There are no personnel assigned to this site yet</li>
                          </ul>
                          <Link href={`/sites/${teamQuery.data?.siteId}/personnel/add`} className="text-blue-600 hover:underline">
                            Click here to add personnel to this site first.
                          </Link>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/teams/${teamId}`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || availablePersonnel.length === 0}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add to Team
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