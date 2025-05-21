import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Form schema for site creation
const siteFormSchema = z.object({
  name: z.string().min(3, "Site name must be at least 3 characters"),
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "City name is required"),
  state: z.string().min(2, "State/province is required"),
  zipCode: z.string().min(3, "Postal/ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  gpsCoordinates: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["planned", "active", "completed", "on_hold"]),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

export default function NewSitePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues: Partial<SiteFormValues> = {
    status: "planned",
    country: "United States",
  };
  
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues,
  });

  const createSiteMutation = useMutation({
    mutationFn: async (values: SiteFormValues) => {
      const response = await apiRequest("POST", "/api/sites", values);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create site");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sites'] });
      toast({
        title: "Site created",
        description: "The construction site has been added successfully",
      });
      navigate("/sites");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create site",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: SiteFormValues) => {
    createSiteMutation.mutate(values);
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/sites")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sites
        </Button>
        <h1 className="text-2xl font-bold">Add New Construction Site</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Enter the details of the construction site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, identifiable name for the construction site
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
                        placeholder="Brief description of the construction project" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select site status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Location</CardTitle>
              <CardDescription>The physical address and coordinates of the site</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Construction Ave" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State or Province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP or Postal Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gpsCoordinates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS Coordinates (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 37.7749, -122.4194" {...field} />
                    </FormControl>
                    <FormDescription>
                      Precise location coordinates for mapping and navigation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Primary site contact details</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Site manager or primary contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Project Timeline</CardTitle>
              <CardDescription>Estimated or actual project dates</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank for ongoing projects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => navigate("/sites")}
                disabled={createSiteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createSiteMutation.isPending}
              >
                {createSiteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Site"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </Layout>
  );
}