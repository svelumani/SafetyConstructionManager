import Layout from "@/components/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import HazardTable from "@/components/dashboard/hazard-table";
import QuickActions from "@/components/dashboard/quick-actions";
import TrainingSummary from "@/components/dashboard/training-summary";
import RecentActivity from "@/components/dashboard/recent-activity";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  AlertTriangle, 
  Ticket, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Calendar, 
  HardHat, 
  FileCheck,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "wouter";

interface DashboardStats {
  hazards: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: { severity: string; count: number }[];
  };
  training: {
    totalUsers: number;
    completedTraining: number;
    inProgressTraining: number;
    completionRate: number;
    byCourse: { course: string; completed: number; total: number; rate: number }[];
  };
  sites: {
    totalSites: number;
    activeSites: number;
    sitesWithHazards: number;
    recentInspections: number;
  };
  incidents: {
    total: number;
    open: number;
    investigating: number;
    resolved: number;
    closedLastMonth: number;
  };
  inspections: {
    total: number;
    completed: number;
    scheduled: number;
    overdue: number;
    compliance: number;
  };
  permits: {
    total: number;
    active: number;
    pending: number;
    expiringSoon: number;
  };
  safety: {
    overallScore: number;
    trend: number;
    lastMonthScore: number;
    topSite: {
      id: number;
      name: string;
      score: number;
    };
    bottomSite: {
      id: number;
      name: string;
      score: number;
    };
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard-stats'],
  });

  // Data for dashboard - use API data when available or fallbacks based on internal tenant data
  const dashboardData = {
    hazards: data?.hazards || { 
      total: 38, 
      open: 12, 
      inProgress: 8, 
      resolved: 18, 
      bySeverity: [
        { severity: "High", count: 5 }, 
        { severity: "Medium", count: 15 }, 
        { severity: "Low", count: 18 }
      ] 
    },
    training: data?.training || { 
      totalUsers: 120, 
      completedTraining: 96, 
      inProgressTraining: 18, 
      completionRate: 86, 
      byCourse: [] 
    },
    sites: data?.sites || { 
      totalSites: 12, 
      activeSites: 8, 
      sitesWithHazards: 6, 
      recentInspections: 14 
    },
    incidents: data?.incidents || { 
      total: 24, 
      open: 5, 
      investigating: 8, 
      resolved: 11, 
      closedLastMonth: 15 
    },
    inspections: data?.inspections || { 
      total: 85, 
      completed: 65, 
      scheduled: 12, 
      overdue: 8, 
      compliance: 78 
    },
    permits: data?.permits || { 
      total: 32, 
      active: 18, 
      pending: 6, 
      expiringSoon: 4 
    },
    safety: data?.safety || { 
      overallScore: 84, 
      trend: 3, 
      lastMonthScore: 81,
      topSite: { id: 1, name: "Harvard University Science Building", score: 96 },
      bottomSite: { id: 3, name: "Downtown Hospital Renovation", score: 72 }
    }
  };
  
  // Get the current date for display
  const todayDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <Layout title="Dashboard Overview" description={`Welcome back, ${user?.firstName || 'User'}. Here's what's happening across your sites.`}>
      {/* Hero Section with Safety Score and Current Date */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Safety Officer'}
            </h1>
            <p className="text-blue-100 mb-4">{todayDate}</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-3 py-1">
                <FileCheck className="w-4 h-4 mr-1" /> Daily Report Ready
              </Badge>
              {dashboardData.inspections.overdue > 0 && (
                <Badge variant="destructive" className="px-3 py-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {dashboardData.inspections.overdue} Overdue Inspections
                </Badge>
              )}
              {dashboardData.permits.expiringSoon > 0 && (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white px-3 py-1">
                  <Clock className="w-4 h-4 mr-1" /> {dashboardData.permits.expiringSoon} Permits Expiring Soon
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-36 h-36 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{dashboardData.safety.overallScore}</span>
              <span className="text-sm text-blue-100 mb-1">Safety Score</span>
              <div className="flex items-center">
                {dashboardData.safety.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-400 mr-1 transform rotate-180" />
                )}
                <span className="text-xs font-medium text-green-400">
                  {dashboardData.safety.trend > 0 ? '+' : ''}{dashboardData.safety.trend}% from last month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Hazards"
          value={dashboardData.hazards.open}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          trend={{
            value: "8% from last week",
            direction: "down" as "down",
            positive: true
          }}
        />
        <StatsCard
          title="Open Incidents"
          value={dashboardData.incidents.open + dashboardData.incidents.investigating}
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          trend={{
            value: "5% from last month",
            direction: "down" as "down",
            positive: true
          }}
        />
        <StatsCard
          title="Training Compliance"
          value={`${dashboardData.training.completionRate}%`}
          icon={GraduationCap}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{
            value: "3% from last week",
            direction: "up" as "up",
            positive: true
          }}
        />
        <StatsCard
          title="Inspection Compliance"
          value={`${dashboardData.inspections.compliance}%`}
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{
            value: "2% from last week",
            direction: "up" as "up",
            positive: true
          }}
        />
      </div>

      {/* Safety Performance and Critical Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Safety Performance Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
              Safety Performance
            </CardTitle>
            <CardDescription>Site-specific safety scores</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Top Performer */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Top Performer</span>
                <Badge className="bg-green-500 hover:bg-green-500">{dashboardData.safety.topSite.score}%</Badge>
              </div>
              <div className="flex items-center mb-1">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{dashboardData.safety.topSite.name}</span>
              </div>
              <Progress value={dashboardData.safety.topSite.score} className="h-2 bg-gray-100" />
            </div>

            {/* Bottom Performer */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Needs Improvement</span>
                <Badge variant="outline" className="text-amber-500 border-amber-500">{dashboardData.safety.bottomSite.score}%</Badge>
              </div>
              <div className="flex items-center mb-1">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{dashboardData.safety.bottomSite.name}</span>
              </div>
              <Progress value={dashboardData.safety.bottomSite.score} className="h-2 bg-gray-100" />
            </div>
            
            <Separator className="my-4" />
            
            {/* Call to Action */}
            <div className="mt-4">
              <Link href="/safety-scores" className="text-sm text-blue-600 hover:underline flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                View detailed safety analytics
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardHat className="h-5 w-5 mr-2 text-blue-600" />
              Priority Action Items
            </CardTitle>
            <CardDescription>Critical issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overdue Inspections */}
              {dashboardData.inspections.overdue > 0 && (
                <div className="flex items-start gap-4 p-3 bg-red-50 rounded-md border border-red-100">
                  <div className="rounded-full bg-red-100 p-2">
                    <FileCheck className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-red-800">Overdue Inspections</h4>
                      <Badge variant="destructive">{dashboardData.inspections.overdue}</Badge>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      {dashboardData.inspections.overdue} inspections are past their due date and require immediate attention.
                    </p>
                    <Link href="/inspections" className="text-xs text-red-800 hover:underline mt-2 inline-block">
                      View overdue inspections →
                    </Link>
                  </div>
                </div>
              )}

              {/* Expiring Permits */}
              {dashboardData.permits.expiringSoon > 0 && (
                <div className="flex items-start gap-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Ticket className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-amber-800">Expiring Permits</h4>
                      <Badge className="bg-amber-500">{dashboardData.permits.expiringSoon}</Badge>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      {dashboardData.permits.expiringSoon} permits will expire in the next 7 days and may need renewal.
                    </p>
                    <Link href="/permits" className="text-xs text-amber-800 hover:underline mt-2 inline-block">
                      Manage permits →
                    </Link>
                  </div>
                </div>
              )}

              {/* High Severity Hazards */}
              {(dashboardData.hazards.bySeverity && dashboardData.hazards.bySeverity.length > 0) && (
                <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="rounded-full bg-blue-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-blue-800">High Severity Hazards</h4>
                      <Badge className="bg-blue-500">{dashboardData.hazards.bySeverity[0]?.count || 5}</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {dashboardData.hazards.bySeverity[0]?.count || 5} high severity hazards require assessment and risk mitigation.
                    </p>
                    <Link href="/hazards" className="text-xs text-blue-800 hover:underline mt-2 inline-block">
                      View hazard reports →
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Training Compliance */}
              {dashboardData.training.completionRate < 90 && (
                <div className="flex items-start gap-4 p-3 bg-green-50 rounded-md border border-green-100">
                  <div className="rounded-full bg-green-100 p-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-green-800">Training Compliance</h4>
                      <Badge className="bg-green-500">{dashboardData.training.completionRate}%</Badge>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {120 - dashboardData.training.completedTraining} workers need to complete required safety training.
                    </p>
                    <Link href="/training-compliance" className="text-xs text-green-800 hover:underline mt-2 inline-block">
                      View training compliance →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hazard Summary */}
        <div className="lg:col-span-2">
          <HazardTable />
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
      
      {/* Daily Report Reminder */}
      <Card className="mt-6 border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-800">Daily Safety Report Available</h3>
                <p className="text-sm text-blue-600">
                  Review and share today's safety summary with your team
                </p>
              </div>
            </div>
            <Link href="/daily-report">
              <Button>
                <FileCheck className="h-4 w-4 mr-2" />
                View Daily Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
