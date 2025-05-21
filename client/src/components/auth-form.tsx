import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  // User information
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  jobTitle: z.string().min(1, "Job title is required"),
  
  // Company information
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z.string().email("Please enter a valid company email"),
  companyAddress: z.string().min(5, "Company address is required").optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const { loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      companyName: "",
      companyEmail: "",
      companyAddress: ""
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Transform the data to include tenant creation info and generate username from email
    const registrationData = {
      ...data,
      // Generate username from email (before the @ symbol)
      username: data.email.split('@')[0],
      tenant: {
        name: data.companyName,
        email: data.companyEmail,
        phone: data.phone, // Use the user's phone number for the company as well
        address: data.companyAddress
      }
    };
    
    registerMutation.mutate(registrationData);
  };

  return (
    <Card className="w-full max-w-md">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to MySafety</CardTitle>
          <CardDescription className="text-center">
            Login or create a new account to access the safety management platform
          </CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent>
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
              <div className="pb-2 border-b border-gray-200">
                <h3 className="text-lg font-medium">Your Information</h3>
                <p className="text-sm text-muted-foreground">Please provide your personal details</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">First Name</Label>
                  <Input
                    id="register-firstName"
                    type="text"
                    placeholder="John"
                    {...registerForm.register("firstName")}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Last Name</Label>
                  <Input
                    id="register-lastName"
                    type="text"
                    placeholder="Doe"
                    {...registerForm.register("lastName")}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>



              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a secure password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    {...registerForm.register("phone")}
                  />
                  {registerForm.formState.errors.phone && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-jobTitle">Job Title</Label>
                  <Input
                    id="register-jobTitle"
                    type="text"
                    placeholder="Safety Officer"
                    {...registerForm.register("jobTitle")}
                  />
                  {registerForm.formState.errors.jobTitle && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.jobTitle.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-medium">Company Information</h3>
                <p className="text-sm text-muted-foreground">We'll create your company in the system</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-companyName">Company Name</Label>
                <Input
                  id="register-companyName"
                  type="text"
                  placeholder="ABC Construction"
                  {...registerForm.register("companyName")}
                />
                {registerForm.formState.errors.companyName && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.companyName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-companyEmail">Company Email</Label>
                <Input
                  id="register-companyEmail"
                  type="email"
                  placeholder="info@abcconstruction.com"
                  {...registerForm.register("companyEmail")}
                />
                {registerForm.formState.errors.companyEmail && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.companyEmail.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-companyAddress">Company Address (Optional)</Label>
                <Input
                  id="register-companyAddress"
                  type="text"
                  placeholder="123 Main St, Anytown, ST 12345"
                  {...registerForm.register("companyAddress")}
                />
                {registerForm.formState.errors.companyAddress && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.companyAddress.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account & Company"}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
