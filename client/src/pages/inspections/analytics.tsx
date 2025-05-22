import { useState } from "react";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Award,
  BarChart3,
  CalendarCheck,
  CheckCircle,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// StatCard component for displaying metrics
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-background p-2">{icon}</div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Mock data for demonstration
const MOCK_COMPLETION_RATE = 78;
const MOCK_COMPLETION_CHANGE = 12;

const MOCK_INSPECTOR_PERFORMANCE = [
  { name: "John Smith", completed: 24, onTime: 22, score: 92 },
  { name: "Maria Garcia", completed: 19, onTime: 18, score: 88 },
  { name: "David Chen", completed: 16, onTime: 12, score: 75 },
  { name: "Sarah Johnson", completed: 12, onTime: 11, score: 83 },
  { name: "Michael Lee", completed: 9, onTime: 7, score: 78 },
];

const MOCK_SITE_PERFORMANCE = [
  { name: "Downtown Tower", completed: 18, scheduled: 20, score: 90 },
  { name: "Westside Complex", completed: 15, scheduled: 18, score: 83 },
  { name: "North Station Project", completed: 12, scheduled: 16, score: 75 },
  { name: "Harbor View Site", completed: 10, scheduled: 10, score: 100 },
  { name: "Mountain Ridge Development", completed: 8, scheduled: 12, score: 67 },
];

const MOCK_STATUS_DATA = [
  { name: "Completed", value: 78, color: "#4ade80" },
  { name: "In Progress", value: 15, color: "#60a5fa" },
  { name: "Scheduled", value: 5, color: "#f59e0b" },
  { name: "Overdue", value: 2, color: "#ef4444" },
];

const MOCK_INSPECTIONS_BY_TYPE = [
  { name: "Safety Audit", completed: 35, inProgress: 8, scheduled: 5 },
  { name: "Equipment Check", completed: 28, inProgress: 4, scheduled: 3 },
  { name: "Hazard Assessment", completed: 22, inProgress: 6, scheduled: 4 },
  { name: "Compliance Review", completed: 18, inProgress: 3, scheduled: 2 },
  { name: "Incident Follow-up", completed: 12, inProgress: 2, scheduled: 1 },
];

const MOCK_MONTHLY_TRENDS = [
  { month: "Jan", completed: 42, scheduled: 45 },
  { month: "Feb", completed: 38, scheduled: 40 },
  { month: "Mar", completed: 45, scheduled: 48 },
  { month: "Apr", completed: 40, scheduled: 44 },
  { month: "May", completed: 53, scheduled: 58 },
];

const MOCK_COMMON_FINDINGS = [
  { finding: "Missing PPE", count: 28, change: 5, increasing: true },
  { finding: "Improper Tool Storage", count: 22, change: -3, increasing: false },
  { finding: "Trip Hazards", count: 18, change: 2, increasing: true },
  { finding: "Inadequate Signage", count: 15, change: -4, increasing: false },
  { finding: "Electrical Safety Issues", count: 12, change: 0, increasing: false },
];

export default function InspectionAnalytics() {
  // Simulating data loading for a more realistic experience
  const { data: inspectionStats, isLoading } = useQuery({
    queryKey: ["/api/inspection-analytics"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        completionRate: MOCK_COMPLETION_RATE,
        completionChange: MOCK_COMPLETION_CHANGE,
        totalScheduled: 145,
        totalCompleted: 113,
        totalInProgress: 22,
        totalOverdue: 10,
        inspectorPerformance: MOCK_INSPECTOR_PERFORMANCE,
        sitePerformance: MOCK_SITE_PERFORMANCE,
        statusData: MOCK_STATUS_DATA,
        inspectionsByType: MOCK_INSPECTIONS_BY_TYPE,
        monthlyTrends: MOCK_MONTHLY_TRENDS,
        commonFindings: MOCK_COMMON_FINDINGS,
      };
    },
  });

  return (
    <Layout
      title="Inspection Analytics"
      description="Track inspection performance and identify trends across your organization"
    >
      {/* Hero Section with Key Metrics */}
      <section className="mb-8">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  Inspection Performance Dashboard
                </h2>
                <p className="text-muted-foreground max-w-prose">
                  Comprehensive analytics to drive safety improvements and ensure
                  regulatory compliance across all construction sites.
                </p>

                <div className="flex flex-col space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Completion Rate
                    </span>
                    <span className="text-sm font-medium">
                      {inspectionStats?.completionRate || 0}%
                    </span>
                  </div>
                  <Progress
                    value={inspectionStats?.completionRate || 0}
                    className="h-2"
                    indicatorClassName={cn(
                      inspectionStats?.completionRate >= 80
                        ? "bg-green-500"
                        : inspectionStats?.completionRate >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                    )}
                  />
                  <div className="flex items-center text-sm text-muted-foreground">
                    {inspectionStats?.completionChange > 0 ? (
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span>
                      {Math.abs(inspectionStats?.completionChange || 0)}% from
                      previous month
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Scheduled"
                  value={inspectionStats?.totalScheduled || 0}
                  icon={<CalendarCheck className="h-5 w-5 text-blue-500" />}
                  description="Inspections scheduled"
                />
                <StatCard
                  title="Completed"
                  value={inspectionStats?.totalCompleted || 0}
                  icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                  description="Inspections completed"
                />
                <StatCard
                  title="In Progress"
                  value={inspectionStats?.totalInProgress || 0}
                  icon={<Clock className="h-5 w-5 text-amber-500" />}
                  description="Currently underway"
                />
                <StatCard
                  title="Overdue"
                  value={inspectionStats?.totalOverdue || 0}
                  icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                  description="Past due date"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Performance Leaderboards Section */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Performance Leaders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Top Performing Inspectors
              </CardTitle>
              <CardDescription>
                Based on completion rates and timeliness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionStats?.inspectorPerformance.map((inspector, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center p-3 rounded-lg",
                      index === 0
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold mr-3",
                        index === 0
                          ? "bg-primary"
                          : index === 1
                          ? "bg-primary/80"
                          : "bg-primary/60"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{inspector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {inspector.completed} inspections ({inspector.onTime} on time)
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "text-lg font-bold",
                          inspector.score >= 90
                            ? "text-green-600"
                            : inspector.score >= 70
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {inspector.score}%
                      </div>
                      {index === 0 && (
                        <Award className="ml-2 h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Site Safety Performance
              </CardTitle>
              <CardDescription>
                Ranked by inspection completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionStats?.sitePerformance.map((site, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center p-3 rounded-lg",
                      index === 0
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold mr-3",
                        index === 0
                          ? "bg-primary"
                          : index === 1
                          ? "bg-primary/80"
                          : "bg-primary/60"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {site.completed}/{site.scheduled} inspections completed
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "text-lg font-bold",
                          site.score >= 90
                            ? "text-green-600"
                            : site.score >= 70
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {site.score}%
                      </div>
                      {index === 0 && (
                        <Award className="ml-2 h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Visual Charts Section */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Inspection Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Inspections by Type
              </CardTitle>
              <CardDescription>
                Distribution across different inspection categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inspectionStats?.inspectionsByType}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickMargin={10}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      stackId="a"
                      fill="#4ade80"
                    />
                    <Bar
                      dataKey="inProgress"
                      name="In Progress"
                      stackId="a"
                      fill="#60a5fa"
                    />
                    <Bar
                      dataKey="scheduled"
                      name="Scheduled"
                      stackId="a"
                      fill="#f59e0b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Monthly Inspection Trends
              </CardTitle>
              <CardDescription>
                Scheduled vs. completed inspections over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={inspectionStats?.monthlyTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="scheduled"
                      name="Scheduled"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#4ade80"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Common Findings & Recommendations */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">
          Safety Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flame className="mr-2 h-5 w-5 text-red-500" />
                Top Safety Issues
              </CardTitle>
              <CardDescription>
                Most frequently identified concerns requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionStats?.commonFindings.map((finding, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start">
                      <div
                        className={cn(
                          "flex items-center justify-center min-w-8 h-8 rounded-full text-white font-semibold mr-3",
                          index === 0
                            ? "bg-red-600"
                            : index === 1
                            ? "bg-red-500"
                            : "bg-red-400"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{finding.finding}</div>
                        <div className="text-sm text-muted-foreground">
                          Found in {finding.count} inspections
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant={finding.increasing ? "destructive" : "outline"}
                        className={cn(
                          "ml-2",
                          !finding.increasing && finding.change !== 0 && "bg-green-100"
                        )}
                      >
                        {finding.increasing ? (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        ) : finding.change !== 0 ? (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        ) : null}
                        {finding.change === 0
                          ? "No change"
                          : `${Math.abs(finding.change)}% ${
                              finding.increasing ? "increase" : "decrease"
                            }`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                Inspection Status
              </CardTitle>
              <CardDescription>
                Current status of all inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inspectionStats?.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {inspectionStats?.statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {inspectionStats?.statusData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Recommendations for Improvement</CardTitle>
            <CardDescription>
              Based on analytics and inspection findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold text-base mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">
                    1
                  </span>
                  Improve PPE Compliance
                </h4>
                <p className="text-sm text-muted-foreground">
                  Implement daily PPE checks at start of shifts and consider
                  introducing a reward system for consistent compliance.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold text-base mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">
                    2
                  </span>
                  Tool Storage Solutions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Provide additional mobile tool storage options at North Station
                  Project to reduce improper tool storage violations.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold text-base mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">
                    3
                  </span>
                  Targeted Training
                </h4>
                <p className="text-sm text-muted-foreground">
                  Schedule refresher training on electrical safety for Westside
                  Complex team members based on recent inspection findings.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold text-base mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">
                    4
                  </span>
                  Overdue Inspections
                </h4>
                <p className="text-sm text-muted-foreground">
                  Prioritize completion of 10 overdue inspections, focusing first
                  on high-risk areas at Downtown Tower and North Station.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}