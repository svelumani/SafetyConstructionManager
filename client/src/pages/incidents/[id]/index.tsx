import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  FileCheck,
  MapPin,
  Search,
  User,
  AlertTriangle,
  Edit,
  Building,
  Clipboard,
} from "lucide-react";
import { formatUTCToLocal } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface Incident {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  incidentType: string;
  severity: string;
  status: string;
  reportedById: number;
  reportedByName: string;
  siteId: number;
  siteName: string;
  injuryOccurred: boolean;
  injuryDetails?: string;
  witnesses?: string[] | null;
  rootCause?: string;
  correctiveActions?: string;
  preventativeMeasures?: string;
  photoUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function IncidentDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch incident details
  const { data: incident, isLoading, error } = useQuery<Incident>({
    queryKey: ["/api/incidents", id],
  });

  // Update incident status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PATCH", `/api/incidents/${id}`, { 
        status: newStatus,
        correctiveActions: statusUpdateNotes.length > 0 
          ? (incident?.correctiveActions ? incident.correctiveActions + "\n\n" : "") + 
            `[${new Date().toLocaleString()}] Status updated to ${newStatus}: ${statusUpdateNotes}`
          : incident?.correctiveActions
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update incident status");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Status Updated",
        description: "The incident status has been successfully updated.",
      });
      setUpdateDialogOpen(false);
      setStatusUpdateNotes("");
      setSelectedStatus(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update incident status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  // Get status icon based on current status
  const getStatusIcon = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return <AlertCircle className="h-6 w-6" />;
    }
    
    switch (status) {
      case "reported":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "investigating":
        return <Search className="h-6 w-6 text-amber-500" />;
      case "resolved":
        return <FileCheck className="h-6 w-6 text-blue-500" />;
      case "closed":
        return <FileCheck className="h-6 w-6 text-green-500" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  // Get severity icon based on severity level
  const getSeverityIcon = (severity: string | undefined) => {
    if (!severity || typeof severity !== 'string') {
      return <AlertTriangle className="h-6 w-6" />;
    }
    
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "major":
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case "moderate":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "minor":
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string | undefined) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    if (!severity || typeof severity !== 'string') {
      return <Badge variant="secondary" className="text-base px-3 py-1">Unknown</Badge>;
    }
    
    if (severity === "critical" || severity === "major") {
      variant = "destructive";
    } else if (severity === "moderate") {
      variant = "default";
    } else if (severity === "minor") {
      variant = "secondary";
    }
    
    return (
      <Badge variant={variant} className="text-base px-3 py-1">
        {severity && typeof severity === 'string' 
          ? severity.charAt(0).toUpperCase() + severity.slice(1)
          : 'Unknown'}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return <Badge variant="outline" className="text-base px-3 py-1">Unknown</Badge>;
    }
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (status === "reported") {
      variant = "destructive";
    } else if (status === "investigating") {
      variant = "default";
    } else if (status === "resolved") {
      variant = "secondary";
    }
    
    return (
      <Badge variant={variant} className="text-base px-3 py-1">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Available status transitions based on current status
  const getAvailableStatusTransitions = (currentStatus: string) => {
    if (!currentStatus || typeof currentStatus !== 'string') {
      return [];
    }
    
    switch (currentStatus) {
      case "reported":
        return ["investigating"];
      case "investigating":
        return ["resolved"];
      case "resolved":
        return ["closed", "investigating"]; // Can be closed or reopened for more investigation
      case "closed":
        return ["investigating"]; // Can be reopened
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl">Loading incident details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !incident) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-xl text-red-500 mb-4">Error loading incident</div>
          <Button onClick={() => navigate("/incidents")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/incidents")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Incidents
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main incident details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{incident.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {incident.incidentType} Incident
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(incident.status)}
                  {getSeverityBadge(incident.severity)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-base">
                    {formatUTCToLocal(incident.incidentDate, "PPP")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-base">{incident.location}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-base">{incident.siteName}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-base">Reported by {incident.reportedByName}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <div className="bg-muted p-4 rounded-md text-base whitespace-pre-wrap">
                  {incident.description}
                </div>
              </div>

              {incident.injuryOccurred && incident.injuryDetails && (
                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-500">Injury Details</h3>
                  <div className="bg-red-50 p-4 rounded-md text-base whitespace-pre-wrap border border-red-200">
                    {incident.injuryDetails}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details" className="text-base">Additional Details</TabsTrigger>
              <TabsTrigger value="investigation" className="text-base">Investigation</TabsTrigger>
              <TabsTrigger value="photos" className="text-base">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incident.witnesses && incident.witnesses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Witnesses</h3>
                      <div className="bg-muted p-4 rounded-md text-base">
                        <ul className="list-disc pl-5 space-y-1">
                          {typeof incident.witnesses === 'string' ? (
                            <li>{incident.witnesses}</li>
                          ) : (
                            incident.witnesses.map((witness, i) => (
                              <li key={i}>{witness}</li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Created</span>
                      <span>{formatUTCToLocal(incident.createdAt, "PPp")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last Updated</span>
                      <span>{formatUTCToLocal(incident.updatedAt, "PPp")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investigation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investigation & Corrective Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {incident.rootCause ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Root Cause Analysis</h3>
                      <div className="bg-muted p-4 rounded-md text-base whitespace-pre-wrap">
                        {incident.rootCause}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No root cause analysis has been recorded yet.
                    </div>
                  )}

                  {incident.correctiveActions ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Corrective Actions</h3>
                      <div className="bg-muted p-4 rounded-md text-base whitespace-pre-wrap">
                        {incident.correctiveActions}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No corrective actions have been recorded yet.
                    </div>
                  )}

                  {incident.preventativeMeasures ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Preventative Measures</h3>
                      <div className="bg-muted p-4 rounded-md text-base whitespace-pre-wrap">
                        {incident.preventativeMeasures}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No preventative measures have been recorded yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle>Photos & Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  {incident.photoUrls && incident.photoUrls.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {incident.photoUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Incident photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No photos have been attached to this incident.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar with actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {getStatusIcon(incident.status)}
              <div>
                <div className="font-medium text-lg">
                  {incident.status && typeof incident.status === 'string' 
                    ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1)
                    : 'Unknown'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Updated {formatUTCToLocal(incident.updatedAt, "PP")}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch">
              <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full text-base">
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Incident Status</DialogTitle>
                    <DialogDescription>
                      Change the current status of this incident.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Current Status</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <span className="font-medium">
                          {incident.status && typeof incident.status === 'string'
                            ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <h4 className="text-sm font-medium mb-2">New Status</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {getAvailableStatusTransitions(incident.status).map((status) => (
                        <Button
                          key={status}
                          variant={selectedStatus === status ? "default" : "outline"}
                          onClick={() => setSelectedStatus(status)}
                          className="justify-start"
                          size="lg"
                        >
                          {getStatusIcon(status)}
                          <span className="ml-2">
                            {status && typeof status === 'string'
                              ? status.charAt(0).toUpperCase() + status.slice(1)
                              : 'Unknown'}
                          </span>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        placeholder="Add notes about this status update"
                        value={statusUpdateNotes}
                        onChange={(e) => setStatusUpdateNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStatusUpdate}
                      disabled={!selectedStatus || updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium">{incident.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity</span>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(incident.severity)}
                  <span className="font-medium">
                    {incident.severity && typeof incident.severity === 'string'
                      ? incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)
                      : 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{incident.incidentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Injury</span>
                <span className="font-medium">
                  {incident.injuryOccurred ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/incidents/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Incident
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clipboard className="mr-2 h-4 w-4" />
                Print Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}