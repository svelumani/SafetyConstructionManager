import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  Save,
  Eye,
  FilePenLine,
  CheckCircle,
  XIcon,
  Camera,
  Map,
  Upload,
  MessageCircle,
  Building,
  User,
  Plus,
  Image,
} from "lucide-react";

import { cn, formatUTCToLocal } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFiles } from "@/lib/file-utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Status badge component
const StatusBadge = ({ status }: { status: string | null | undefined }) => {
  // Handle null or undefined status
  if (!status) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium">
        <AlertCircle className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  }
  
  switch (status) {
    case "scheduled":
    case "pending":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 font-medium">
          <Calendar className="mr-1 h-3 w-3" />
          {status === "scheduled" ? "Scheduled" : "Pending"}
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 font-medium">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 font-medium">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 font-medium">
          <XCircle className="mr-1 h-3 w-3" />
          Canceled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium">
          <AlertCircle className="mr-1 h-3 w-3" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Badge>
      );
  }
};

// Response status component
const ResponseStatus = ({ status }: { status: string }) => {
  switch (status) {
    case "pass":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 font-medium">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pass
        </Badge>
      );
    case "fail":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 font-medium">
          <XIcon className="mr-1 h-3 w-3" />
          Fail
        </Badge>
      );
    case "not_applicable":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium">
          <XCircle className="mr-1 h-3 w-3" />
          N/A
        </Badge>
      );
    default:
      return null;
  }
};

export default function InspectionDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [findings, setFindings] = useState<any[]>([]);
  const [photoFiles, setPhotoFiles] = useState<Record<number, File[]>>({});
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  const [newFinding, setNewFinding] = useState({
    description: "",
    recommendedAction: "",
    severity: "low",
    priority: "low",
    dueDate: "",
    status: "open",
  });
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  // Fetch inspection details
  const { 
    data: inspection, 
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/inspections/${id}`],
    enabled: !!id,
  });

  // Fetch inspection responses
  const { 
    data: responseData,
    isLoading: isLoadingResponses,
  } = useQuery({
    queryKey: [`/api/inspections/${id}/responses`],
    enabled: !!id,
  });

  // Fetch inspection findings
  const { 
    data: findingsData,
    isLoading: isLoadingFindings,
  } = useQuery({
    queryKey: [`/api/inspections/${id}/findings`],
    enabled: !!id,
  });

  // Initialize responses from fetched data
  useEffect(() => {
    if (responseData?.responses) {
      const responseMap: Record<number, any> = {};
      responseData.responses.forEach((response: any) => {
        responseMap[response.checklistItemId] = response;
      });
      setResponses(responseMap);
    }
  }, [responseData]);

  // Initialize findings from fetched data
  useEffect(() => {
    if (findingsData?.findings) {
      setFindings(findingsData.findings);
    }
  }, [findingsData]);

  // Start inspection mutation
  const startInspectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/inspections/${id}/start`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}`] });
      toast({
        title: "Inspection Started",
        description: "The inspection status has been updated to in progress",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start inspection",
        variant: "destructive",
      });
    },
  });

  // Complete inspection mutation
  const [missingRequiredItems, setMissingRequiredItems] = useState<any[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  const completeInspectionMutation = useMutation({
    mutationFn: async (data: { notes?: string } = {}) => {
      const response = await apiRequest("PUT", `/api/inspections/${id}/complete`, data);
      
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.missingItems) {
          setMissingRequiredItems(errorData.missingItems);
          throw new Error(errorData.message);
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete inspection");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}`] });
      setShowCompletionDialog(false);
      
      toast({
        title: "Inspection Completed",
        description: "The inspection has been marked as completed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Complete Inspection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel inspection mutation
  const cancelInspectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/inspections/${id}/cancel`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}`] });
      toast({
        title: "Inspection Canceled",
        description: "The inspection has been canceled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel inspection",
        variant: "destructive",
      });
    },
  });

  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({ checklistItemId, data }: { checklistItemId: number, data: any }) => {
      const existingResponse = responses[checklistItemId];
      
      if (existingResponse?.id) {
        // Update existing response
        const response = await apiRequest("PUT", `/api/inspections/${id}/responses/${existingResponse.id}`, {
          ...data,
        });
        
        if (response.status === 404) {
          throw new Error("Response not found");
        }
        
        return await response.json();
      } else {
        // Create new response
        try {
          const response = await apiRequest("POST", `/api/inspections/${id}/responses`, {
            checklistItemId,
            ...data,
          });
          
          // Handle 409 Conflict - response already exists
          if (response.status === 409) {
            const conflictData = await response.json();
            
            // Use the existing response data
            setResponses(prev => ({
              ...prev,
              [checklistItemId]: conflictData.existingResponse
            }));
            
            // Now update that existing response
            const updateResponse = await apiRequest(
              "PUT", 
              `/api/inspections/${id}/responses/${conflictData.existingResponse.id}`, 
              { ...data }
            );
            
            return await updateResponse.json();
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save response");
          }
          
          return await response.json();
        } catch (error) {
          throw error;
        }
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}/responses`] });
      
      // Update local state
      setResponses(prev => ({
        ...prev,
        [variables.checklistItemId]: data
      }));
      
      toast({
        title: "Response Saved",
        description: "Your inspection response has been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save response",
        variant: "destructive",
      });
    },
  });

  // Add finding mutation
  const addFindingMutation = useMutation({
    mutationFn: async (findingData: any) => {
      const response = await apiRequest("POST", `/api/inspections/${id}/findings`, {
        ...findingData,
        inspectionId: Number(id),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}/findings`] });
      
      // Update local state
      setFindings(prev => [...prev, data]);
      
      // Reset form and close dialog
      setNewFinding({
        description: "",
        recommendedAction: "",
        severity: "low",
        priority: "low",
        dueDate: "",
        status: "open",
      });
      setFindingDialogOpen(false);
      
      toast({
        title: "Finding Added",
        description: "Your inspection finding has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add finding",
        variant: "destructive",
      });
    },
  });

  const handleStartInspection = () => {
    startInspectionMutation.mutate();
  };

  const [completionNotes, setCompletionNotes] = useState("");
  
  const handleCompleteInspection = () => {
    // Show dialog first
    setShowCompletionDialog(true);
  };
  
  const confirmCompleteInspection = () => {
    completeInspectionMutation.mutate({ notes: completionNotes });
  };

  const handleCancelInspection = () => {
    cancelInspectionMutation.mutate();
  };

  const handleResponseChange = (checklistItemId: number, status: string, notes: string = "") => {
    // Optimistically update the UI
    setResponses(prev => ({
      ...prev,
      [checklistItemId]: {
        ...prev[checklistItemId],
        status,
        notes,
        // These are temporary values that will be updated after the API call
        id: prev[checklistItemId]?.id || -1,
        checklistItemId,
        inspectionId: Number(id),
      }
    }));

    // Then send to the server
    saveResponseMutation.mutate({
      checklistItemId,
      data: {
        status,
        notes,
      }
    });
  };

  const handleAddFinding = () => {
    addFindingMutation.mutate(newFinding);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
            <div className="h-64 bg-muted rounded w-full max-w-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !inspection) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Inspection Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The inspection you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/inspections")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inspections
          </Button>
        </div>
      </Layout>
    );
  }

  // Completion dialog UI
  const CompletionDialog = () => (
    <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Inspection</DialogTitle>
          <DialogDescription>
            Add any final notes before completing this inspection.
            {missingRequiredItems.length > 0 && (
              <div className="mt-4 p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 rounded-md">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                  Missing Required Responses
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  {missingRequiredItems.length} required questions still need responses:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 ml-4 list-disc">
                  {missingRequiredItems.slice(0, 3).map((item) => (
                    <li key={item.id}>{item.question}</li>
                  ))}
                  {missingRequiredItems.length > 3 && (
                    <li>...and {missingRequiredItems.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any final notes or observations..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmCompleteInspection} 
            disabled={completeInspectionMutation.isPending}>
            {completeInspectionMutation.isPending ? (
              <>
                <span className="mr-2">Saving...</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : 'Complete Inspection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <Layout>
      {/* Completion Dialog */}
      <CompletionDialog />
      
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/inspections")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inspections
          </Button>
          <div className="flex gap-2">
            {inspection.status === "scheduled" && (
              <Button 
                onClick={handleStartInspection}
                disabled={startInspectionMutation.isPending}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Start Inspection
              </Button>
            )}
            {inspection.status === "in_progress" && (
              <Button 
                onClick={handleCompleteInspection}
                disabled={completeInspectionMutation.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete Inspection
              </Button>
            )}
            {(inspection.status === "scheduled" || inspection.status === "in_progress") && (
              <Button 
                variant="outline"
                onClick={handleCancelInspection}
                disabled={cancelInspectionMutation.isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel Inspection
              </Button>
            )}
          </div>
        </div>

        <PageHeader
          title={inspection.title}
          description={inspection.description}
        >
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge status={inspection.status} />
            {inspection.site && (
              <Badge variant="outline" className="font-medium flex items-center">
                <Building className="mr-1 h-3 w-3" />
                {inspection.site.name}
              </Badge>
            )}
            {inspection.assignedTo && (
              <Badge variant="outline" className="font-medium flex items-center">
                <User className="mr-1 h-3 w-3" />
                {`${inspection.assignedTo.firstName} ${inspection.assignedTo.lastName}`}
              </Badge>
            )}
          </div>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="findings">
              Findings
              {findings.length > 0 && (
                <Badge variant="secondary" className="ml-2">{findings.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Template</h3>
                    <p className="text-base">{inspection.template?.title || "Custom Inspection"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <p className="text-base capitalize">{inspection.template?.category || "General"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Site</h3>
                    <p className="text-base">{inspection.site?.name || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date</h3>
                    <p className="text-base">
                      {inspection.scheduled_date ? formatUTCToLocal(inspection.scheduled_date, "PPP") : "Not scheduled"}
                      {inspection.scheduled_date && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatDistanceToNow(new Date(inspection.scheduled_date), { addSuffix: true })})
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <StatusBadge status={inspection.status} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h3>
                    <p className="text-base">
                      {inspection.assignedTo ? 
                        `${inspection.assignedTo.firstName} ${inspection.assignedTo.lastName}` : 
                        "Unassigned"
                      }
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-base whitespace-pre-wrap">
                    {inspection.notes || "No additional notes provided."}
                  </p>
                </div>

                {inspection.completedAt && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed Date</h3>
                      <p className="text-base">
                        {formatUTCToLocal(inspection.completedAt, "PPP p")}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatDistanceToNow(new Date(inspection.completedAt), { addSuffix: true })})
                        </span>
                      </p>
                    </div>
                  </>
                )}

                {inspection.completedBy && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed By</h3>
                    <p className="text-base">
                      {`${inspection.completedBy.firstName} ${inspection.completedBy.lastName}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="checklist" className="space-y-4">
            {isLoadingResponses ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            ) : inspection.template?.checklistItems && inspection.template.checklistItems.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection Checklist</CardTitle>
                    <CardDescription>
                      Evaluate each item against safety standards and regulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {inspection.template.checklistItems.map((item: any, index: number) => {
                        const response = responses[item.id] || {};
                        return (
                          <AccordionItem key={item.id} value={`item-${item.id}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center">
                                  <span className="font-medium">{index + 1}. {item.question}</span>
                                </div>
                                {response.status && (
                                  <ResponseStatus status={response.status} />
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 p-2">
                                <p className="text-muted-foreground">{item.description}</p>
                                
                                {inspection.status === "in_progress" ? (
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                      <Button 
                                        size="sm" 
                                        variant={response.status === "pass" ? "default" : "outline"}
                                        onClick={() => handleResponseChange(item.id, "pass", response.notes)}
                                        className="gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Pass
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant={response.status === "fail" ? "default" : "outline"}
                                        onClick={() => handleResponseChange(item.id, "fail", response.notes)}
                                        className="gap-2"
                                      >
                                        <XIcon className="h-4 w-4" />
                                        Fail
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant={response.status === "not_applicable" ? "default" : "outline"}
                                        onClick={() => handleResponseChange(item.id, "not_applicable", response.notes)}
                                        className="gap-2"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        Not Applicable
                                      </Button>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                                      <Textarea
                                        id={`notes-${item.id}`}
                                        placeholder="Add observation notes here..."
                                        value={response.notes || ""}
                                        onChange={(e) => {
                                          // Update local state for immediate feedback
                                          setResponses(prev => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              notes: e.target.value
                                            }
                                          }));
                                        }}
                                        onBlur={(e) => {
                                          if (response.status) {
                                            handleResponseChange(item.id, response.status, e.target.value);
                                          }
                                        }}
                                        className="mt-2"
                                      />
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => {
                                          setFindingDialogOpen(true);
                                          setNewFinding(prev => ({
                                            ...prev,
                                            description: `Issue with: ${item.question}`,
                                          }));
                                        }}
                                      >
                                        <AlertCircle className="h-4 w-4" />
                                        Record Finding
                                      </Button>
                                      
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="gap-2"
                                        onClick={() => handlePhotoUpload(item.id)}
                                      >
                                        <Camera className="h-4 w-4" />
                                        Add Photo
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {response.status ? (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Status:</span>
                                          <ResponseStatus status={response.status} />
                                        </div>
                                        
                                        {response.notes && (
                                          <div>
                                            <span className="font-medium">Notes:</span>
                                            <p className="mt-1 whitespace-pre-wrap">{response.notes}</p>
                                          </div>
                                        )}
                                        
                                        {/* Show photos if they exist */}
                                        {response.photoUrls && response.photoUrls.length > 0 && (
                                          <div className="mt-4">
                                            <span className="font-medium">Photos:</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                              {response.photoUrls.map((url: string, index: number) => (
                                                <div key={index} className="relative group rounded-md overflow-hidden border border-border">
                                                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                                                    <img
                                                      src={url}
                                                      alt={`Photo ${index + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                      <Button
                                                        type="button" 
                                                        variant="secondary"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          window.open(url, '_blank');
                                                        }}
                                                      >
                                                        <Eye className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="italic text-muted-foreground">No response recorded</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div>
                      {inspection.status === "in_progress" && (
                        <p className="text-sm text-muted-foreground">
                          Don't forget to save your responses
                        </p>
                      )}
                    </div>
                    {inspection.status === "in_progress" && (
                      <Button onClick={handleCompleteInspection}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Inspection
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Checklist Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This inspection doesn't have any checklist items. This may be a custom inspection
                    or the template might not have any items defined.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="findings" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Inspection Findings</h2>
              {inspection.status === "in_progress" && (
                <Button onClick={() => setFindingDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Finding
                </Button>
              )}
            </div>
            
            {isLoadingFindings ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            ) : findings.length > 0 ? (
              <div className="space-y-4">
                {findings.map((finding) => (
                  <Card key={finding.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{finding.description}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className={cn(
                            finding.severity === "critical" && "bg-red-100 text-red-800",
                            finding.severity === "high" && "bg-orange-100 text-orange-800",
                            finding.severity === "medium" && "bg-yellow-100 text-yellow-800",
                            finding.severity === "low" && "bg-blue-100 text-blue-800",
                          )}>
                            {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            finding.priority === "high" && "bg-red-100 text-red-800",
                            finding.priority === "medium" && "bg-yellow-100 text-yellow-800",
                            finding.priority === "low" && "bg-green-100 text-green-800",
                          )}>
                            Priority: {finding.priority.charAt(0).toUpperCase() + finding.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            finding.status === "open" && "bg-blue-100 text-blue-800",
                            finding.status === "in_progress" && "bg-yellow-100 text-yellow-800",
                            finding.status === "closed" && "bg-green-100 text-green-800",
                          )}>
                            {finding.status.charAt(0).toUpperCase() + finding.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Recommended Action</h3>
                        <p className="whitespace-pre-wrap">{finding.recommendedAction || "No recommended action provided."}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                          <p>{finding.dueDate ? formatUTCToLocal(finding.dueDate, "PP") : "Not specified"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
                          <p>{finding.createdBy ? `${finding.createdBy.firstName} ${finding.createdBy.lastName}` : "System"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                          <p>{formatUTCToLocal(finding.createdAt, "PP")}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" disabled>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No findings have been recorded for this inspection yet.
                    {inspection.status === "in_progress" && " Click 'Add Finding' to record issues that need to be addressed."}
                  </p>
                </CardContent>
                {inspection.status === "in_progress" && (
                  <CardFooter className="border-t pt-4">
                    <Button onClick={() => setFindingDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Finding
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Finding Dialog */}
      <Dialog open={findingDialogOpen} onOpenChange={setFindingDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Inspection Finding</DialogTitle>
            <DialogDescription>
              Record a safety issue or non-compliance that needs to be addressed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe the finding or safety issue"
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recommendedAction">Recommended Action</Label>
              <Textarea
                id="recommendedAction"
                placeholder="What needs to be done to resolve this issue?"
                value={newFinding.recommendedAction}
                onChange={(e) => setNewFinding({ ...newFinding, recommendedAction: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newFinding.severity}
                  onValueChange={(value) => setNewFinding({ ...newFinding, severity: value })}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newFinding.priority}
                  onValueChange={(value) => setNewFinding({ ...newFinding, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newFinding.dueDate}
                onChange={(e) => setNewFinding({ ...newFinding, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFindingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFinding} disabled={addFindingMutation.isPending}>
              {addFindingMutation.isPending ? "Saving..." : "Save Finding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
            <DialogDescription>
              Upload photos to document the inspection item. You can take new photos or upload existing ones.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FileUpload
              value={photoFiles[currentItemId || 0] || []}
              onChange={(files) => {
                setPhotoFiles(prev => ({
                  ...prev,
                  [currentItemId || 0]: files
                }));
              }}
              showCamera={true}
              multiple={true}
              maxFiles={5}
              maxSize={5} // 5MB
            />
            
            {/* Photo preview - if photos already exist */}
            {responses[currentItemId || 0]?.photoUrls?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Existing Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {responses[currentItemId || 0]?.photoUrls.map((url: string, index: number) => (
                    <div key={index} className="relative group rounded-md overflow-hidden border border-border">
                      <div className="aspect-square w-full bg-muted flex items-center justify-center">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button" 
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPhotoDialogOpen(false);
              // Clear the current files
              if (currentItemId) {
                setPhotoFiles(prev => ({
                  ...prev,
                  [currentItemId]: []
                }));
              }
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => currentItemId && savePhotos(currentItemId, photoFiles[currentItemId] || [])}
              disabled={!currentItemId || !(photoFiles[currentItemId || 0]?.length > 0)}
            >
              Upload Photos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}