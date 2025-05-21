import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Trash2 } from "lucide-react";
import { z } from "zod";

import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requirePermission } from "@/lib/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Team, Site, User } from "@shared/schema";

const teamFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  siteId: z.coerce.number().positive("Please select a site"),
  leaderId: z.coerce.number().optional(),
  specialties: z.record(z.string(), z.string()).optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export default function EditTeamPage() {
  requirePermission("teams", "update");
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<Record<string, string>>({});
  const [newSpecialtyKey, setNewSpecialtyKey] = useState("");
  const [newSpecialtyValue, setNewSpecialtyValue] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const teamId = parseInt(params.id);

  // Fetch team data
  const { data: team, isLoading: isLoadingTeam } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !isNaN(teamId),
  });

  // Fetch sites for dropdown
  const { data: sites } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  // Fetch users for leader selection
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      siteId: undefined,
      leaderId: undefined,
      specialties: {},
    },
  });

  // Update form values when team data is loaded
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || "",
        color: team.color || "#3B82F6",
        siteId: team.siteId,
        leaderId: team.leaderId || undefined,
        specialties: {},
      });

      if (team.specialties) {
        setSpecialties(team.specialties as Record<string, string>);
      }
    }
  }, [team, form]);

  const updateTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      const res = await apiRequest("PUT", `/api/teams/${teamId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
      toast({
        title: "Team updated",
        description: "The team has been updated successfully",
      });
      navigate(`/teams/${teamId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully",
      });
      navigate("/teams");
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamFormValues) => {
    data.specialties = specialties;
    updateTeamMutation.mutate(data);
  };

  const addSpecialty = () => {
    if (newSpecialtyKey && newSpecialtyValue) {
      setSpecialties({
        ...specialties,
        [newSpecialtyKey]: newSpecialtyValue,
      });
      setNewSpecialtyKey("");
      setNewSpecialtyValue("");
    }
  };

  const removeSpecialty = (key: string) => {
    const updatedSpecialties = { ...specialties };
    delete updatedSpecialties[key];
    setSpecialties(updatedSpecialties);
  };

  const handleDelete = () => {
    deleteTeamMutation.mutate();
    setDeleteDialogOpen(false);
  };

  if (isLoadingTeam) {
    return (
      <Layout>
        <div className="container py-6">
          <PageHeader
            title={<Skeleton className="h-8 w-48" />}
            description={<Skeleton className="h-4 w-64" />}
          />
          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!team && !isLoadingTeam) {
    return (
      <Layout>
        <div className="container py-6">
          <PageHeader
            title="Team Not Found"
            description="The requested team could not be found"
            actions={
              <Button variant="outline" size="sm" onClick={() => navigate("/teams")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Button>
            }
          />
          <Card className="mt-6 p-6 text-center">
            <p className="mb-4">The team you're looking for doesn't exist or you don't have permission to edit it.</p>
            <Button onClick={() => navigate("/teams")}>Go to Team List</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title={`Edit Team: ${team?.name}`}
          description="Update team information"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/teams/${teamId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {requirePermission("teams", "delete", false) && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Team</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this team? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteTeamMutation.isPending}
                      >
                        {deleteTeamMutation.isPending ? "Deleting..." : "Delete Team"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          }
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-28"
                          />
                        </div>
                        <FormDescription>Choose a color for the team</FormDescription>
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
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sites?.map((site) => (
                              <SelectItem key={site.id} value={site.id.toString()}>
                                {site.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the site this team is associated with
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leaderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Leader</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team leader (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No leader</SelectItem>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assign a leader to this team (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a description for this team"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the team's purpose and responsibilities
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Team Specialties</FormLabel>
                  <div className="mt-2 p-4 border rounded-md">
                    {Object.entries(specialties).length > 0 ? (
                      <div className="mb-4 grid gap-2">
                        {Object.entries(specialties).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-muted p-2 rounded-md"
                          >
                            <div>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecialty(key)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground mb-4 text-center py-6">
                        No specialties added yet
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Specialty name (e.g., Electrical)"
                        value={newSpecialtyKey}
                        onChange={(e) => setNewSpecialtyKey(e.target.value)}
                      />
                      <Input
                        placeholder="Details (e.g., Commercial wiring)"
                        value={newSpecialtyValue}
                        onChange={(e) => setNewSpecialtyValue(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSpecialty}
                      disabled={!newSpecialtyKey || !newSpecialtyValue}
                    >
                      Add Specialty
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/teams/${teamId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateTeamMutation.isPending}
                  >
                    {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
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