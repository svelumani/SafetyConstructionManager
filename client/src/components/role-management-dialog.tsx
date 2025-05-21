import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatRoleName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  HardHat,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
}

interface RoleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function RoleManagementDialog({
  open,
  onOpenChange,
  user,
}: RoleManagementDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(
    user?.role || null
  );

  const roleOptions: RoleOption[] = [
    {
      id: "safety_officer",
      name: "Safety Officer",
      description: "Can manage all safety activities and user roles",
      icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
    },
    {
      id: "supervisor",
      name: "Supervisor",
      description: "Can manage teams and some safety features",
      icon: <HardHat className="h-8 w-8 text-yellow-600" />,
    },
    {
      id: "employee",
      name: "Employee",
      description: "Standard employee with basic access",
      icon: <Users className="h-8 w-8 text-green-500" />,
    },
    {
      id: "subcontractor",
      name: "Subcontractor",
      description: "External worker with limited access",
      icon: <Briefcase className="h-8 w-8 text-purple-500" />,
    },
  ];

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!user) return null;
      const response = await apiRequest("PUT", `/api/users/${user.id}/role`, { role });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Role updated successfully",
        description: `${user?.firstName} ${user?.lastName} is now a ${formatRoleName(selectedRole || '')}`,
        variant: "default",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating role",
        description: "There was a problem updating the user's role. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Change Role for {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center mt-2 mb-4">
              <Avatar className="h-12 w-12 mr-3">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </div>
                <Badge variant="outline" className="mt-1">
                  Current role: {formatRoleName(user.role)}
                </Badge>
              </div>
            </div>
            <p className="mb-2 mt-4 text-base">
              <AlertCircle className="h-5 w-5 text-amber-500 inline mr-2" />
              Changing a user's role will modify what they can access and do in the system.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {roleOptions.map((role) => (
            <button
              key={role.id}
              className={`p-4 rounded-lg border-2 text-left flex items-center ${
                selectedRole === role.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="mr-4">{role.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{role.name}</h3>
                <p className="text-muted-foreground">{role.description}</p>
              </div>
              {selectedRole === role.id && (
                <CheckCircle2 className="h-6 w-6 text-primary ml-2" />
              )}
            </button>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedRole || selectedRole === user.role || updateRoleMutation.isPending}
            onClick={() => selectedRole && updateRoleMutation.mutate(selectedRole)}
          >
            {updateRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}