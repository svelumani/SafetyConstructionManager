import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertHazardReportSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { uploadFiles } from "@/lib/fileUpload";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extended schema with validation
const formSchema = insertHazardReportSchema.extend({
  siteId: z.coerce.number().min(1, "Please select a site"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewHazardReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get sites for dropdown
  const { data: sitesData } = useQuery({
    queryKey: ['/api/sites'],
  });
  
  const sites = sitesData?.sites || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      hazardType: "",
      severity: "medium",
      recommendedAction: "",
      photoUrls: []
    },
  });

  const createHazardMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Add uploaded images
      if (uploadedImages.length > 0) {
        data.photoUrls = uploadedImages;
      }
      
      // Ensure status is set to "open" for new hazards
      data.status = "open";
      
      console.log("Submitting hazard data:", data);
      
      // Now submit the hazard using our apiRequest utility which handles sessions properly
      try {
        // Use our standard apiRequest utility for better integration with React Query
        const response = await apiRequest("POST", "/api/hazards", data);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create hazard report (${response.status})`);
        }
        
        const responseData = await response.json();
        console.log("Hazard creation response:", responseData);
        return responseData;
      } catch (error) {
        console.error("Error in hazard creation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Hazard created successfully:", data);
      
      toast({
        title: "Success",
        description: "Hazard report successfully created",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/hazards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      
      // Redirect to hazards list
      setLocation("/hazards");
    },
    onError: (error: Error) => {
      console.error("Hazard creation error:", error);
      
      toast({
        title: "Error",
        description: `Failed to create hazard report: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Image upload function 
  const handleImageUpload = async () => {
    // Create an input element to handle file selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    // Set up the change event listener
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;
      
      try {
        // Show loading toast
        toast({
          title: "Uploading...",
          description: "Uploading your photos, please wait"
        });
        
        // Upload the files using the utility function
        const uploadedUrls = await uploadFiles(files, 'hazards/photos');
        
        // Update state with the newly uploaded image URLs
        setUploadedImages(prev => [...prev, ...uploadedUrls]);
        
        // Show success toast
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`
        });
      } catch (error) {
        console.error("Error uploading images:", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload images. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    // Trigger the file selection dialog
    input.click();
  };

  const onSubmit = (data: FormData) => {
    // Make sure to include uploaded images
    if (uploadedImages.length > 0) {
      data.photoUrls = uploadedImages;
    }
    
    // Log the submission data for debugging
    console.log("Submitting hazard report:", data);
    
    // Execute the mutation to create the hazard
    createHazardMutation.mutate(data);
  };

  return (
    <Layout title="Report New Hazard" description="Submit details about a safety hazard">
      <PageHeader title="Report New Hazard" description="Submit a new safety hazard report" />
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {createHazardMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {createHazardMutation.error.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Location*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazard Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief title of the hazard" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a clear, descriptive title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hazardType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hazard Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Trip Hazard">Trip Hazard</SelectItem>
                            <SelectItem value="Fall Hazard">Fall Hazard</SelectItem>
                            <SelectItem value="Chemical">Chemical</SelectItem>
                            <SelectItem value="Fire Hazard">Fire Hazard</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Structural">Structural</SelectItem>
                            <SelectItem value="Environmental">Environmental</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                        <FormLabel>Severity*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
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
                      <FormLabel>Specific Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="Where exactly is the hazard located" {...field} />
                      </FormControl>
                      <FormDescription>
                        Be as specific as possible (e.g., "3rd floor stairwell, near elevator")
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
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the hazard" 
                          className="h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include all relevant details about the hazard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recommendedAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommended Action</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Suggest how this hazard should be addressed" 
                          className="h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Suggest ways to fix or mitigate this hazard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel className="block mb-2">Photos (Optional)</FormLabel>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {uploadedImages.length > 0 ? (
                      uploadedImages.map((img, i) => (
                        <div key={i} className="relative border rounded-md overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Hazard photo ${i+1}`} 
                            className="w-32 h-24 object-cover" 
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            onClick={() => {
                              const newImages = [...uploadedImages];
                              newImages.splice(i, 1);
                              setUploadedImages(newImages);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-sm mb-2">No photos added yet</div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleImageUpload}
                  >
                    Upload Photo
                  </Button>
                  <FormDescription className="mt-2">
                    Add photos to help illustrate the hazard
                  </FormDescription>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/hazards")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createHazardMutation.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!form.formState.isValid) {
                        // Log validation errors for debugging
                        console.log("Form validation errors:", form.formState.errors);
                        
                        // Show toast with validation errors
                        toast({
                          title: "Please check the form",
                          description: "Some required fields are missing or invalid",
                          variant: "destructive"
                        });
                      } else {
                        // Form is valid, manually trigger submission
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  >
                    {createHazardMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
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