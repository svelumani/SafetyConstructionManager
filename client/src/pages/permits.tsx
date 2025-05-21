import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  SquareStack, 
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

interface PermitRequest {
  id: number;
  title: string;
  permitType: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  requesterId: number;
  requesterName: string;
  approverId: number | null;
  approverName: string | null;
  siteId: number;
  siteName: string;
  createdAt: string;
}

export default function Permits() {
  const [activeTab, setActiveTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ permits: PermitRequest[], total: number }>({
    queryKey: ['/api/permits', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      status: activeTab !== "all" ? activeTab : undefined
    }],
  });

  const permits = data?.permits || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const columns = [
    {
      header: "Permit Type",
      accessorKey: "permitType",
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
      header: "Status",
      accessorKey: "status",
      cell: (item: PermitRequest) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.status === "requested" ? "bg-amber-100 text-warning" :
          item.status === "approved" ? "bg-green-100 text-success" :
          item.status === "denied" ? "bg-red-100 text-danger" :
          "bg-gray-100 text-gray-600"
        )}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Request Date",
      accessorKey: "createdAt",
      cell: (item: PermitRequest) => formatUTCToLocal(item.createdAt, "PP"),
    },
    {
      header: "Valid Period",
      accessorKey: "period",
      cell: (item: PermitRequest) => (
        <span>
          {formatUTCToLocal(item.startDate, "PP")} - {formatUTCToLocal(item.endDate, "PP")}
        </span>
      ),
    },
    {
      header: "Requester",
      accessorKey: "requesterName",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: PermitRequest) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/permits/${item.id}`}>
            View Details
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Permits & Tickets" description="Manage work permits and safety tickets for your construction sites">
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link href="/permits/new">
            <Plus className="mr-2 h-4 w-4" /> New Permit Request
          </Link>
        </Button>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Work Permits</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="requested">Requested</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="denied">Denied</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DataTable
            columns={columns}
            data={permits}
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
                <SquareStack className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No permits found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/permits/new">Request permit</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
