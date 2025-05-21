import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
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
import { Site, User } from "@shared/schema";

const teamFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  siteId: z.coerce.number().positive("Please select a site"),
  leaderId: z.coerce.number().optional(),
  specialties: z.record(z.string(), z.string()).optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export default function CreateTeamPage() {
  requirePermission("teams", "create");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<Record<string, string>>({});
  const [newSpecialtyKey, setNewSpecialtyKey] = useState("");
  const [newSpecialtyValue, setNewSpecialtyValue] = useState("");

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
      color: "#3B82F6", // Default blue color
      siteId: undefined,
      leaderId: undefined,
      specialties: {},
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      const res = await apiRequest("POST", "/api/teams", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Team created",
        description: "The team has been created successfully",
      });
      navigate("/teams");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamFormValues) => {
    data.specialties = specialties;
    createTeamMutation.mutate(data);
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

  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title="Create Team"
          description="Add a new team to your organization"
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate("/teams")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
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
                          defaultValue={field.value?.toString()}
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
                          Select the site this team will be associated with
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
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team leader (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    onClick={() => navigate("/teams")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTeamMutation.isPending}
                  >
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
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