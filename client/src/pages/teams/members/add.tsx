import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "wouter";
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
import PageHeader from "@/components/page-header";

// Define the schema for adding personnel to a team
const formSchema = z.object({
  personnelId: z.string().min(1, "Personnel is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddTeamMember() {
  const [location] = useLocation();
  const navigate = useNavigate();
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
    if (personnelQuery.data?.personnel && teamMembersQuery.data) {
      const personnel = personnelQuery.data.personnel || [];
      const teamMembers = teamMembersQuery.data || [];
      
      // Get IDs of current team members
      const teamMemberIds = teamMembers.map((member: any) => member.id);
      
      // Filter out personnel who are already on the team
      const available = personnel.filter((person: any) => !teamMemberIds.includes(person.id));
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
      return apiRequest('POST', `/api/teams/${teamId}/members/${data.personnelId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personnel successfully added to team",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId, 'members'] });
      navigate(`/teams/${teamId}`);
    },
    onError: (error: Error) => {
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
                              {person.userName || `User ${person.userId}`} - {person.siteRole}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select personnel to add to this team. Only personnel from the same site are available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/teams/${teamId}`)}
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