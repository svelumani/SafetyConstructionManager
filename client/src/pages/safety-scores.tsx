import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Trophy,
  Filter,
  Users,
  Building,
  BarChart,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface SafetyScore {
  id: number;
  name: string;
  role: string;
  siteId?: number;
  siteName?: string;
  score: number;
  rankChange: number;
  hazardsReported: number;
  incidentsReported: number;
  trainingCompleted: number;
  inspectionsCompleted: number;
}

export default function SafetyScores() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"individuals" | "sites" | "subcontractors">("individuals");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // This is a placeholder since the API endpoint doesn't exist yet
  const { data, isLoading } = useQuery<{ scores: SafetyScore[], total: number }>({
    queryKey: ['/api/safety-scores', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      type: activeTab
    }],
    enabled: false, // Disable real API request until endpoint exists
  });

  // Sample data for demonstration
  const sampleScores: SafetyScore[] = [
    {
      id: 1,
      name: "John Smith",
      role: "Supervisor",
      siteId: 1,
      siteName: "Downtown Tower",
      score: 95,
      rankChange: 2,
      hazardsReported: 12,
      incidentsReported: 2,
      trainingCompleted: 15,
      inspectionsCompleted: 8
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Safety Officer",
      siteId: 2,
      siteName: "Harbor Project",
      score: 98,
      rankChange: 0,
      hazardsReported: 18,
      incidentsReported: 3,
      trainingCompleted: 20,
      inspectionsCompleted: 14
    },
    {
      id: 3,
      name: "Mike Williams",
      role: "Subcontractor",
      siteId: 1,
      siteName: "Downtown Tower",
      score: 87,
      rankChange: -1,
      hazardsReported: 8,
      incidentsReported: 1,
      trainingCompleted: 12,
      inspectionsCompleted: 4
    },
    {
      id: 4,
      name: "Robert Chen",
      role: "Employee",
      siteId: 3,
      siteName: "Residential Complex",
      score: 92,
      rankChange: 3,
      hazardsReported: 10,
      incidentsReported: 0,
      trainingCompleted: 16,
      inspectionsCompleted: 6
    },
    {
      id: 5,
      name: "Lisa Garcia",
      role: "Supervisor",
      siteId: 2,
      siteName: "Harbor Project",
      score: 90,
      rankChange: 1,
      hazardsReported: 9,
      incidentsReported: 1,
      trainingCompleted: 14,
      inspectionsCompleted: 7
    }
  ];

  const sampleSites = [
    {
      id: 1,
      name: "Downtown Tower",
      score: 94,
      rankChange: 1,
      hazardsReported: 45,
      incidentsReported: 3,
      trainingCompleted: 92,
      inspectionsCompleted: 18
    },
    {
      id: 2,
      name: "Harbor Project",
      score: 96,
      rankChange: 2,
      hazardsReported: 38,
      incidentsReported: 2,
      trainingCompleted: 95,
      inspectionsCompleted: 24
    },
    {
      id: 3,
      name: "Residential Complex",
      score: 89,
      rankChange: -1,
      hazardsReported: 30,
      incidentsReported: 5,
      trainingCompleted: 87,
      inspectionsCompleted: 15
    }
  ];

  const sampleSubcontractors = [
    {
      id: 1,
      name: "ABC Electrical",
      score: 92,
      rankChange: 0,
      hazardsReported: 22,
      incidentsReported: 1,
      trainingCompleted: 90,
      inspectionsCompleted: 12
    },
    {
      id: 2,
      name: "Smith Plumbing",
      score: 88,
      rankChange: 1,
      hazardsReported: 15,
      incidentsReported: 2,
      trainingCompleted: 85,
      inspectionsCompleted: 8
    },
    {
      id: 3,
      name: "Johnson Concrete",
      score: 95,
      rankChange: 2,
      hazardsReported: 18,
      incidentsReported: 0,
      trainingCompleted: 98,
      inspectionsCompleted: 14
    }
  ];

  // Choose the appropriate sample data based on the active tab
  const scores = activeTab === "individuals" 
    ? sampleScores 
    : activeTab === "sites" 
      ? sampleSites 
      : sampleSubcontractors;

  const totalPages = 1; // For the sample data

  // Columns for individuals
  const individualColumns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Site",
      accessorKey: "siteName",
    },
    {
      header: "Safety Score",
      accessorKey: "score",
      cell: (item: SafetyScore) => (
        <div className="flex items-center">
          <div className="font-semibold mr-2">{item.score}</div>
          <Progress value={item.score} className="w-24 h-2" />
          <div className="ml-2 flex items-center">
            {item.rankChange > 0 ? (
              <ChevronUp className="text-success h-4 w-4" />
            ) : item.rankChange < 0 ? (
              <ChevronDown className="text-danger h-4 w-4" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
            <span className={item.rankChange > 0 ? "text-success" : item.rankChange < 0 ? "text-danger" : ""}>
              {item.rankChange !== 0 ? Math.abs(item.rankChange) : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Hazards Reported",
      accessorKey: "hazardsReported",
    },
    {
      header: "Training Completed",
      accessorKey: "trainingCompleted",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: SafetyScore) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/users/${item.id}/safety-stats`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  // Columns for sites
  const siteColumns = [
    {
      header: "Site",
      accessorKey: "name",
    },
    {
      header: "Safety Score",
      accessorKey: "score",
      cell: (item: SafetyScore) => (
        <div className="flex items-center">
          <div className="font-semibold mr-2">{item.score}</div>
          <Progress value={item.score} className="w-24 h-2" />
          <div className="ml-2 flex items-center">
            {item.rankChange > 0 ? (
              <ChevronUp className="text-success h-4 w-4" />
            ) : item.rankChange < 0 ? (
              <ChevronDown className="text-danger h-4 w-4" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
            <span className={item.rankChange > 0 ? "text-success" : item.rankChange < 0 ? "text-danger" : ""}>
              {item.rankChange !== 0 ? Math.abs(item.rankChange) : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Hazards Reported",
      accessorKey: "hazardsReported",
    },
    {
      header: "Incidents Reported",
      accessorKey: "incidentsReported",
    },
    {
      header: "Training Completion",
      accessorKey: "trainingCompleted",
      cell: (item: SafetyScore) => `${item.trainingCompleted}%`,
    },
    {
      header: "Inspections",
      accessorKey: "inspectionsCompleted",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: SafetyScore) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/sites/${item.id}/safety-stats`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  // Choose the appropriate columns based on the active tab
  const columns = activeTab === "individuals" 
    ? individualColumns 
    : activeTab === "sites" 
      ? siteColumns 
      : [
          { header: "Subcontractor", accessorKey: "name" },
          ...siteColumns.slice(1)
        ];

  return (
    <Layout title="Safety Scores" description="Track and compare safety performance across your organization">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" className="mr-2">
            <BarChart className="mr-2 h-4 w-4" /> View Reports
          </Button>
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Safety Performance Overview</CardTitle>
          <CardDescription>Summary of safety scores and rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-4">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Organization Score</div>
                    <div className="text-3xl font-bold">92%</div>
                    <div className="text-xs text-success flex items-center">
                      <ChevronUp className="h-3 w-3 mr-1" /> Up 3% from last month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-success flex items-center justify-center mr-4">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Top Performer</div>
                    <div className="text-xl font-bold">Sarah Johnson</div>
                    <div className="text-sm">98% Safety Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-warning flex items-center justify-center mr-4">
                    <Building className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Top Site</div>
                    <div className="text-xl font-bold">Harbor Project</div>
                    <div className="text-sm">96% Safety Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Safety Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="individuals" value={activeTab} onValueChange={setActiveTab as any} className="mb-6">
            <TabsList>
              <TabsTrigger value="individuals">Individuals</TabsTrigger>
              <TabsTrigger value="sites">Sites</TabsTrigger>
              <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DataTable
            columns={columns}
            data={scores}
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
                <Trophy className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No safety score data available</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
