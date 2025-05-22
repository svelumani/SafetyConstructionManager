import { useState } from "react";
import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Play, CheckCircle, Clock, AlertTriangle, BookOpen, Award, BarChart3, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demonstration purposes
const MOCK_MY_COURSES = [
  {
    id: 1,
    title: "Fall Protection Safety",
    description: "Learn essential techniques for fall prevention and protection on construction sites.",
    progress: 75,
    status: "in_progress",
    durationMinutes: 45,
    thumbnailUrl: "https://placehold.co/400x225/3982F7/FFF?text=Fall+Protection"
  },
  {
    id: 2,
    title: "Equipment Safety Basics",
    description: "Fundamentals of operating heavy machinery and equipment safely on job sites.",
    progress: 100,
    status: "completed",
    durationMinutes: 60,
    completionDate: "2025-04-15",
    thumbnailUrl: "https://placehold.co/400x225/4CAF50/FFF?text=Equipment+Safety"
  },
  {
    id: 3,
    title: "Confined Space Entry",
    description: "Safety procedures for working in confined spaces on construction sites.",
    progress: 30,
    status: "in_progress",
    durationMinutes: 55,
    thumbnailUrl: "https://placehold.co/400x225/FF9800/FFF?text=Confined+Space"
  },
  {
    id: 4,
    title: "Hazardous Materials Handling",
    description: "Proper procedures for handling and disposing of hazardous materials.",
    progress: 0,
    status: "not_started",
    durationMinutes: 50,
    thumbnailUrl: "https://placehold.co/400x225/F44336/FFF?text=Hazardous+Materials"
  },
  {
    id: 5,
    title: "Scaffold Safety",
    description: "Procedures for properly setting up, inspecting, and working on scaffolds.",
    progress: 100,
    status: "completed",
    durationMinutes: 40,
    completionDate: "2025-05-01",
    thumbnailUrl: "https://placehold.co/400x225/9C27B0/FFF?text=Scaffold+Safety"
  }
];

const MOCK_REQUIRED_TRAINING = [
  {
    id: 6,
    title: "OSHA 10-Hour Construction Safety",
    description: "Essential safety training required for all construction personnel.",
    status: "required",
    dueDate: "2025-06-15",
    priority: "high",
    thumbnailUrl: "https://placehold.co/400x225/E91E63/FFF?text=OSHA+Training"
  },
  {
    id: 7,
    title: "First Aid and CPR",
    description: "Basic first aid and CPR techniques for construction site emergencies.",
    status: "required",
    dueDate: "2025-07-10",
    priority: "medium",
    thumbnailUrl: "https://placehold.co/400x225/2196F3/FFF?text=First+Aid"
  }
];

const MOCK_STATS = {
  totalCompleted: 7,
  totalInProgress: 2,
  totalRequired: 3,
  completionRate: 70,
  totalHoursCompleted: 12.5,
  certificatesEarned: 5
};

const MOCK_POPULAR_COURSES = [
  {
    id: 8,
    title: "Electrical Safety",
    description: "Procedures for working safely with electrical systems and equipment.",
    enrollments: 87,
    rating: 4.8,
    durationMinutes: 55,
    thumbnailUrl: "https://placehold.co/400x225/FFC107/000?text=Electrical+Safety"
  },
  {
    id: 9,
    title: "Excavation Safety",
    description: "Safety procedures for excavation and trenching operations.",
    enrollments: 63,
    rating: 4.6,
    durationMinutes: 45,
    thumbnailUrl: "https://placehold.co/400x225/4CAF50/FFF?text=Excavation+Safety"
  },
  {
    id: 10,
    title: "Respiratory Protection",
    description: "Proper use and maintenance of respiratory protection equipment.",
    enrollments: 54,
    rating: 4.7,
    durationMinutes: 40,
    thumbnailUrl: "https://placehold.co/400x225/FF5722/FFF?text=Respiratory+Protection"
  }
];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
  } else if (status === "in_progress") {
    return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
  } else if (status === "not_started") {
    return <Badge className="bg-slate-500 hover:bg-slate-600">Not Started</Badge>;
  } else if (status === "required") {
    return <Badge className="bg-amber-500 hover:bg-amber-600">Required</Badge>;
  }
  return null;
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "high") {
    return <Badge variant="destructive">High Priority</Badge>;
  } else if (priority === "medium") {
    return <Badge variant="outline" className="border-amber-500 text-amber-500">Medium Priority</Badge>;
  } else if (priority === "low") {
    return <Badge variant="outline" className="border-slate-500 text-slate-500">Low Priority</Badge>;
  }
  return null;
}

export default function Training() {
  const [activeTab, setActiveTab] = useState("my-training");
  
  // Simulating data loading with react-query
  const { data: trainingData, isLoading } = useQuery({
    queryKey: ["/api/training"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        myCourses: MOCK_MY_COURSES,
        requiredTraining: MOCK_REQUIRED_TRAINING,
        stats: MOCK_STATS,
        popularCourses: MOCK_POPULAR_COURSES
      };
    }
  });

  return (
    <Layout title="Training Center" description="Complete required safety training and develop your construction skills">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold">{trainingData?.stats.totalCompleted || 0}</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={trainingData?.stats.completionRate || 0} className="h-2" />
                <span className="text-sm font-medium">{trainingData?.stats.completionRate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold">{trainingData?.stats.totalInProgress || 0}</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Hours Completed</p>
              <p className="text-lg font-bold mt-1">{trainingData?.stats.totalHoursCompleted || 0} hrs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Certificate className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <h3 className="text-2xl font-bold">{trainingData?.stats.certificatesEarned || 0}</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Required Trainings</p>
              <p className="text-lg font-bold mt-1">{trainingData?.stats.totalRequired || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content with tabs */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="my-training" value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Training Center</CardTitle>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/training/certificates">
                    <Award className="h-4 w-4 mr-2" />
                    My Certificates
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/training/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </div>
            <CardDescription>Access and complete your required safety training</CardDescription>
            <TabsList className="mt-2">
              <TabsTrigger value="my-training">My Training</TabsTrigger>
              <TabsTrigger value="required">Required Training</TabsTrigger>
              <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="my-training" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingData?.myCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={course.status} />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                      
                      {course.status === "in_progress" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{course.durationMinutes} min</span>
                        
                        <Button asChild size="sm">
                          <Link href={`/training/courses/${course.id}`}>
                            {course.status === "completed" ? (
                              <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {course.status === "not_started" ? "Start" : "Continue"}
                              </>
                            )}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="required" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingData?.requiredTraining.map(course => (
                  <Card key={course.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={course.status} />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <PriorityBadge priority={course.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-4 flex items-center text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                        <span>Due by: {new Date(course.dueDate).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <Button asChild size="sm">
                          <Link href={`/training/courses/${course.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="catalog" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingData?.popularCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-amber-500 mr-1">★</span>
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-sm text-muted-foreground ml-2">({course.enrollments} enrolled)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{course.durationMinutes} min</span>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <Button asChild size="sm">
                          <Link href={`/training/courses/${course.id}`}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Course
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </Layout>
  );
}