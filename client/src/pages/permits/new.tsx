import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

// Define the form schema with strong validation
const formSchema = z.object({
  permitType: z.string().min(1, "Permit type is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  siteId: z.coerce.number().min(1, "Site is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Mock permit types - typically these would come from the API
const PERMIT_TYPES = [
  "Electrical Work",
  "Plumbing",
  "Excavation",
  "Demolition",
  "Structural",
  "Concrete Pouring",
  "HVAC Installation",
  "Roofing",
  "Scaffold Installation",
  "Hot Work",
  "Confined Space Entry",
  "Other"
];

type FormValues = z.infer<typeof formSchema>;

export default function NewPermit() {
  const [step, setStep] = useState(1);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the list of sites for the dropdown
  const { data: sitesData } = useQuery({
    queryKey: ["/api/sites"],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permitType: "",
      title: "",
      description: "",
      location: "",
      siteId: undefined,
    },
  });

  // Create permit mutation
  const createPermitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/permits", {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permit request has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
      navigate("/permits");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create permit request",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    createPermitMutation.mutate(values);
  }

  // Handle step changes
  const nextStep = () => {
    // Validate current step fields
    let goToNextStep = false;

    if (step === 1) {
      const permitTypeValue = form.getValues("permitType");
      const siteIdValue = form.getValues("siteId");
      form.trigger(["permitType", "siteId"]).then(valid => {
        if (valid) {
          setStep(2);
        }
      });
    } else if (step === 2) {
      const titleValue = form.getValues("title");
      const locationValue = form.getValues("location");
      form.trigger(["title", "location"]).then(valid => {
        if (valid) {
          setStep(3);
        }
      });
    } else if (step === 3) {
      const descriptionValue = form.getValues("description");
      form.trigger(["description"]).then(valid => {
        if (valid) {
          setStep(4);
        }
      });
    } else if (step === 4) {
      const startDateValue = form.getValues("startDate");
      const endDateValue = form.getValues("endDate");
      form.trigger(["startDate", "endDate"]).then(valid => {
        if (valid) {
          setStep(5);
        }
      });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Layout title="New Permit Request" description="Create a new permit request for your construction site">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">New Permit Request</CardTitle>
          <CardDescription>
            Create a new construction permit request. All permits require approval before work can begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    stepNumber === step
                      ? "border-primary bg-primary text-white"
                      : stepNumber < step
                      ? "border-primary text-primary"
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-1 bg-primary transition-all duration-300"
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 1: Permit Type</h3>
                  <FormField
                    control={form.control}
                    name="permitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permit Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select permit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PERMIT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of work that requires a permit
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
                        <FormLabel>Construction Site</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sitesData?.sites?.map(site => (
                              <SelectItem key={site.id} value={site.id.toString()}>
                                {site.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the construction site where the permit will be used
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 2: Basic Information</h3>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permit Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a clear, descriptive title for this permit
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
                          <Input placeholder="e.g., North Tower, Floor 3, Room 305" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide the specific location where the work will be performed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 3: Work Description</h3>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the work to be performed in detail..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of the work, including what will be done, 
                          materials used, and safety measures in place
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 4: Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the work will begin
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                  date < new Date() || 
                                  (form.getValues("startDate") && date < form.getValues("startDate"))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the work will be completed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Step 5: Review and Submit</h3>
                  <div className="rounded-md border p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Permit Type</h4>
                        <p className="text-base">{form.getValues("permitType")}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Site</h4>
                        <p className="text-base">
                          {sitesData?.sites?.find(
                            site => site.id === parseInt(form.getValues("siteId"))
                          )?.name || "Unknown Site"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                        <p className="text-base">{form.getValues("title")}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                        <p className="text-base">{form.getValues("location")}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                        <p className="text-base">
                          {form.getValues("startDate") ? format(form.getValues("startDate"), "PPP") : "Not set"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                        <p className="text-base">
                          {form.getValues("endDate") ? format(form.getValues("endDate"), "PPP") : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                      <p className="text-base whitespace-pre-line">{form.getValues("description")}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => navigate("/permits")}>
              Cancel
            </Button>
          )}
          
          {step < 5 ? (
            <Button type="button" onClick={nextStep}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createPermitMutation.isPending}
            >
              {createPermitMutation.isPending ? "Submitting..." : "Submit Permit Request"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Layout>
  );
}