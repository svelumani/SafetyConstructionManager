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
  MinusCircle
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
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/inspections/${id}`],
    enabled: !!id,
  });

  const inspection = data?.inspection;
  const site = data?.site;
  const inspector = data?.inspector;
  const template = data?.template;

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
    data: findingData,
    isLoading: isLoadingFindings,
  } = useQuery({
    queryKey: [`/api/inspections/${id}/findings`],
    enabled: !!id,
  });

  // Format the responses into a lookup object by checklistItemId
  useEffect(() => {
    if (responseData) {
      const formattedResponses: Record<number, any> = {};
      responseData.responses.forEach((response: any) => {
        formattedResponses[response.checklistItemId] = response;
      });
      setResponses(formattedResponses);
    }
  }, [responseData]);

  // Set the findings data
  useEffect(() => {
    if (findingData) {
      setFindings(findingData.findings);
    }
  }, [findingData]);

  // Missing required items for completion
  const [missingRequiredItems, setMissingRequiredItems] = useState<number[]>([]);
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
    onSuccess: (data) => {
      // Update the responses state
      setResponses(prev => ({
        ...prev,
        [data.checklistItemId]: data
      }));
      
      toast({
        title: "Response saved",
        description: "Your response has been saved successfully",
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

  // Function to handle response status change
  const handleResponseChange = async (checklistItemId: number, status: string, notes: string) => {
    try {
      await saveResponseMutation.mutateAsync({
        checklistItemId,
        data: {
          status,
          notes,
        }
      });
    } catch (error) {
      console.error("Error saving response:", error);
    }
  };

  // Function to handle adding a new finding
  const handleAddFinding = async () => {
    try {
      console.log('Submitting finding with date:', newFinding.dueDate);
      
      const response = await apiRequest("POST", `/api/inspections/${id}/findings`, newFinding);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add finding");
      }
      
      const data = await response.json();
      
      // Update the findings state
      setFindings(prev => [...prev, data]);
      
      // Reset the new finding form
      setNewFinding({
        description: "",
        recommendedAction: "",
        severity: "low",
        priority: "low",
        dueDate: "",
        status: "open",
      });
      
      // Close the dialog
      setFindingDialogOpen(false);
      
      // Refresh the findings data to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}/findings`] });
      
      toast({
        title: "Finding Added",
        description: "Your finding has been added successfully",
      });
    } catch (error) {
      console.error("Error adding finding:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add finding",
        variant: "destructive",
      });
    }
  };

  // Function to handle uploading photos
  const handleUploadPhotos = async () => {
    if (!currentItemId || !photoFiles[currentItemId]?.length) {
      return;
    }
    
    try {
      const existingResponse = responses[currentItemId];
      const photoUrls = await uploadFiles(photoFiles[currentItemId], `inspections/${id}/responses`);
      
      // Combine with existing photos if any
      const allPhotoUrls = [
        ...(existingResponse?.photoUrls || []),
        ...photoUrls
      ];
      
      // Save the response with the new photos
      await saveResponseMutation.mutateAsync({
        checklistItemId: currentItemId,
        data: {
          status: existingResponse?.status || "pending",
          notes: existingResponse?.notes || "",
          photoUrls: allPhotoUrls
        }
      });
      
      // Reset the photo files and close the dialog
      setPhotoFiles(prev => ({
        ...prev,
        [currentItemId]: []
      }));
      setPhotoDialogOpen(false);
      
      toast({
        title: "Photos Uploaded",
        description: "Your photos have been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    }
  };

  // Handle start inspection
  const startInspectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/inspections/${id}/start`, {});
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start inspection");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}`] });
      toast({
        title: "Inspection Started",
        description: "The inspection has been started",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/3 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !inspection) {
    return (
      <Layout>
        <div className="container py-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Failed to load inspection details. {error instanceof Error ? error.message : ""}</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => navigate('/inspections')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inspections
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <PageHeader 
            title={inspection.title} 
            description={`Inspection #${inspection.id}`}
            className="mb-0"
          />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/inspections')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {inspection.status === "pending" && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => startInspectionMutation.mutate()}
                disabled={startInspectionMutation.isPending}
              >
                {startInspectionMutation.isPending ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Start Inspection
                  </>
                )}
              </Button>
            )}
            
            {inspection.status === "in_progress" && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowCompletionDialog(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Inspection
              </Button>
            )}
            
            {(inspection.status === "pending" || inspection.status === "in_progress") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this inspection?")) {
                    cancelInspectionMutation.mutate();
                  }
                }}
                disabled={cancelInspectionMutation.isPending}
              >
                {cancelInspectionMutation.isPending ? (
                  <>Loading...</>
                ) : (
                  <>
                    <XIcon className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Inspector</h3>
                    <p className="text-base">
                      {inspector ? `${inspector.firstName} ${inspector.lastName}` : "Not assigned"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Site</h3>
                    <p className="text-base">{site?.name || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date</h3>
                    <p className="text-base">
                      {(inspection.scheduled_date || inspection.scheduledDate) ? 
                        formatUTCToLocal(inspection.scheduled_date || inspection.scheduledDate, "PPP") : 
                        "Not scheduled"}
                      {(inspection.scheduled_date || inspection.scheduledDate) && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatDistanceToNow(new Date(inspection.scheduled_date || inspection.scheduledDate), { addSuffix: true })})
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <StatusBadge status={inspection.status} />
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
            ) : template?.sections && template.sections.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection Checklist</CardTitle>
                    <CardDescription>
                      Evaluate each item against safety standards and regulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {template.sections.map((section: any) => (
                      <div key={section.id} className="space-y-4">
                        <h3 className="text-lg font-semibold">{section.name}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        )}
                        
                        <Accordion type="multiple" className="w-full">
                          {section.items && section.items.map((item: any, index: number) => {
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
                                            <MinusCircle className="h-4 w-4" />
                                            N/A
                                          </Button>
                                        </div>
                                        
                                        <div>
                                          <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                                          <Textarea 
                                            id={`notes-${item.id}`}
                                            placeholder="Add notes about this item..."
                                            value={response.notes || ""}
                                            onChange={(e) => handleResponseChange(item.id, response.status, e.target.value)}
                                            className="mt-2"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        {response.status && (
                                          <div className="mt-2">
                                            <span className="text-sm font-medium">Status: </span>
                                            <ResponseStatus status={response.status} />
                                          </div>
                                        )}
                                        
                                        {response.notes && (
                                          <div className="mt-2">
                                            <span className="text-sm font-medium">Notes:</span>
                                            <p className="text-sm mt-1">{response.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No Checklist Found</h3>
                    <p className="text-muted-foreground mb-4">
                      This inspection doesn't have a checklist template associated with it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="findings" className="space-y-4">
            {isLoadingFindings ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Findings and Recommendations</h2>
                  
                  {inspection.status === "in_progress" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFindingDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Finding
                    </Button>
                  )}
                </div>
                
                {findings.length > 0 ? (
                  findings.map((finding, index) => (
                    <Card key={finding.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">Finding #{index + 1}</CardTitle>
                          <Badge className={cn(
                            "ml-2",
                            finding.severity === "critical" && "bg-red-100 text-red-800",
                            finding.severity === "high" && "bg-orange-100 text-orange-800",
                            finding.severity === "medium" && "bg-yellow-100 text-yellow-800",
                            finding.severity === "low" && "bg-blue-100 text-blue-800",
                          )}>
                            {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)} Severity
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                          <p className="text-sm mt-1">{finding.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Recommended Action</h3>
                          <p className="text-sm mt-1">{finding.recommendedAction}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                            <p className="text-sm mt-1 capitalize">{finding.priority}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                            <p className="text-sm mt-1 capitalize">{finding.status}</p>
                          </div>
                          
                          {finding.dueDate && (
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                              <p className="text-sm mt-1">{formatUTCToLocal(finding.dueDate, "PPP")}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-muted/40">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">No Findings</h3>
                        <p className="text-muted-foreground mb-4">
                          There are no findings recorded for this inspection yet.
                        </p>
                        
                        {inspection.status === "in_progress" && (
                          <Button 
                            variant="default"
                            onClick={() => setFindingDialogOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Finding
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Capture and review visual evidence from the inspection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(responses).flatMap(([itemId, response]) => {
                    if (!response.photoUrls?.length) return [];
                    
                    return response.photoUrls.map((url: string, index: number) => (
                      <div key={`${itemId}-${index}`} className="rounded-md overflow-hidden border">
                        <div className="aspect-video bg-muted relative">
                          <img 
                            src={url} 
                            alt={`Photo ${index + 1} for checklist item ${itemId}`} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+Loading+Image";
                            }}
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-muted-foreground">
                            Checklist Item: {itemId}
                          </p>
                        </div>
                      </div>
                    ));
                  })}
                  
                  {inspection.status === "in_progress" && (
                    <div 
                      className="border border-dashed rounded-md flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setPhotoDialogOpen(true)}
                    >
                      <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Add Photos</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Capture photos for checklist items
                      </p>
                    </div>
                  )}
                </div>
                
                {Object.entries(responses).flatMap(([_, response]) => response.photoUrls || []).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">No Photos</h3>
                      <p className="text-muted-foreground mb-4">
                        There are no photos uploaded for this inspection yet.
                      </p>
                      
                      {inspection.status === "in_progress" && (
                        <Button 
                          variant="default"
                          onClick={() => setPhotoDialogOpen(true)}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Add Photos
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Inspection</DialogTitle>
            <DialogDescription>
              Add any final notes before completing this inspection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {missingRequiredItems.length > 0 && (
              <div className="bg-red-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1">Missing Required Responses</h4>
                <p className="text-xs text-red-700">
                  Please complete all required checklist items before completing the inspection.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="completion-notes">Completion Notes</Label>
              <Textarea 
                id="completion-notes" 
                placeholder="Add any final notes or observations..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCompletionDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => completeInspectionMutation.mutate({ notes: "" })}
              disabled={completeInspectionMutation.isPending}
            >
              {completeInspectionMutation.isPending ? (
                <>Loading...</>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Inspection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Finding Dialog */}
      <Dialog open={findingDialogOpen} onOpenChange={setFindingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Finding</DialogTitle>
            <DialogDescription>
              Record a finding or issue discovered during the inspection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finding-description">Description</Label>
              <Textarea 
                id="finding-description" 
                placeholder="Describe the finding or issue..."
                value={newFinding.description}
                onChange={(e) => setNewFinding(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="finding-action">Recommended Action</Label>
              <Textarea 
                id="finding-action" 
                placeholder="What action should be taken to address this finding?"
                value={newFinding.recommendedAction}
                onChange={(e) => setNewFinding(prev => ({ ...prev, recommendedAction: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finding-severity">Severity</Label>
                <Select 
                  value={newFinding.severity}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger id="finding-severity">
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
              
              <div className="space-y-2">
                <Label htmlFor="finding-priority">Priority</Label>
                <Select 
                  value={newFinding.priority}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger id="finding-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finding-status">Status</Label>
                <Select 
                  value={newFinding.status}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="finding-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finding-due-date">Due Date</Label>
                <Input 
                  id="finding-due-date"
                  type="date"
                  value={newFinding.dueDate}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFindingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddFinding}
              disabled={!newFinding.description || !newFinding.recommendedAction}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Finding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Photos Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Photos</DialogTitle>
            <DialogDescription>
              Upload photos for a checklist item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="checklist-item">Checklist Item</Label>
              <Select 
                onValueChange={(value) => setCurrentItemId(parseInt(value))}
                value={currentItemId?.toString() || ""}
              >
                <SelectTrigger id="checklist-item">
                  <SelectValue placeholder="Select a checklist item" />
                </SelectTrigger>
                <SelectContent>
                  {template?.sections?.flatMap((section: any) => 
                    section.items?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.question}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photos">Photos</Label>
              <FileUpload
                id="photos"
                accept="image/*"
                multiple
                maxFiles={5}
                maxSize={5 * 1024 * 1024} // 5MB
                onDrop={(acceptedFiles) => {
                  if (currentItemId) {
                    setPhotoFiles(prev => ({
                      ...prev,
                      [currentItemId]: [
                        ...(prev[currentItemId] || []),
                        ...acceptedFiles
                      ]
                    }));
                  }
                }}
                className="border-dashed"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop photos here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accept up to 5 images (max 5MB each)
                  </p>
                </div>
              </FileUpload>
              
              {currentItemId && photoFiles[currentItemId]?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                  <ul className="text-sm space-y-1">
                    {photoFiles[currentItemId].map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setPhotoFiles(prev => ({
                              ...prev,
                              [currentItemId]: prev[currentItemId].filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPhotoDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadPhotos}
              disabled={!currentItemId || !photoFiles[currentItemId]?.length}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}