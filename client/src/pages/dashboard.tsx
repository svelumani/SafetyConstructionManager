import Layout from "@/components/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import HazardTable from "@/components/dashboard/hazard-table";
import QuickActions from "@/components/dashboard/quick-actions";
import TrainingSummary from "@/components/dashboard/training-summary";
import RecentActivity from "@/components/dashboard/recent-activity";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Ticket, GraduationCap, Building2 } from "lucide-react";

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
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard-stats'],
  });

  // Stats data
  const stats = [
    {
      title: "Active Hazards",
      value: data?.hazards.open || 12,
      icon: AlertTriangle,
      iconColor: "text-primary",
      iconBgColor: "bg-blue-100",
      trend: {
        value: "8% from last week",
        direction: "down",
        positive: true
      }
    },
    {
      title: "Open Tickets",
      value: 24,
      icon: Ticket,
      iconColor: "text-accent",
      iconBgColor: "bg-orange-100",
      trend: {
        value: "12% from last week",
        direction: "up",
        positive: false
      }
    },
    {
      title: "Completed Training",
      value: `${data?.training.completionRate || 86}%`,
      icon: GraduationCap,
      iconColor: "text-success",
      iconBgColor: "bg-green-100",
      trend: {
        value: "5% from last week",
        direction: "up",
        positive: true
      }
    },
    {
      title: "Active Sites",
      value: data?.sites.activeSites || 8,
      icon: Building2,
      iconColor: "text-secondary",
      iconBgColor: "bg-gray-100",
      trend: {
        value: "No change",
        direction: "unchanged",
        positive: true
      }
    }
  ];

  return (
    <Layout 
      title="Dashboard Overview" 
      description={`Welcome back, ${user?.firstName || 'User'}. Here's what's happening across your sites.`}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hazard Summary */}
        <div className="lg:col-span-2">
          <HazardTable />
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <QuickActions />
          <TrainingSummary />
          <RecentActivity />
        </div>
      </div>
    </Layout>
  );
}
