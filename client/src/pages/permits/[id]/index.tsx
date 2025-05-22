import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ArrowLeft,
  X,
  CalendarIcon,
  Building,
  User,
  MapPin,
  FileText,
  Calendar
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUTCToLocal } from "@/lib/utils";

export default function PermitDetails() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showExpireDialog, setShowExpireDialog] = useState(false);

  // Fetch permit details
  const { data: permit, isLoading, error } = useQuery({
    queryKey: [`/api/permits/${id}`],
    queryFn: async () => {
      // If API is not available, use mock data
      // In production, we'd use the actual API
      return mockPermitDetails;
    },
  });

  // Mutation to update permit status (expire)
  const expirePermitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/permits/${id}`, {
        status: "expired"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permit has been marked as expired",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/permits/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to expire permit",
        variant: "destructive",
      });
    },
  });

  const handleExpirePermit = () => {
    expirePermitMutation.mutate();
    setShowExpireDialog(false);
  };

  const handlePrintPermit = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout title="Permit Details" description="Loading permit details...">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !permit) {
    return (
      <Layout title="Permit Details" description="Error loading permit details">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Permit</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There was an error loading the permit details. Please try again later.
            </p>
            <Button className="mt-4" onClick={() => navigate("/permits")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Permits
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Determine if permit is expiring soon (within 7 days)
  const endDate = new Date(permit.endDate);
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);
  const isExpiringSoon = endDate <= sevenDaysFromNow && endDate > now;

  // Calculate days remaining until expiration
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Layout
      title="Permit Details"
      description={`Details for permit #${permit.id}`}
    >
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate("/permits")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Permits
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6 print:shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{permit.title}</CardTitle>
                  <CardDescription>{permit.permitType}</CardDescription>
                </div>
                <Badge
                  variant={
                    permit.status === "approved"
                      ? "success"
                      : permit.status === "requested"
                      ? "default"
                      : permit.status === "expired"
                      ? "destructive"
                      : "outline"
                  }
                  className="text-sm print:border-none print:bg-transparent print:text-black"
                >
                  {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Valid Period
                  </div>
                  <p className="text-base">
                    {formatUTCToLocal(permit.startDate, "PP")} - {formatUTCToLocal(permit.endDate, "PP")}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <Building className="mr-2 h-4 w-4" /> Site
                  </div>
                  <p className="text-base">{permit.siteName}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <MapPin className="mr-2 h-4 w-4" /> Location
                  </div>
                  <p className="text-base">{permit.location}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <User className="mr-2 h-4 w-4" /> Requested By
                  </div>
                  <p className="text-base">{permit.requesterName}</p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                  <FileText className="mr-2 h-4 w-4" /> Description
                </div>
                <p className="text-base whitespace-pre-line">{permit.description}</p>
              </div>

              {permit.status === "approved" && permit.approvalDate && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Approval Information
                    </div>
                    <p className="text-base">
                      Approved on {formatUTCToLocal(permit.approvalDate, "PPp")}
                      {permit.approverName && ` by ${permit.approverName}`}
                    </p>
                  </div>
                </>
              )}

              {permit.status === "denied" && permit.denialReason && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground text-red-500">
                      Denial Reason
                    </div>
                    <p className="text-base">{permit.denialReason}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="print:hidden">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrintPermit}>
                  <Printer className="mr-2 h-4 w-4" /> Print Permit
                </Button>
                
                {permit.status === "approved" && !isExpiringSoon && endDate > now && (
                  <AlertDialog open={showExpireDialog} onOpenChange={setShowExpireDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <X className="mr-2 h-4 w-4" /> Mark as Expired
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Permit as Expired?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The permit will be marked as expired and no longer valid.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExpirePermit}>
                          Mark as Expired
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="print:hidden">
            <CardHeader className="pb-2">
              <CardTitle>Permit Status</CardTitle>
            </CardHeader>
            <CardContent>
              {permit.status === "approved" && endDate > now && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mr-2" />
                    <div>
                      <h3 className="font-medium">Active Permit</h3>
                      <p className="text-sm text-muted-foreground">
                        This permit is currently active and valid.
                      </p>
                    </div>
                  </div>
                  {isExpiringSoon ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        <div>
                          <h4 className="font-medium text-amber-800">Expiring Soon</h4>
                          <p className="text-sm text-amber-700">
                            This permit will expire in {daysRemaining} days.
                            {daysRemaining <= 3 && " Plan renewal if necessary."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-4">
                      <div className="flex">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <h4 className="font-medium">Expiration</h4>
                          <p className="text-sm text-gray-600">
                            This permit will expire in {daysRemaining} days
                            on {formatUTCToLocal(permit.endDate, "PP")}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {permit.status === "approved" && endDate <= now && (
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Expired Permit</h3>
                    <p className="text-sm text-muted-foreground">
                      This permit has expired on {formatUTCToLocal(permit.endDate, "PP")}.
                      Work should not continue under this permit.
                    </p>
                  </div>
                </div>
              )}

              {permit.status === "requested" && (
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Pending Approval</h3>
                    <p className="text-sm text-muted-foreground">
                      This permit is pending approval. Work cannot begin until the permit is approved.
                    </p>
                  </div>
                </div>
              )}

              {permit.status === "denied" && (
                <div className="flex items-center">
                  <X className="h-8 w-8 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Denied Permit</h3>
                    <p className="text-sm text-muted-foreground">
                      This permit has been denied. See the denial reason for more information.
                    </p>
                  </div>
                </div>
              )}

              {permit.status === "expired" && (
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Expired Permit</h3>
                    <p className="text-sm text-muted-foreground">
                      This permit has expired. Work should not continue under this permit.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Mock data for development - in production, this would come from the API
const mockPermitDetails = {
  id: 1,
  permitType: "Electrical Work",
  title: "Main Electrical Panel Upgrade",
  description: "Upgrade of the main electrical panel in the North Tower basement to support additional power requirements for the new HVAC system. Work includes disconnecting the existing panel, installing a new 400A panel, and reconnecting all circuits.",
  location: "North Tower, Basement, Room B103",
  startDate: "2025-05-25T00:00:00.000Z",
  endDate: "2025-06-10T00:00:00.000Z",
  status: "approved",
  requesterId: 4,
  requesterName: "Shyam Kumar",
  siteId: 1,
  siteName: "Downtown Tower",
  approvalDate: "2025-05-23T14:30:00.000Z",
  approverName: "John Supervisor",
  denialReason: null,
};