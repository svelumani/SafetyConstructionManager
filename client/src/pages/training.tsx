import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Award,
  BookOpen,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Mock data
const mockCourses = [
  {
    id: 1,
    tenantId: 1,
    title: "Fall Protection Safety",
    description: "Essential safety procedures for working at heights. Learn how to properly use harnesses, anchor points, and other fall protection equipment.",
    passingScore: 80,
    isRequired: true,
    assignedRoles: ["employee", "supervisor", "safety_officer"],
    contentIds: [1, 2],
    createdById: 1,
    createdAt: "2025-04-01T10:00:00.000Z",
    updatedAt: "2025-04-01T10:00:00.000Z",
    isActive: true
  },
  {
    id: 2,
    tenantId: 1,
    title: "Confined Space Entry",
    description: "Safety procedures for entering and working in confined spaces. Covers hazard identification, air monitoring, and emergency procedures.",
    passingScore: 90,
    isRequired: true,
    assignedRoles: ["employee", "supervisor"],
    contentIds: [3, 4],
    createdById: 1,
    createdAt: "2025-04-05T14:30:00.000Z",
    updatedAt: "2025-04-05T14:30:00.000Z",
    isActive: true
  },
  {
    id: 3,
    tenantId: 1,
    title: "Proper Lifting Techniques",
    description: "Learn correct lifting postures and techniques to prevent back injuries on the job site.",
    passingScore: 70,
    isRequired: false,
    assignedRoles: ["employee", "supervisor", "safety_officer", "subcontractor"],
    contentIds: [5],
    createdById: 1,
    createdAt: "2025-04-10T09:15:00.000Z",
    updatedAt: "2025-04-10T09:15:00.000Z",
    isActive: true
  },
  {
    id: 4,
    tenantId: 1,
    title: "Construction Site Fire Safety",
    description: "Procedures for fire prevention, fire extinguisher use, and emergency evacuation on construction sites.",
    passingScore: 85,
    isRequired: true,
    assignedRoles: ["employee", "supervisor", "safety_officer", "subcontractor"],
    contentIds: [6, 7, 8],
    createdById: 1,
    createdAt: "2025-04-15T11:45:00.000Z",
    updatedAt: "2025-04-15T11:45:00.000Z",
    isActive: true
  }
];

const mockUserProgress = [
  {
    id: 1,
    userId: 4,
    courseId: 1,
    startDate: "2025-05-15T14:30:00.000Z",
    completionDate: "2025-05-15T15:20:00.000Z",
    passed: true,
    score: 92,
    lastContentId: 2
  },
  {
    id: 2,
    userId: 4,
    courseId: 2,
    startDate: "2025-05-16T09:45:00.000Z",
    completionDate: null,
    passed: null,
    score: null,
    lastContentId: 3
  },
  {
    id: 3,
    userId: 4,
    courseId: 3,
    startDate: "2025-05-17T13:15:00.000Z",
    completionDate: null,
    passed: null,
    score: null,
    lastContentId: null
  }
];

export default function Training() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Fetch training courses with higher limit to show all courses
  const { data: trainings, isLoading: isLoadingCourses } = useQuery({
    queryKey: [`/api/training-courses?limit=50`],
  });

  // Fetch user progress
  const { data: userTrainingRecords, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/training-records/user"],
    enabled: !!user,
  });

  const isLoading = isLoadingCourses || isLoadingProgress;

  // Use mock data if API returns empty or undefined
  const trainingCourses = trainings?.courses?.length ? trainings.courses : mockCourses;
  const userProgress = userTrainingRecords?.length ? userTrainingRecords : mockUserProgress;

  // Filter functions for each tab
  const getAssignedCourses = () => {
    const progress = userProgress || [];
    const activeCourseIds = progress.map(p => p.courseId);
    
    return trainingCourses
      .filter(course => 
        course.isActive && 
        (course.assignedRoles?.includes(user?.role) || course.isRequired) &&
        (searchQuery === "" || course.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        // Sort by required first, then by in-progress, then by not started
        if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
        
        const aProgress = progress.find(p => p.courseId === a.id);
        const bProgress = progress.find(p => p.courseId === b.id);
        
        if (!!aProgress !== !!bProgress) return aProgress ? -1 : 1;
        if (aProgress?.completionDate !== bProgress?.completionDate) {
          return (aProgress?.completionDate === null) ? -1 : 1;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  const getCompletedCourses = () => {
    const progress = userProgress || [];
    return progress
      .filter(p => p.completionDate && p.passed)
      .map(p => {
        const course = trainingCourses.find(c => c.id === p.courseId);
        return { ...course, progress: p };
      })
      .filter(course => 
        course && (searchQuery === "" || course.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => new Date(b.progress.completionDate).getTime() - new Date(a.progress.completionDate).getTime());
  };

  const getInProgressCourses = () => {
    const progress = userProgress || [];
    return progress
      .filter(p => p.startDate && !p.completionDate)
      .map(p => {
        const course = trainingCourses.find(c => c.id === p.courseId);
        return { ...course, progress: p };
      })
      .filter(course => 
        course && (searchQuery === "" || course.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => new Date(b.progress.startDate).getTime() - new Date(a.progress.startDate).getTime());
  };

  const getAvailableCourses = () => {
    const progress = userProgress || [];
    const inProgressOrCompletedIds = progress.map(p => p.courseId);
    
    return trainingCourses
      .filter(course => 
        course.isActive && 
        !inProgressOrCompletedIds.includes(course.id) &&
        (searchQuery === "" || course.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        // Sort by required first, then by creation date
        if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  // Calculate training stats
  const getTotalAssigned = () => {
    return trainingCourses.filter(course => 
      course.isActive && (course.assignedRoles?.includes(user?.role) || course.isRequired)
    ).length;
  };

  const getCompletedCount = () => {
    const progress = userProgress || [];
    return progress.filter(p => p.completionDate && p.passed).length;
  };

  const getInProgressCount = () => {
    const progress = userProgress || [];
    return progress.filter(p => p.startDate && !p.completionDate).length;
  };

  const getCompletionPercentage = () => {
    const total = getTotalAssigned();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  // Handle content for each tab
  const renderAssignedCourses = () => {
    const courses = getAssignedCourses();
    
    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No assigned training courses</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have any training courses assigned to you at this time.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const progress = userProgress.find(p => p.courseId === course.id);
          const isComplete = progress?.completionDate && progress?.passed;
          const isInProgress = progress?.startDate && !progress?.completionDate;
          const isNotStarted = !progress;
          
          return (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {course.isRequired && (
                    <Badge variant="destructive" className="ml-2 shrink-0">Required</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">
                      {isComplete ? '100%' : isInProgress ? '50%' : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={isComplete ? 100 : isInProgress ? 50 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  {isComplete ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Completed</span>
                    </div>
                  ) : isInProgress ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>In progress</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Not started</span>
                    </div>
                  )}
                </div>
                <Link href={`/training/${course.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {isComplete ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCompletedCourses = () => {
    const courses = getCompletedCourses();
    
    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No completed courses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't completed any training courses yet. Check the Assigned tab to see your courses.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {courses.map(course => (
          <Card key={course.id} className="overflow-hidden">
            <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="md:col-span-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Score</div>
                  <div className="font-medium">{course.progress.score}%</div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Completed</div>
                  <div>{format(new Date(course.progress.completionDate), 'MMM d, yyyy')}</div>
                </div>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Link href={`/training/${course.id}`}>
                  <Button variant="outline" size="sm">Review</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderInProgressCourses = () => {
    const courses = getInProgressCourses();
    
    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No courses in progress</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have any in-progress training courses. Start a course from the Assigned tab.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {courses.map(course => (
          <Card key={course.id} className="overflow-hidden">
            <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="md:col-span-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Started</div>
                  <div>{format(new Date(course.progress.startDate), 'MMM d, yyyy')}</div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Last activity</div>
                  <div>{formatDistanceToNow(new Date(course.progress.startDate), { addSuffix: true })}</div>
                </div>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Link href={`/training/${course.id}`}>
                  <Button variant="primary" size="sm">Continue</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderAvailableCourses = () => {
    const courses = getAvailableCourses();
    
    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No available courses</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There are no additional courses available for you to take at this time.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {courses.map(course => (
          <Card key={course.id} className="overflow-hidden">
            <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="md:col-span-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{course.title}</h3>
                      {course.isRequired && (
                        <Badge variant="destructive" className="ml-1">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Created</div>
                  <div>{format(new Date(course.createdAt), 'MMM d, yyyy')}</div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm">
                  <div className="text-muted-foreground">Passing Score</div>
                  <div>{course.passingScore}%</div>
                </div>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Link href={`/training/${course.id}`}>
                  <Button variant="outline" size="sm">Start Course</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Training</h1>
            <p className="text-muted-foreground">
              View and complete your required safety training courses
            </p>
          </div>
          {(user?.role === 'safety_officer' || user?.role === 'super_admin') && (
            <div className="flex gap-2">
              <Link href="/training-analytics">
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics Dashboard
                </Button>
              </Link>
              <Link href="/training-compliance">
                <Button variant="outline" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Compliance Reports
                </Button>
              </Link>
              <Link href="/training/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Training Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Assigned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getTotalAssigned()}</div>
                  <p className="text-sm text-muted-foreground">Total courses assigned to you</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">{getCompletedCount()}</div>
                    <div className="text-sm text-muted-foreground mb-1">of {getTotalAssigned()}</div>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getInProgressCount()}</div>
                  <p className="text-sm text-muted-foreground">Courses you've started but not completed</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Search and tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="available">Available</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="assigned">
                    {renderAssignedCourses()}
                  </TabsContent>
                  
                  <TabsContent value="in-progress">
                    {renderInProgressCourses()}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {renderCompletedCourses()}
                  </TabsContent>
                  
                  <TabsContent value="available">
                    {renderAvailableCourses()}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}