import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Cross, 
  Plus, 
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { cn, formatUTCToLocal } from "@/lib/utils";
import { Link } from "wouter";

interface IncidentReport {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  incidentType: string;
  severity: string;
  injuryOccurred: boolean;
  reportedById: number;
  reportedBy: string;
  siteId: number;
  siteName: string;
  createdAt: string;
}

export default function Incidents() {
  const [activeTab, setActiveTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ incidents: IncidentReport[], total: number }>({
    queryKey: ['/api/incidents', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      severity: activeTab !== "all" ? activeTab : undefined
    }],
  });

  const incidents = data?.incidents || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const columns = [
    {
      header: "Incident Type",
      accessorKey: "incidentType",
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Location",
      accessorKey: "location",
    },
    {
      header: "Site",
      accessorKey: "siteName",
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: (item: IncidentReport) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.severity === "critical" ? "bg-red-100 text-danger" :
          item.severity === "major" ? "bg-red-100 text-danger" :
          item.severity === "moderate" ? "bg-amber-100 text-warning" :
          "bg-blue-100 text-primary"
        )}>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Injury",
      accessorKey: "injuryOccurred",
      cell: (item: IncidentReport) => (
        <Badge variant={item.injuryOccurred ? "destructive" : "outline"}>
          {item.injuryOccurred ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Incident Date",
      accessorKey: "incidentDate",
      cell: (item: IncidentReport) => formatUTCToLocal(item.incidentDate, "PPp"),
    },
    {
      header: "Reported By",
      accessorKey: "reportedBy",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: IncidentReport) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/incidents/${item.id}`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Incident Reports" description="Report and track safety incidents across your construction sites">
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="mr-2 h-4 w-4" /> Report New Incident
          </Link>
        </Button>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="minor">Minor</TabsTrigger>
              <TabsTrigger value="moderate">Moderate</TabsTrigger>
              <TabsTrigger value="major">Major</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DataTable
            columns={columns}
            data={incidents}
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
                <Cross className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No incidents found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/incidents/new">Report incident</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
