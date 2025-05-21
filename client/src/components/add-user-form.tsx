import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Simplified schema without username and password fields
const addUserSchema = insertUserSchema.omit({ password: true, username: true }).extend({});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Standard password for development
const DEFAULT_PASSWORD = "SafetyFirst123!";

export function AddUserForm({ open, onOpenChange }: AddUserFormProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "employee",
      phone: "",
      jobTitle: "",
      department: "",
    },
  });
  
  const addUserMutation = useMutation({
    mutationFn: async (data: AddUserFormValues) => {
      // Generate username from email (before @ symbol)
      const username = data.email.split('@')[0];
      
      // Add standard password and username to the data
      const userData = {
        ...data,
        username,
        password: DEFAULT_PASSWORD,
      };
      
      const response = await apiRequest("POST", "/api/users", userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User created successfully",
        description: `An email with login instructions has been sent to ${data.email}`,
      });
      
      // For development, show a mock email notification
      toast({
        title: "Development Note",
        description: `No actual email sent. Default password is: ${DEFAULT_PASSWORD}`,
        variant: "default",
      });
      
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: AddUserFormValues) => {
    addUserMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            New users will receive an email with login instructions.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="mb-4">
          <Mail className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            Email delivery is mocked. All users created will have the password: {DEFAULT_PASSWORD}
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" {...register("jobTitle")} />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register("department")} />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setValue("role", value)} defaultValue="employee">
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety_officer">Safety Officer</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addUserMutation.isPending}>
              {addUserMutation.isPending ? "Creating..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}