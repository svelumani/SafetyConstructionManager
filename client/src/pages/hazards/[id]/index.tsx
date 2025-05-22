import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHazardCommentSchema } from "@shared/schema";
import { z } from "zod";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  MapPin,
  MessageSquare,
  User,
  Clipboard,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatUTCToLocal, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Hazard detail interface
interface HazardDetail {
  id: number;
  tenantId: number;
  siteId: number;
  reportedById: number;
  title: string;
  description: string;
  location: string;
  gpsCoordinates: string | null;
  hazardType: string;
  severity: string;
  status: string;
  recommendedAction: string | null;
  photoUrls: string[] | null;
  videoIds: string[] | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  isActive: boolean;
  reportedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
  };
  site: {
    id: number;
    name: string;
  };
}

// Comment interface
interface HazardComment {
  id: number;
  hazardId: number;
  userId: number;
  comment: string;
  attachmentUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}

// Assignment interface
interface HazardAssignment {
  id: number;
  hazardId: number;
  assignedById: number;
  assignedToUserId: number | null;
  assignedToSubcontractorId: number | null;
  assignedAt: string;
  dueDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
  assignedToUser?: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  assignedToSubcontractor?: {
    id: number;
    name: string;
  };
}

// Comment form schema
const commentFormSchema = insertHazardCommentSchema.extend({});
type CommentFormData = z.infer<typeof commentFormSchema>;

export default function HazardDetail() {
  const params = useParams<{ id: string }>();
  const hazardId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch hazard details
  const { data: hazard, isLoading, isError } = useQuery<HazardDetail>({
    queryKey: ['/api/hazards', hazardId],
  });
  
  // Fetch comments
  const { data: commentsData } = useQuery<{ comments: HazardComment[] }>({
    queryKey: ['/api/hazards', hazardId, 'comments'],
    enabled: !isLoading && !isError,
  });
  
  // Fetch assignments
  const { data: assignmentsData } = useQuery<{ assignments: HazardAssignment[] }>({
    queryKey: ['/api/hazards', hazardId, 'assignments'],
    enabled: !isLoading && !isError,
  });
  
  const comments = commentsData?.comments || [];
  const assignments = assignmentsData?.assignments || [];
  
  // Comment form
  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      hazardId,
      comment: "",
      attachmentUrls: []
    },
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      const response = await apiRequest("POST", `/api/hazards/${hazardId}/comments`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
      
      // Reset form
      commentForm.reset({
        hazardId,
        comment: "",
        attachmentUrls: []
      });
      
      // Refresh comments
      queryClient.invalidateQueries({ queryKey: ['/api/hazards', hazardId, 'comments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update hazard status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/hazards/${hazardId}`, { 
        status,
        ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Hazard status has been updated successfully",
      });
      
      // Refresh hazard details
      queryClient.invalidateQueries({ queryKey: ['/api/hazards', hazardId] });
      queryClient.invalidateQueries({ queryKey: ['/api/hazards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmitComment = (data: CommentFormData) => {
    addCommentMutation.mutate(data);
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !hazard) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Hazard</h2>
          <p className="text-muted-foreground mb-4">Unable to load the hazard details.</p>
          <Button onClick={() => setLocation("/hazards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hazards
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/hazards">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          <span className="text-sm text-muted-foreground">Hazard #{hazard.id}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <PageHeader 
              title={hazard.title} 
              description={<span className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">{hazard.location}</span>
                {hazard.site && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-muted-foreground">{hazard.site.name}</span>
                  </>
                )}
              </span>}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={cn(
              "px-2 py-1 text-xs rounded-full font-medium",
              hazard.severity ? getSeverityColor(hazard.severity) : ""
            )}>
              {hazard.severity ? `${hazard.severity.charAt(0).toUpperCase() + hazard.severity.slice(1)} Severity` : "Unknown Severity"}
            </Badge>
            
            <Badge variant="outline" className={cn(
              "px-2 py-1 text-xs rounded-full font-medium",
              getStatusColor(hazard.status)
            )}>
              {hazard.status.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Badge>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hazard Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Description
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{hazard.description}</p>
                  </div>
                  
                  {hazard.recommendedAction && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Recommended Actions
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{hazard.recommendedAction}</p>
                    </div>
                  )}
                  
                  {hazard.photoUrls && hazard.photoUrls.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {hazard.photoUrls.map((url, index) => (
                          <div key={index} className="relative rounded-md overflow-hidden border">
                            <img 
                              src={url} 
                              alt={`Hazard photo ${index + 1}`} 
                              className="h-32 w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>Reported by {hazard.reportedBy ? `${hazard.reportedBy.firstName || ''} ${hazard.reportedBy.lastName || ''}`.trim() : 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatUTCToLocal(hazard.createdAt, "PP")}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Status Update Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hazard.status !== 'open' && (
                      <Button 
                        variant="outline" 
                        onClick={() => updateStatusMutation.mutate('open')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Open
                      </Button>
                    )}
                    
                    {hazard.status !== 'in_progress' && (
                      <Button 
                        variant="outline" 
                        onClick={() => updateStatusMutation.mutate('in_progress')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as In Progress
                      </Button>
                    )}
                    
                    {hazard.status !== 'resolved' && (
                      <Button 
                        variant="outline" 
                        onClick={() => updateStatusMutation.mutate('resolved')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                    
                    {hazard.status !== 'closed' && (
                      <Button 
                        variant="outline" 
                        onClick={() => updateStatusMutation.mutate('closed')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Closed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Hazard Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clipboard className="h-4 w-4 mr-2" />
                        ID
                      </dt>
                      <dd className="text-sm mt-1">{hazard.id}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Type
                      </dt>
                      <dd className="text-sm mt-1">{hazard.hazardType}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Reported On
                      </dt>
                      <dd className="text-sm mt-1">{formatUTCToLocal(hazard.createdAt, "PPp")}</dd>
                    </div>
                    
                    {hazard.resolvedAt && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolved On
                        </dt>
                        <dd className="text-sm mt-1">{formatUTCToLocal(hazard.resolvedAt, "PPp")}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/hazards/${hazardId}/assign`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Hazard
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        {comment.user.profileImageUrl ? (
                          <AvatarImage src={comment.user.profileImageUrl} alt={`${comment.user.firstName} ${comment.user.lastName}`} />
                        ) : (
                          <AvatarFallback>
                            {getUserInitials(comment.user.firstName, comment.user.lastName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">
                            {comment.user.firstName} {comment.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatUTCToLocal(comment.createdAt, "PPp")}
                          </div>
                        </div>
                        
                        <div className="mt-1 text-sm whitespace-pre-wrap">
                          {comment.comment}
                        </div>
                        
                        {comment.attachmentUrls && comment.attachmentUrls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {comment.attachmentUrls.map((url, index) => (
                              <a 
                                key={index} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Attachment {index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator className="my-6" />
              
              <Form {...commentForm}>
                <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-4">
                  <FormField
                    control={commentForm.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Add a comment..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? "Submitting..." : "Add Comment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              <Button asChild>
                <Link href={`/hazards/${hazardId}/assign`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Hazard
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-6">
                  <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No one has been assigned to this hazard</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/hazards/${hazardId}/assign`}>
                      Assign Now
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {assignment.assignedToUser ? (
                                `${assignment.assignedToUser.firstName} ${assignment.assignedToUser.lastName}`
                              ) : assignment.assignedToSubcontractor ? (
                                `${assignment.assignedToSubcontractor.name} (Subcontractor)`
                              ) : (
                                "Unassigned"
                              )}
                            </h4>
                            
                            <div className="text-sm text-muted-foreground mt-1">
                              Assigned by {assignment.assignedBy.firstName} {assignment.assignedBy.lastName} on {formatUTCToLocal(assignment.assignedAt, "PP")}
                            </div>
                            
                            {assignment.notes && (
                              <div className="mt-2 text-sm">
                                <p className="font-medium">Notes:</p>
                                <p className="whitespace-pre-wrap">{assignment.notes}</p>
                              </div>
                            )}
                            
                            {assignment.dueDate && (
                              <div className="mt-2 text-sm">
                                <p className="font-medium">Due Date:</p>
                                <p>{formatUTCToLocal(assignment.dueDate, "PPp")}</p>
                              </div>
                            )}
                          </div>
                          
                          <Badge variant="outline" className={cn(
                            "px-2 py-1 text-xs rounded-full font-medium",
                            getStatusColor(assignment.status)
                          )}>
                            {assignment.status.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}