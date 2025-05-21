import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

// Simplified form schema with only essential fields
const tenantRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  contactName: z.string().min(2, { message: "Contact name must be at least 2 characters" }),
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  contactJobTitle: z.string().min(2, { message: "Job title must be at least 2 characters" }),
});

type TenantRegistrationFormValues = z.infer<typeof tenantRegistrationSchema>;

export default function TenantRegistration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<TenantRegistrationFormValues>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactName: "",
      contactEmail: "",
      contactJobTitle: "",
    },
  });

  const registerTenantMutation = useMutation({
    mutationFn: async (data: TenantRegistrationFormValues) => {
      const response = await apiRequest("POST", "/api/tenants/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your company has been registered. You can now access all features.",
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error registering your company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TenantRegistrationFormValues) => {
    registerTenantMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="flex flex-col items-center justify-center w-full max-w-md p-8 mx-auto bg-background">
        <div className="w-full max-w-md">
          <div className="space-y-2 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Register Your Company</h1>
            <p className="text-muted-foreground">
              Create your construction company account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Enter basic information to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Construction" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input placeholder="info@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street, City, State, ZIP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Officer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Officer Email</FormLabel>
                          <FormControl>
                            <Input placeholder="officer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactJobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Safety Officer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                disabled={registerTenantMutation.isPending}
              >
                {registerTenantMutation.isPending ? "Registering..." : "Register Company"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/auth" className="font-medium text-primary hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-slate-900">
        <div className="flex flex-col justify-center h-full px-12 py-12 text-white">
          <h2 className="text-4xl font-bold mb-6">MySafety for Construction</h2>
          <p className="text-lg mb-8">
            A comprehensive safety management platform designed specifically for construction companies to help track hazards, manage inspections, and maintain compliance.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Hazard Reporting</h3>
                <p className="text-slate-300">Track and manage workplace hazards in real-time</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Inspections & Permits</h3>
                <p className="text-slate-300">Streamline safety inspections and permit management</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Training Management</h3>
                <p className="text-slate-300">Track employee training and certifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
