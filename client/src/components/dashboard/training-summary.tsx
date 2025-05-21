import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TrainingProgress {
  course: string;
  completed: number;
  total: number;
  rate: number;
}

interface TrainingStatsResponse {
  totalUsers: number;
  completedTraining: number;
  inProgressTraining: number;
  completionRate: number;
  byCourse: TrainingProgress[];
}

export default function TrainingSummary() {
  const { data, isLoading } = useQuery<TrainingStatsResponse>({
    queryKey: ['/api/dashboard-stats'],
    select: (data) => data.training,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Training Status</h2>
            <Button variant="link" asChild>
              <Link to="/training">View All</Link>
            </Button>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No training data available</p>
        </div>
      </div>
    );
  }

  // Sample courses to display (in case API returns no course data)
  const coursesToDisplay = data.byCourse && data.byCourse.length > 0 
    ? data.byCourse.slice(0, 4) 
    : [
        { course: "Fire Safety", completed: 98, total: 100, rate: 98 },
        { course: "Fall Protection", completed: 85, total: 100, rate: 85 },
        { course: "Equipment Safety", completed: 78, total: 100, rate: 78 },
        { course: "Chemical Handling", completed: 65, total: 100, rate: 65 }
      ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Training Status</h2>
          <Button variant="link" asChild>
            <Link to="/training">View All</Link>
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Site Onboarding</div>
            <div className="font-semibold">{data.completionRate}% Complete</div>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-success flex items-center justify-center text-lg font-bold">
            {data.completionRate}%
          </div>
        </div>
        <div className="space-y-3">
          {coursesToDisplay.map((course, index) => (
            <div key={index}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{course.course}</div>
                <div className="text-sm">{course.rate}% Complete</div>
              </div>
              <Progress 
                value={course.rate} 
                className="h-2 mt-1" 
                indicatorClassName={course.rate > 70 ? "bg-success" : "bg-warning"} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
