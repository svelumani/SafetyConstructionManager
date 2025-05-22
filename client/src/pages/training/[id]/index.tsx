import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  PlayCircle,
  User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Mock content for when API is not available
const mockCourse = {
  id: 1,
  tenantId: 1,
  title: "Fall Protection Safety",
  description: "Essential safety procedures for working at heights. Learn how to properly use harnesses, anchor points, and other fall protection equipment. This course covers OSHA requirements for working at elevations above 6 feet.",
  passingScore: 80,
  isRequired: true,
  assignedRoles: ["employee", "supervisor", "safety_officer"],
  contentIds: [1, 2],
  createdById: 1,
  createdAt: "2025-04-01T10:00:00.000Z",
  updatedAt: "2025-04-01T10:00:00.000Z",
  isActive: true
};

const mockContent = [
  {
    id: 1,
    title: "Fall Protection Basics",
    description: "Introduction to fall protection equipment and safety procedures",
    contentType: "video",
    videoId: "LXb3EKWsInQ", // YouTube video ID
    duration: 360, // in seconds
    language: "en",
    createdAt: "2025-04-01T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Harness Inspection and Usage",
    description: "How to properly inspect and wear a safety harness",
    contentType: "video",
    videoId: "dQw4w9WgXcQ", // YouTube video ID as placeholder
    duration: 480, // in seconds
    language: "en",
    createdAt: "2025-04-01T11:00:00.000Z"
  }
];

const mockProgress = {
  id: 1,
  userId: 4,
  courseId: 1,
  startDate: "2025-05-15T14:30:00.000Z",
  completionDate: null,
  passed: null,
  score: null,
  lastContentId: 1
};

export default function TrainingCourseView() {
  const { id } = useParams();
  const courseId = parseInt(id || "0");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [watchedTo, setWatchedTo] = useState<number[]>([]);

  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/training-courses/${courseId}`],
    enabled: courseId > 0,
  });

  // Fetch course content
  const { data: content, isLoading: isLoadingContent } = useQuery({
    queryKey: [`/api/training-courses/${courseId}/content`],
    enabled: courseId > 0,
  });

  // Fetch user progress for this course
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/training-records/user/course/${courseId}`],
    enabled: courseId > 0 && !!user,
  });

  // Use mock data if API returns empty or undefined
  const courseData = course || mockCourse;
  const contentData = content?.length ? content : mockContent;
  const progressData = progress || mockProgress;

  // Mark content as watched mutation
  const markAsWatchedMutation = useMutation({
    mutationFn: async ({ contentId }: { contentId: number }) => {
      const res = await apiRequest("POST", `/api/training-records/watch`, {
        courseId,
        contentId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/training-records/user/course/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/training-records/user`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update progress: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mark course as completed mutation
  const completeCoursesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/training-records/complete`, {
        courseId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/training-records/user/course/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/training-records/user`] });
      toast({
        title: "Success",
        description: "Training course completed successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete course: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleVideoEnd = () => {
    const currentContent = contentData[currentContentIndex];
    if (!currentContent) return;
    
    // Mark as watched in state
    setWatchedTo(prev => {
      if (!prev.includes(currentContent.id)) {
        return [...prev, currentContent.id];
      }
      return prev;
    });
    
    // Call API to mark as watched
    markAsWatchedMutation.mutate({ contentId: currentContent.id });
    
    // If this was the last video, show completion option
    if (currentContentIndex === contentData.length - 1) {
      toast({
        title: "All content watched",
        description: "You can now complete the course.",
      });
    } else {
      // Otherwise, proceed to next content
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const handleCompleteTraining = () => {
    // Check if all content has been watched
    const allWatched = contentData.every(item => watchedTo.includes(item.id));
    
    if (!allWatched) {
      toast({
        title: "Cannot complete yet",
        description: "Please watch all videos before completing the course.",
        variant: "destructive",
      });
      return;
    }
    
    completeCoursesMutation.mutate();
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (contentData.length === 0) return 0;
    const watched = contentData.filter(item => watchedTo.includes(item.id)).length;
    return Math.round((watched / contentData.length) * 100);
  };

  const isCompleted = progressData?.completionDate !== null;

  if (isLoadingCourse || isLoadingContent || isLoadingProgress) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!courseId || courseId <= 0) {
    navigate("/training");
    return null;
  }

  const currentContent = contentData[currentContentIndex];

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/training">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Training
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{courseData.title}</CardTitle>
                <CardDescription className="text-base">
                  {courseData.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="content">Training Content</TabsTrigger>
                    <TabsTrigger value="info">Course Information</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4">
                    {/* Video Player */}
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        {currentContent?.contentType === "video" && currentContent?.videoId ? (
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${currentContent.videoId}`}
                            title={currentContent.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">
                          {currentContent?.title || "Content not available"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentContent?.description || ""}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          disabled={currentContentIndex === 0 || isCompleted}
                          onClick={() => setCurrentContentIndex(prev => prev - 1)}
                        >
                          Previous
                        </Button>
                        
                        {currentContentIndex === contentData.length - 1 ? (
                          <Button
                            variant="default"
                            disabled={calculateProgress() < 100 || isCompleted}
                            onClick={handleCompleteTraining}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {isCompleted ? "Completed" : "Complete Training"}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            disabled={
                              currentContentIndex >= contentData.length - 1 || 
                              isCompleted
                            }
                            onClick={() => {
                              handleVideoEnd(); // Mark current video as watched
                              setCurrentContentIndex(prev => prev + 1);
                            }}
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Course Created</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(courseData.createdAt), 'PPP')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Required</h3>
                        <div className="flex items-center gap-2">
                          {courseData.isRequired ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{courseData.isRequired ? "Required" : "Optional"}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Duration</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {Math.round(contentData.reduce((total, item) => total + (item.duration || 0), 0) / 60)} minutes
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Modules</h3>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{contentData.length} modules</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Content list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentData.map((item, index) => (
                    <div 
                      key={item.id}
                      onClick={() => !isCompleted && setCurrentContentIndex(index)}
                      className={`p-3 border rounded-md flex items-center gap-4 cursor-pointer transition-colors ${
                        currentContentIndex === index ? 'bg-primary/10 border-primary/50' : ''
                      } ${isCompleted || watchedTo.includes(item.id) ? 'border-green-200 dark:border-green-900' : ''}`}
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        {isCompleted || watchedTo.includes(item.id) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {Math.round((item.duration || 0) / 60)} minutes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completion</span>
                    <span className="text-sm font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                
                <div className="pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Started</span>
                      </div>
                      <span className="text-sm">
                        {progressData?.startDate 
                          ? format(new Date(progressData.startDate), 'PP')
                          : "Not started"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="text-sm">
                        {progressData?.completionDate 
                          ? format(new Date(progressData.completionDate), 'PP')
                          : "In progress"}
                      </span>
                    </div>
                    
                    {progressData?.completionDate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Status</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          progressData.passed 
                            ? "text-green-500" 
                            : "text-red-500"
                        }`}>
                          {progressData.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Content outline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Content Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {contentData.map((item, index) => (
                    <li key={item.id} className="flex items-start gap-3 py-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted || watchedTo.includes(item.id) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className={`h-4 w-4 rounded-full border ${
                            currentContentIndex === index ? 'bg-primary border-primary' : 'border-muted-foreground'
                          }`}></div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        currentContentIndex === index ? 'font-medium' : ''
                      }`}>
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}