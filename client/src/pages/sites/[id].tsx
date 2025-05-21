import { useState } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUTCToLocal, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

// Form schema for site update
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

interface Site {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  gpsCoordinates: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SiteDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const siteId = parseInt(params.id);

  // Fetch site data
  const {
    data: site,
    isLoading,
    error,
  } = useQuery<Site>({
    queryKey: [`/api/sites/${siteId}`],
    enabled: !isNaN(siteId),
  });

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: site?.name || "",
      address: site?.address || "",
      city: site?.city || "",
      state: site?.state || "",
      zipCode: site?.zipCode || "",
      country: site?.country || "",
      gpsCoordinates: site?.gpsCoordinates || "",
      contactName: site?.contactName || "",
      contactPhone: site?.contactPhone || "",
      contactEmail: site?.contactEmail || "",
      startDate: site?.startDate || "",
      endDate: site?.endDate || "",
      status: (site?.status as any) || "active",
      description: site?.description || "",
    },
    values: site as any,
  });

  // Update form values when site data changes
  React.useEffect(() => {
    if (site) {
      form.reset(site as any);
    }
  }, [site, form]);

  const updateSiteMutation = useMutation({
    mutationFn: async (values: SiteFormValues) => {
      const response = await apiRequest("PUT", `/api/sites/${siteId}`, values);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update site");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "Site updated",
        description: "Site information has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update site",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/sites/${siteId}`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete site");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "Site deleted",
        description: "The site has been permanently deleted",
      });
      navigate("/sites");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete site",
        description: error.message,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    },
  });

  const onSubmit = (values: SiteFormValues) => {
    updateSiteMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/sites")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sites
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (error || !site) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/sites")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sites
          </Button>
          <h1 className="text-2xl font-bold">Site Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Site</CardTitle>
            <CardDescription>
              There was a problem loading the site details. Please try again or go back to the sites list.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/sites")}>Return to Sites List</Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/sites")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sites
          </Button>
          <h1 className="text-2xl font-bold">{site.name}</h1>
        </div>
        
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit Site
              </Button>
              <Button 
                variant="outline" 
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        // Edit Mode
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Site Information</CardTitle>
                <CardDescription>Update the construction site details</CardDescription>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Contact Information</CardTitle>
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
                  onClick={() => setIsEditing(false)}
                  disabled={updateSiteMutation.isPending}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSiteMutation.isPending}
                >
                  {updateSiteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      ) : (
        // View Mode
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Site Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p>{site.description || "No description provided."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                    <Badge variant="outline" className={cn(
                      "px-2 py-1 text-xs rounded-full font-medium",
                      site.status === "active" ? "bg-green-100 text-success" :
                      site.status === "planned" ? "bg-blue-100 text-primary" :
                      site.status === "completed" ? "bg-purple-100 text-purple-600" :
                      site.status === "on_hold" ? "bg-amber-100 text-amber-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {site.status.charAt(0).toUpperCase() + site.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{site.address}</p>
                        <p>{site.city}, {site.state} {site.zipCode}</p>
                        <p>{site.country}</p>
                        {site.gpsCoordinates && (
                          <p className="text-sm text-muted-foreground mt-1">
                            GPS: {site.gpsCoordinates}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(site.contactName || site.contactEmail || site.contactPhone) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Primary Contact</h3>
                      {site.contactName && (
                        <p className="font-medium">{site.contactName}</p>
                      )}
                      <div className="space-y-1">
                        {site.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{site.contactEmail}</span>
                          </div>
                        )}
                        {site.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{site.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Project Timeline</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {site.startDate ? formatUTCToLocal(site.startDate, "PPP") : "—"} 
                        {" to "} 
                        {site.endDate ? formatUTCToLocal(site.endDate, "PPP") : "Present"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" asChild>
                      <a href={`/hazards/new?site=${site.id}`}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Report Hazard
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href={`/inspections/new?site=${site.id}`}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Schedule Inspection
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(`${site.address}, ${site.city}, ${site.state} ${site.zipCode}`)}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Maps
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Site Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Hazards</div>
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">No active hazards</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Inspections</div>
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">None scheduled</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Incidents</div>
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">No incidents reported</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent events and updates for this site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activity recorded yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Site Teams</CardTitle>
                <CardDescription>Personnel assigned to this construction site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No teams assigned to this site yet</p>
                  <Button variant="outline" className="mt-4">Assign Personnel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this site?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the site 
              "{site.name}" and all associated data including hazard reports, 
              inspections, and other records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteSiteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteSiteMutation.mutate()}
              disabled={deleteSiteMutation.isPending}
            >
              {deleteSiteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Site"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}