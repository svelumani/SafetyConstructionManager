import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileVideo, 
  Filter, 
  Loader2, 
  PlayCircle, 
  Plus, 
  Search
} from "lucide-react";
import { formatDistanceToNow, formatRelative } from "date-fns";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrainingCourse } from "@shared/schema";

// Mock data for when API is not available
const mockTrainingCourses = [
  {
    id: 1,
    tenantId: 1,
    title: "Fall Protection Safety",
    description: "Essential safety procedures for working at heights",
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
    title: "Equipment Operation Safety",
    description: "Guidelines for safe operation of heavy machinery",
    passingScore: 70,
    isRequired: true,
    assignedRoles: ["employee", "supervisor"],
    contentIds: [3, 4],
    createdById: 1,
    createdAt: "2025-04-02T10:00:00.000Z",
    updatedAt: "2025-04-02T10:00:00.000Z",
    isActive: true
  },
  {
    id: 3,
    tenantId: 1,
    title: "Hazardous Materials Handling",
    description: "Procedures for safely handling and storing hazardous materials",
    passingScore: 90,
    isRequired: true,
    assignedRoles: ["employee", "supervisor", "safety_officer"],
    contentIds: [5],
    createdById: 1,
    createdAt: "2025-04-03T10:00:00.000Z",
    updatedAt: "2025-04-03T10:00:00.000Z",
    isActive: true
  },
  {
    id: 4,
    tenantId: 1,
    title: "First Aid Basics",
    description: "Basic first aid procedures for construction site emergencies",
    passingScore: 75,
    isRequired: false,
    assignedRoles: ["employee", "supervisor", "safety_officer"],
    contentIds: [6, 7, 8],
    createdById: 1,
    createdAt: "2025-04-04T10:00:00.000Z",
    updatedAt: "2025-04-04T10:00:00.000Z",
    isActive: true
  },
  {
    id: 5,
    tenantId: 1,
    title: "Fire Safety",
    description: "Procedures for fire prevention and emergency response",
    passingScore: 80,
    isRequired: true,
    assignedRoles: ["employee", "supervisor", "safety_officer"],
    contentIds: [9, 10],
    createdById: 1,
    createdAt: "2025-04-05T10:00:00.000Z",
    updatedAt: "2025-04-05T10:00:00.000Z",
    isActive: true
  }
];

// Mock data for user progress
const mockUserProgress = [
  {
    id: 1,
    userId: 4, // Assuming current user ID is 4
    courseId: 1,
    startDate: "2025-05-15T14:30:00.000Z",
    completionDate: "2025-05-15T16:30:00.000Z",
    passed: true,
    score: 90
  },
  {
    id: 2,
    userId: 4,
    courseId: 2,
    startDate: "2025-05-16T10:30:00.000Z",
    completionDate: null,
    passed: null,
    score: null
  },
  {
    id: 3,
    userId: 4,
    courseId: 3,
    startDate: "2025-05-17T09:30:00.000Z",
    completionDate: null,
    passed: null,
    score: null
  }
];

export default function Training() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("assigned");

  // Fetch training courses
  const { data: trainingCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/training-courses"],
  });

  // Fetch user training records
  const { data: userProgress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/training-records/user"],
  });

  // Use mock data if API returns empty results
  const courses = trainingCourses.length ? trainingCourses : mockTrainingCourses;
  const progress = userProgress.length ? userProgress : mockUserProgress;

  // Calculate user's overall training progress
  const totalAssigned = progress.length;
  const completed = progress.filter(p => p.completionDate).length;
  const completionPercentage = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

  // Filter courses based on search and tab
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery.trim() === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const inProgress = progress.some(p => p.courseId === course.id && !p.completionDate);
    const isCompleted = progress.some(p => p.courseId === course.id && p.completionDate);
    const isAssigned = progress.some(p => p.courseId === course.id);
    
    if (activeTab === "assigned") return isAssigned && matchesSearch;
    if (activeTab === "inprogress") return inProgress && matchesSearch;
    if (activeTab === "completed") return isCompleted && matchesSearch;
    if (activeTab === "available") return !isAssigned && matchesSearch;
    
    return matchesSearch;
  });

  // Helper to determine completion status for display
  const getCompletionStatus = (courseId: number) => {
    const record = progress.find(p => p.courseId === courseId);
    if (!record) return "Not Started";
    if (record.completionDate) return "Completed";
    return "In Progress";
  };

  const getCourseStatusColor = (courseId: number) => {
    const status = getCompletionStatus(courseId);
    switch(status) {
      case "Completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getCourseProgress = (courseId: number) => {
    const record = progress.find(p => p.courseId === courseId);
    if (!record) return 0;
    if (record.completionDate) return 100;
    // In a real app, this would be calculated based on actual progress through the content
    return 50;
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training</h1>
            <p className="text-muted-foreground">
              View and complete your assigned safety training courses
            </p>
          </div>
          
          {user?.role === "safety_officer" && (
            <Link href="/training/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Course</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Training Progress</CardTitle>
            <CardDescription>
              Complete all required training to maintain compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-medium">{completionPercentage}% Complete</div>
                <div className="text-sm text-muted-foreground">
                  {completed} of {totalAssigned} courses completed
                </div>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Clock className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-2xl font-bold">
                        {progress.filter(p => !p.completionDate).length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-2xl font-bold">{completed}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Available</div>
                      <div className="text-2xl font-bold">
                        {courses.length - progress.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Filter:</span>
            <select
              className="border rounded px-2 py-1 text-sm bg-background"
              onChange={(e) => setActiveTab(e.target.value)}
              value={activeTab}
            >
              <option value="assigned">All Assigned</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>

        {/* Course Listing */}
        {isLoadingCourses ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileVideo className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Training Courses Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term or filter." : 
                  activeTab === "assigned" ? "You don't have any assigned training courses yet." :
                  activeTab === "inprogress" ? "You don't have any in-progress courses." :
                  activeTab === "completed" ? "You haven't completed any courses yet." :
                  "There are no additional courses available at this time."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="bg-primary/10 h-3">
                  <div 
                    className="bg-primary h-full" 
                    style={{ width: `${getCourseProgress(course.id)}%` }}
                  ></div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Badge 
                      variant="outline" 
                      className={`${getCourseStatusColor(course.id)}`}
                    >
                      {getCompletionStatus(course.id)}
                    </Badge>
                    {course.isRequired && (
                      <Badge variant="secondary">Required</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <Link href={`/training/${course.id}`}>
                    <Button className="w-full gap-2">
                      <PlayCircle className="h-4 w-4" />
                      {getCompletionStatus(course.id) === "Completed" 
                        ? "Review Course" 
                        : "Start Training"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}