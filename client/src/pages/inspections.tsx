import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  Plus, 
  Filter,
  Calendar,
  List
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
import { InspectionCalendarView } from "@/components/inspections/calendar-view";

interface Inspection {
  id: number;
  title: string;
  inspectionType: string;
  description: string;
  scheduledDate: string;
  completedDate: string | null;
  status: string;
  inspectorId: number;
  inspectorName: string;
  siteId: number;
  siteName: string;
}

export default function Inspections() {
  const [activeTab, setActiveTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  
  const { data, isLoading } = useQuery<{ inspections: Inspection[], total: number }>({
    queryKey: ['/api/inspections', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      status: activeTab !== "all" ? activeTab : undefined
    }],
  });

  const inspections = data?.inspections || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "calendar" : "table");
  };

  const columns = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Type",
      accessorKey: "inspectionType",
    },
    {
      header: "Site",
      accessorKey: "siteName",
    },
    {
      header: "Inspector",
      accessorKey: "inspectorName",
    },
    {
      header: "Scheduled Date",
      accessorKey: "scheduledDate",
      cell: (item: Inspection) => formatUTCToLocal(item.scheduledDate, "PPp"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Inspection) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.status === "pending" ? "bg-amber-100 text-warning" :
          item.status === "in_progress" ? "bg-blue-100 text-primary" :
          "bg-green-100 text-success"
        )}>
          {item.status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Badge>
      ),
    },
    {
      header: "Completion Date",
      accessorKey: "completedDate",
      cell: (item: Inspection) => 
        item.completedDate ? formatUTCToLocal(item.completedDate, "PP") : "Not completed",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: Inspection) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inspections/${item.id}`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Inspections" description="Schedule, perform, and track safety inspections across sites">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="mr-2 h-4 w-4" /> New Inspection
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/inspections/templates">
              <ClipboardCheck className="mr-2 h-4 w-4" /> Manage Templates
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={toggleViewMode}
          >
            {viewMode === "calendar" ? (
              <>
                <List className="mr-2 h-4 w-4" /> Table View
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" /> Calendar View
              </>
            )}
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>
      
      {viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>Safety Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DataTable
              columns={columns}
              data={inspections}
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
                  <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground">No inspections found</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/inspections/new">Schedule inspection</Link>
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <InspectionCalendarView inspections={inspections} />
      )}
    </Layout>
  );
}
