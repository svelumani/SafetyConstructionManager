import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Plus, 
  Filter,
  Play,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatUTCToLocal } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface TrainingCourse {
  id: number;
  title: string;
  description: string;
  passingScore: number;
  isRequired: boolean;
  createdById: number;
  createdBy: string;
  contentCount: number;
  duration: number;
  completionRate: number;
  status?: string;
  startDate?: string;
  completionDate?: string;
  score?: number;
}

export default function Training() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ courses: TrainingCourse[], total: number }>({
    queryKey: ['/api/training-courses', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      userId: activeTab === "my" ? user?.id : undefined
    }],
  });

  const courses = data?.courses || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const columns = [
    {
      header: "Course",
      accessorKey: "title",
      cell: (item: TrainingCourse) => (
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-muted-foreground">{item.description.substring(0, 60)}...</div>
        </div>
      ),
    },
    {
      header: "Content",
      accessorKey: "contentCount",
      cell: (item: TrainingCourse) => (
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Play className="h-4 w-4 mr-1 text-primary" />
              <span>{item.contentCount} items</span>
            </div>
            <div className="text-gray-500">|</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{item.duration} min</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Required",
      accessorKey: "isRequired",
      cell: (item: TrainingCourse) => (
        <Badge variant={item.isRequired ? "default" : "outline"}>
          {item.isRequired ? "Required" : "Optional"}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: TrainingCourse) => {
        if (activeTab === "my") {
          // For "My Courses" tab
          return (
            <div>
              {item.status === "completed" ? (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-success" />
                  <span className="text-success">Completed</span>
                </div>
              ) : item.status === "in_progress" ? (
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-primary">In Progress</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">Not Started</span>
                </div>
              )}
            </div>
          );
        } else {
          // For "All Courses" tab - show completion rate
          return (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs mb-1">
                <span>{item.completionRate}% Completed</span>
              </div>
              <Progress value={item.completionRate} />
            </div>
          );
        }
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: TrainingCourse) => (
        <Button variant="default" size="sm" asChild>
          <Link href={`/training/${item.id}`}>
            {activeTab === "my" && !item.completionDate ? "Start Course" : "View Course"}
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Training" description="Access and complete safety training courses">
      <div className="flex justify-between items-center mb-6">
        {user?.role === "safety_officer" && (
          <Button asChild>
            <Link href="/training/new">
              <Plus className="mr-2 h-4 w-4" /> Create New Course
            </Link>
          </Button>
        )}
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Training Progress</CardTitle>
          <CardDescription>Track your completion of required safety training courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full border-4 border-success flex items-center justify-center text-xl font-bold mr-4">
                73%
              </div>
              <div>
                <div className="text-lg font-semibold">Overall Completion</div>
                <div className="text-sm text-muted-foreground">11 of 15 courses completed</div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <CheckCircle className="text-success mr-2" />
                <div className="text-lg font-semibold">11 Completed</div>
              </div>
              <div className="flex items-center">
                <Clock className="text-amber-500 mr-2" />
                <div className="text-lg font-semibold">4 Pending</div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="font-semibold mb-1">Required Courses</div>
              <Progress value={80} className="mb-2" />
              <div className="text-sm text-muted-foreground">8 of 10 required courses completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Training Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button 
              variant={activeTab === "my" ? "default" : "outline"} 
              className="mr-2"
              onClick={() => setActiveTab("my")}
            >
              My Courses
            </Button>
            <Button 
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
            >
              All Courses
            </Button>
          </div>
          
          <DataTable
            columns={columns}
            data={courses}
            isLoading={isLoading}
            pagination={{
              pageIndex,
              pageSize,
              pageCount: totalPages,
              setPageIndex,
              setPageSize,
            }}
            emptyState={
              <div className="py-8 text-center">
                <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No courses found</p>
                {user?.role === "safety_officer" && (
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/training/new">Create a course</Link>
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
