import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Loader2,
  TimerIcon,
  TrendingUp,
  Users,
  BarChart3,
  GraduationCap,
  Clock10,
  BadgeCheck,
  Target,
  Activity,
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

export default function TrainingAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  // Fetch training courses
  const { data: trainings, isLoading: isLoadingCourses } = useQuery({
    queryKey: [`/api/training-courses?limit=50`],
  });

  // Fetch user progress
  const { data: userTrainingRecords, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/training-records/user"],
    enabled: !!user,
  });

  // Fetch all training records (for admins/safety officers)
  const { data: allTrainingRecords, isLoading: isLoadingAllRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user && (user.role === 'safety_officer' || user.role === 'super_admin'),
  });

  const isLoading = isLoadingCourses || isLoadingProgress || isLoadingAllRecords;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const trainingCourses = trainings?.courses || [];
  const userProgress = userTrainingRecords || [];
  const allRecords = allTrainingRecords?.records || [];

  // Calculate key metrics
  const totalCourses = trainingCourses.length;
  const totalCompletions = allRecords.filter(record => record.completionDate).length;
  const totalInProgress = allRecords.filter(record => record.startDate && !record.completionDate).length;
  const totalAssigned = allRecords.length;
  const avgCompletionRate = totalAssigned > 0 ? Math.round((totalCompletions / totalAssigned) * 100) : 0;
  
  // Required vs. Optional courses breakdown
  const requiredCourses = trainingCourses.filter(course => course.isRequired).length;
  const optionalCourses = totalCourses - requiredCourses;
  
  // Course completion rates by category
  const courseCategories = [...new Set(trainingCourses.map(course => {
    // Extract category from mock data - in a real app, this would come from the course data
    const title = course.title.toLowerCase();
    if (title.includes('safety')) return 'Safety';
    if (title.includes('emergency') || title.includes('first aid')) return 'Emergency';
    if (title.includes('equipment') || title.includes('tool')) return 'Equipment';
    if (title.includes('health') || title.includes('protection')) return 'Health';
    return 'General';
  }))];
  
  const categoryCompletionData = courseCategories.map(category => {
    const coursesInCategory = trainingCourses.filter(course => {
      const title = course.title.toLowerCase();
      if (category === 'Safety') return title.includes('safety');
      if (category === 'Emergency') return title.includes('emergency') || title.includes('first aid');
      if (category === 'Equipment') return title.includes('equipment') || title.includes('tool');
      if (category === 'Health') return title.includes('health') || title.includes('protection');
      return !title.includes('safety') && 
             !title.includes('emergency') && 
             !title.includes('first aid') && 
             !title.includes('equipment') && 
             !title.includes('tool') &&
             !title.includes('health') &&
             !title.includes('protection');
    });
    
    const courseIds = coursesInCategory.map(course => course.id);
    const totalCourseRecords = allRecords.filter(record => courseIds.includes(record.courseId)).length;
    const completedCourseRecords = allRecords.filter(record => 
      courseIds.includes(record.courseId) && record.completionDate
    ).length;
    
    const completionRate = totalCourseRecords > 0 ? Math.round((completedCourseRecords / totalCourseRecords) * 100) : 0;
    
    return {
      name: category,
      count: coursesInCategory.length,
      completionRate,
      color: 
        category === 'Safety' ? '#f97316' : 
        category === 'Emergency' ? '#ef4444' : 
        category === 'Equipment' ? '#8b5cf6' : 
        category === 'Health' ? '#10b981' : 
        '#6366f1'
    };
  });
  
  // Trending completion data (last 90 days)
  const trendingCompletionData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = subDays(new Date(), 30 * (5 - i));
    const monthEnd = i === 5 ? new Date() : subDays(new Date(), 30 * (4 - i));
    
    const completions = allRecords.filter(record => {
      if (!record.completionDate) return false;
      const completionDate = new Date(record.completionDate);
      return completionDate >= monthStart && completionDate <= monthEnd;
    }).length;
    
    return {
      name: format(monthStart, 'MMM'),
      completions,
    };
  });
  
  // User completion leaderboard data
  const userIds = [...new Set(allRecords.map(record => record.userId))];
  const leaderboardData = userIds.map(userId => {
    const userRecords = allRecords.filter(record => record.userId === userId);
    const completedRecords = userRecords.filter(record => record.completionDate);
    const totalCompleted = completedRecords.length;
    const avgScore = completedRecords.length > 0 
      ? Math.round(completedRecords.reduce((sum, record) => sum + (record.score || 0), 0) / completedRecords.length) 
      : 0;
    
    // In a real app, we would fetch user names from the database
    // For this demo, we'll generate mock names
    const mockNames = [
      "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis",
      "David Wilson", "Jennifer Taylor", "Robert Anderson", "Lisa Thomas",
      "Daniel Martinez", "Michelle Garcia", "William Robinson", "Jessica Lewis"
    ];
    const name = mockNames[userId % mockNames.length];
    
    return {
      userId,
      name,
      totalCompleted,
      avgScore,
    };
  }).sort((a, b) => b.totalCompleted - a.totalCompleted || b.avgScore - a.avgScore).slice(0, 10);
  
  // Course popularity data
  const coursePopularityData = trainingCourses.map(course => {
    const courseRecords = allRecords.filter(record => record.courseId === course.id);
    const completedCount = courseRecords.filter(record => record.completionDate).length;
    const inProgressCount = courseRecords.filter(record => record.startDate && !record.completionDate).length;
    
    return {
      id: course.id,
      name: course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title,
      completed: completedCount,
      inProgress: inProgressCount,
      total: courseRecords.length,
      popularity: courseRecords.length,
    };
  }).sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  
  // Time to completion data (average days)
  const timeToCompletionData = trainingCourses.map(course => {
    const completedRecords = allRecords.filter(
      record => record.courseId === course.id && record.completionDate && record.startDate
    );
    
    if (completedRecords.length === 0) return null;
    
    const avgDays = Math.round(
      completedRecords.reduce((sum, record) => {
        const startDate = new Date(record.startDate);
        const completionDate = new Date(record.completionDate);
        return sum + differenceInDays(completionDate, startDate);
      }, 0) / completedRecords.length
    );
    
    return {
      id: course.id,
      name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
      days: avgDays,
      records: completedRecords.length,
    };
  }).filter(Boolean).sort((a, b) => a.days - b.days).slice(0, 5);
  
  // Required vs. Optional pie chart data
  const requiredVsOptionalData = [
    { name: 'Required', value: requiredCourses, color: '#f97316' },
    { name: 'Optional', value: optionalCourses, color: '#6366f1' },
  ];
  
  // Completion status pie chart data
  const completionStatusData = [
    { name: 'Completed', value: totalCompletions, color: '#10b981' },
    { name: 'In Progress', value: totalInProgress, color: '#f59e0b' },
    { name: 'Not Started', value: totalAssigned - totalCompletions - totalInProgress, color: '#6b7280' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Training Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into training performance and completion metrics.
          </p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Hero section with key metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {requiredCourses} required, {optionalCourses} optional
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgCompletionRate}%</div>
                  <div className="mt-2">
                    <Progress value={avgCompletionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCompletions}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCompletions > 0 ? `${totalInProgress} in progress` : 'No completions yet'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userIds.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Training participants
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Chart and analysis section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Completion by category */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Course Completion by Category</CardTitle>
                  <CardDescription>
                    Tracking completion rates across different training categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={categoryCompletionData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Completion Rate (%)" dataKey="completionRate" fill="#10b981" />
                      <Bar name="Number of Courses" dataKey="count" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Pie charts */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Course Distribution</CardTitle>
                  <CardDescription>
                    Required vs. optional courses and completion status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-center mb-2">
                        Required vs. Optional
                      </h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={requiredVsOptionalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${Math.round(percent * 100)}%`
                            }
                            labelLine={false}
                          >
                            {requiredVsOptionalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-center mb-2">
                        Completion Status
                      </h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={completionStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${Math.round(percent * 100)}%`
                            }
                            labelLine={false}
                          >
                            {completionStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Popularity and completion time */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Most popular courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Courses</CardTitle>
                  <CardDescription>
                    Courses with the highest enrollment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coursePopularityData.map((course, index) => (
                      <div key={course.id} className="flex items-center">
                        <div className="flex-shrink-0 w-9 text-center">
                          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                            index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">{course.name}</h4>
                            <span className="text-sm text-muted-foreground">
                              {course.total} enrollments
                            </span>
                          </div>
                          <div className="mt-1 w-full">
                            <div className="flex text-xs text-muted-foreground justify-between mb-1">
                              <span>{course.completed} completed</span>
                              <span>{course.inProgress} in progress</span>
                            </div>
                            <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500" 
                                style={{ width: `${(course.completed / course.total) * 100}%` }}
                              />
                              <div 
                                className="bg-amber-500" 
                                style={{ width: `${(course.inProgress / course.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Fastest completion times */}
              <Card>
                <CardHeader>
                  <CardTitle>Fastest Completion Times</CardTitle>
                  <CardDescription>
                    Average days to complete courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeToCompletionData.map((course, index) => (
                      <div key={course.id} className="flex items-center">
                        <div className="flex-shrink-0 w-9 text-center">
                          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                            index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">{course.name}</h4>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="text-sm font-medium">
                                {course.days} {course.days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 w-full">
                            <div className="text-xs text-muted-foreground">
                              Based on {course.records} {course.records === 1 ? 'completion' : 'completions'}
                            </div>
                            <div className="mt-1 w-full bg-muted h-2 rounded-full">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, 100 - (course.days / 14) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            {/* Performance leaderboards */}
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>User Performance Leaderboard</CardTitle>
                  <CardDescription>
                    Top performers ranked by completed courses and average scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {leaderboardData.map((user, index) => (
                      <div key={user.userId}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {index === 0 ? (
                              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 text-yellow-600">
                                <Award className="h-5 w-5" />
                              </span>
                            ) : index === 1 ? (
                              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600">
                                <Award className="h-5 w-5" />
                              </span>
                            ) : index === 2 ? (
                              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 text-orange-600">
                                <Award className="h-5 w-5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium truncate">{user.name}</h4>
                            <div className="flex mt-1 items-center text-xs text-muted-foreground">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              <span>{user.totalCompleted} completed</span>
                              <span className="mx-2">•</span>
                              <span>{user.avgScore}% avg. score</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <div className="flex items-center gap-2">
                              {index < 3 && (
                                <Badge className={
                                  index === 0 ? "bg-yellow-500" : 
                                  index === 1 ? "bg-gray-400" : 
                                  "bg-orange-500"
                                }>
                                  {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Place
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < leaderboardData.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Category performance */}
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance Analysis</CardTitle>
                  <CardDescription>
                    Training completion metrics by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={categoryCompletionData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        name="Completion Rate (%)" 
                        dataKey="completionRate" 
                        radius={[0, 4, 4, 0]}
                      >
                        {categoryCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            {/* Trending completions over time */}
            <Card>
              <CardHeader>
                <CardTitle>Training Completion Trends</CardTitle>
                <CardDescription>
                  Monthly course completions over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={trendingCompletionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completions"
                      name="Course Completions"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Key insights and recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Key Insights and Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                      Completion Trends
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {trendingCompletionData[5].completions > trendingCompletionData[4].completions
                        ? "Course completions are trending upward this month. Continue the momentum with regular reminders."
                        : "Course completions have decreased this month. Consider implementing engagement strategies."
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-primary" />
                      Focus Areas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {categoryCompletionData
                        .sort((a, b) => a.completionRate - b.completionRate)
                        .slice(0, 1)
                        .map(category => 
                          `${category.name} courses have the lowest completion rate at ${category.completionRate}%. ` +
                          `Consider reviewing the content or offering incentives to boost engagement.`
                        )
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Clock10 className="h-4 w-4 mr-2 text-primary" />
                      Time Efficiency
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {timeToCompletionData && timeToCompletionData.length > 0
                        ? `The fastest completed course (${timeToCompletionData[0].name}) takes an average of ${timeToCompletionData[0].days} days. ` +
                          `Consider analyzing its structure to improve other courses.`
                        : "No completion time data available yet. Encourage users to complete courses to gather insights."
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      User Engagement
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {avgCompletionRate < 50
                        ? `The overall completion rate (${avgCompletionRate}%) is below target. Consider implementing a recognition program for course completions.`
                        : `The overall completion rate (${avgCompletionRate}%) is good. Continue recognizing top performers to maintain engagement.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}