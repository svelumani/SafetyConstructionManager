import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn, formatDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import Layout from "@/components/layout";

const incidentTypes = [
  "Fall",
  "Slip",
  "Trip",
  "Cut",
  "Burn",
  "Electrical",
  "Chemical Spill",
  "Equipment Failure",
  "Structural Failure",
  "Fire",
  "Vehicle Accident",
  "Other",
];

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  siteId: z.string().min(1, "Site is required"),
  incidentDate: z.date(),
  incidentType: z.string().min(1, "Incident type is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  severity: z.string().min(1, "Severity is required"),
  injuryOccurred: z.boolean().default(false),
  injuryDetails: z.string().optional(),
  witnesses: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewIncident() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Get sites for dropdown
  const { data: sitesData } = useQuery({
    queryKey: ["/api/sites"],
  });

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      incidentDate: new Date(),
      location: "",
      description: "",
      injuryOccurred: false,
      injuryDetails: "",
      witnesses: "",
      photoUrls: [],
    },
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const formData = {
        ...values,
        photoUrls: selectedPhotos,
        siteId: parseInt(values.siteId),
      };
      const res = await apiRequest("POST", "/api/incidents", formData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create incident");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Reported",
        description: "The incident has been successfully reported.",
      });
      navigate("/incidents");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create incident",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    createIncidentMutation.mutate(values);
  }

  // Handle image upload (simulated)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real implementation, this would upload to a storage service
    // For this demo, we'll simulate URLs
    const newPhotos = Array.from(files).map(
      (_, index) => `https://source.unsplash.com/random/800x600?safety&sig=${Date.now() + index}`
    );

    setSelectedPhotos([...selectedPhotos, ...newPhotos]);
  };

  return (
    <Layout title="Report Incident" description="Report a new workplace incident">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Report a Workplace Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Incident Details</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Incident Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief title of the incident" {...field} className="text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="siteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Site</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-base h-12">
                              <SelectValue placeholder="Select a site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sitesData?.sites?.map((site: any) => (
                              <SelectItem key={site.id} value={site.id.toString()} className="text-base">
                                {site.name}
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
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base">Date of Incident</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "text-left font-normal text-base h-12",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(field.value)
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
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Incident Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-base h-12">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentTypes.map((type) => (
                              <SelectItem key={type} value={type} className="text-base">
                                {type}
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
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Severity Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-base h-12">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minor" className="text-base">Minor</SelectItem>
                            <SelectItem value="moderate" className="text-base">Moderate</SelectItem>
                            <SelectItem value="major" className="text-base">Major</SelectItem>
                            <SelectItem value="critical" className="text-base">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Specific Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Where exactly did this happen?" {...field} className="text-base" />
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
                      <FormLabel className="text-base">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about what happened"
                          className="min-h-[120px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what happened, including any factors that might have contributed to the incident
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Injury Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium">Injury Information</h3>
                  <FormField
                    control={form.control}
                    name="injuryOccurred"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-base font-normal">
                          Did an injury occur?
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("injuryOccurred") && (
                  <FormField
                    control={form.control}
                    name="injuryDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Injury Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the injury and any first aid or medical attention provided"
                            className="min-h-[100px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Witnesses Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Witnesses</h3>
                <FormField
                  control={form.control}
                  name="witnesses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Witness Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any witnesses to the incident (names, contact information)"
                          className="min-h-[80px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Photos Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Photos & Evidence</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="photo-upload" className="block text-base font-medium mb-2">
                      Upload Photos
                    </label>
                    <Input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload}
                      className="text-base"
                    />
                  </div>
                  
                  {selectedPhotos.length > 0 && (
                    <div>
                      <label className="block text-base font-medium mb-2">Uploaded Photos</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedPhotos.map((url, index) => (
                          <div key={index} className="relative h-24 bg-muted rounded-md overflow-hidden">
                            <img 
                              src={url} 
                              alt={`Uploaded ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/incidents')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={createIncidentMutation.isPending}
                >
                  {createIncidentMutation.isPending ? "Submitting..." : "Submit Incident Report"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}