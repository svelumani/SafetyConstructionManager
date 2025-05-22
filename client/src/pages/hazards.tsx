import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Plus, 
  Filter,
  Zap,
  Cone,
  Droplet,
  BarChart3
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
import { cn, formatUTCToLocal, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";

interface HazardReport {
  id: number;
  title: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  hazardType: string;
  reportedById: number;
  reportedBy: string;
  createdAt: string;
  siteId: number;
  siteName: string;
  photoUrls: string[];
}

export default function Hazards() {
  const [activeTab, setActiveTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ hazards: HazardReport[], total: number }>({
    queryKey: ['/api/hazards', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      status: activeTab !== "all" ? activeTab : undefined
    }],
  });

  const hazards = data?.hazards || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  // Function to get hazard type icon
  const getHazardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'electrical':
        return <Zap className="text-warning mr-2" />;
      case 'trip hazard':
        return <Cone className="text-accent mr-2" />;
      case 'water leak':
        return <Droplet className="text-primary mr-2" />;
      default:
        return <AlertTriangle className="text-danger mr-2" />;
    }
  };

  const columns = [
    {
      header: "Hazard Type",
      accessorKey: "hazardType",
      cell: (item: HazardReport) => (
        <div className="flex items-center">
          {getHazardIcon(item.hazardType)}
          <span>{item.hazardType}</span>
        </div>
      ),
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
      cell: (item: HazardReport) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.severity === "high" || item.severity === "critical" ? "bg-red-100 text-danger" :
          item.severity === "medium" ? "bg-amber-100 text-warning" :
          "bg-blue-100 text-primary"
        )}>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: HazardReport) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          getStatusColor(item.status)
        )}>
          {item.status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Badge>
      ),
    },
    {
      header: "Reported By",
      accessorKey: "reportedBy",
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (item: HazardReport) => formatUTCToLocal(item.createdAt, "PP"),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: HazardReport) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/hazards/${item.id}`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Hazard Reporting" description="Track and manage hazards across all construction sites">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/hazards/new">
              <Plus className="mr-2 h-4 w-4" /> Report New Hazard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/hazards/analytics">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics Dashboard
            </Link>
          </Button>
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Hazard Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DataTable
            columns={columns}
            data={hazards}
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
                <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No hazards found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/hazards/new">Report a hazard</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
