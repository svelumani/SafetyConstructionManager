import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Layout from "@/components/layout";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Types for sites
interface Site {
  id: number;
  name: string;
}

// Create a form schema with zod
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  incidentDate: z.date({
    required_error: "Incident date is required.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  incidentType: z.string({
    required_error: "Incident type is required.",
  }),
  severity: z.string({
    required_error: "Severity is required.",
  }),
  siteId: z.coerce.number({
    required_error: "Site is required.",
  }),
  injuryOccurred: z.boolean().default(false),
  injuryDetails: z.string().optional(),
  witnesses: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
});

// Define incident types and severity levels
const incidentTypes = [
  "Fall",
  "Slip/Trip",
  "Struck By",
  "Caught In/Between",
  "Electrical",
  "Chemical Spill",
  "Equipment Failure",
  "Vehicle Accident",
  "Fire/Explosion",
  "Environmental",
  "Security",
  "Other",
];

const severityLevels = [
  { value: "minor", label: "Minor - No injury or minimal first aid" },
  { value: "moderate", label: "Moderate - Medical treatment required" },
  { value: "major", label: "Major - Serious injury, lost time" },
  { value: "critical", label: "Critical - Life-threatening, potential fatality" },
];

export default function NewIncident() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all sites for dropdown
  const { data: sites, isLoading: sitesLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentType: "",
      severity: "",
      injuryOccurred: false,
      photoUrls: [],
    },
  });

  // Watch if injury occurred to conditionally show injury details field
  const injuryOccurred = form.watch("injuryOccurred");

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Convert witnesses string to array if provided
      const formattedData = {
        ...values,
        // Format witnesses as an array if they exist
        witnesses: values.witnesses ? [values.witnesses] : [],
        // Initial status is always "reported"
        status: "reported",
      };

      const res = await apiRequest("POST", "/api/incidents", formattedData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create incident report");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Success",
        description: "Incident report created successfully.",
      });
      navigate(`/incidents/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the incident report.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createIncidentMutation.mutate(values);
  };

  if (sitesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Report New Incident</h1>
        <Button variant="outline" onClick={() => navigate("/incidents")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Incidents
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Incident Reporting Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Report all incidents as soon as possible after they occur.</li>
            <li>Provide as much detail as possible about what happened.</li>
            <li>Include information about any injuries, property damage, or environmental impact.</li>
            <li>List all witnesses to the incident if applicable.</li>
            <li>Be factual and objective - avoid assigning blame or making assumptions.</li>
          </ul>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic incident information */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Fall from ladder, Chemical spill in lab" {...field} />
                    </FormControl>
                    <FormDescription>
                      Brief, descriptive title of the incident
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Incident Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                    <FormDescription>
                      The date when the incident occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Location</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Building A, 3rd Floor, Room 305" {...field} />
                    </FormControl>
                    <FormDescription>
                      Exact location where the incident occurred
                    </FormDescription>
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
                        {Array.isArray(sites) && sites.length > 0 ? (
                          sites.map((site) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>Loading sites...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The construction site where the incident occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Incident details */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="incidentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incidentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of incident that occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {severityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How severe was the incident
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="injuryOccurred"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Did an injury occur?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value ? "true" : "false"}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="injury-yes" />
                          <Label htmlFor="injury-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="injury-no" />
                          <Label htmlFor="injury-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {injuryOccurred && (
                <FormField
                  control={form.control}
                  name="injuryDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the injury, treatment provided, and current status"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include type of injury, body part affected, and treatment given
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Full width fields */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of what happened, events leading up to the incident, and immediate actions taken"
                      {...field}
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific and factual. Include what happened, how it happened, and contributing factors.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="witnesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Witnesses</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any witnesses to the incident (name and role)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include names and roles of people who witnessed the incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/incidents")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Incident Report"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}