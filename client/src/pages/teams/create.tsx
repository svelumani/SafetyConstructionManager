import React, { useEffect } from "react";
import Layout from "@/components/layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  specialty: z.string().optional(),
  description: z.string().optional(),
  primarySiteId: z.number().optional(),
  siteIds: z.array(z.number()).optional(),
  isActive: z.boolean().default(true),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function CreateTeamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get querystring parameters
  const params = new URLSearchParams(window.location.search);
  const siteIdParam = params.get('siteId');
  const initialSiteId = siteIdParam ? parseInt(siteIdParam) : undefined;
  
  // Fetch sites for dropdown
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['/api/sites'],
    queryFn: () => fetch('/api/sites').then(res => res.json()).then(data => data.sites)
  });
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      specialty: "",
      description: "",
      primarySiteId: initialSiteId,
      siteIds: initialSiteId ? [initialSiteId] : [],
      isActive: true,
    },
  });
  
  // Update form when siteId param changes
  useEffect(() => {
    if (initialSiteId) {
      form.setValue("primarySiteId", initialSiteId);
      form.setValue("siteIds", [initialSiteId]);
    }
  }, [initialSiteId, form]);
  
  const createTeamMutation = useMutation({
    mutationFn: async (values: TeamFormValues) => {
      const response = await apiRequest("POST", "/api/teams", values);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create team");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team created",
        description: "The team has been created successfully",
      });
      
      if (initialSiteId) {
        navigate(`/sites/${initialSiteId}`);
      } else {
        navigate("/teams");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: TeamFormValues) => {
    // Map the form values to match the server's expected structure
    const serverValues = {
      ...values,
      // Add siteId field - this is what the server expects
      siteId: values.primarySiteId
    };
    createTeamMutation.mutate(serverValues);
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => initialSiteId ? navigate(`/sites/${initialSiteId}`) : navigate("/teams")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {initialSiteId ? "Back to Site Details" : "Back to Teams"}
        </Button>
        <h1 className="text-2xl font-bold">Create New Team</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>
            Create a new team to organize personnel, manage safety protocols, and coordinate activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Electrical, Plumbing, Concrete, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Area of expertise for this team
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
                        placeholder="Brief description of the team and its purpose"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primarySiteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Site</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sitesLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading sites...
                          </div>
                        ) : (
                          sites?.map((site: any) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The main construction site for this team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Team</FormLabel>
                      <FormDescription>
                        Indicates whether this team is currently active
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    initialSiteId ? navigate(`/sites/${initialSiteId}`) : navigate("/teams")
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Team
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}