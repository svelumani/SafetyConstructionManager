import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatUTCToLocal } from "@/lib/utils";
import { Inspection } from "@shared/schema";

export default function Inspections() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");

  // Fetch inspections
  const { data: inspectionsData = { inspections: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  // Fetch sites for filtering
  const { data: sites = [] } = useQuery({
    queryKey: ['/api/sites'],
  });

  // Apply filters
  const filteredInspections = inspectionsData.inspections
    .filter((inspection: Inspection) => {
      // Apply search filter
      const matchesSearch = 
        inspection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inspection.site?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inspection.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = statusFilter === "all" || inspection.status === statusFilter;
      
      // Apply site filter
      const matchesSite = siteFilter === "all" || (inspection.siteId?.toString() === siteFilter);
      
      return matchesSearch && matchesStatus && matchesSite;
    });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 font-medium">
            <Calendar className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 font-medium">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 font-medium">
            <XCircle className="mr-1 h-3 w-3" />
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 font-medium">
            <AlertCircle className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Safety Inspections"
        description="Schedule, conduct, and track safety inspections across your sites"
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inspections..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="w-1/2 sm:w-auto">
            <Link href="/inspections/templates">
              Templates
            </Link>
          </Button>
          <Button asChild className="w-1/2 sm:w-auto">
            <Link href="/inspections/new">
              <Plus className="mr-2 h-4 w-4" /> New Inspection
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="w-[250px]">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredInspections.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection: Inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{inspection.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {inspection.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{inspection.site?.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={inspection.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatUTCToLocal(inspection.scheduledDate, "MMM d, yyyy")}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(inspection.scheduledDate), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {inspection.assignedTo ? 
                      `${inspection.assignedTo.firstName} ${inspection.assignedTo.lastName}` : 
                      <span className="text-muted-foreground italic">Unassigned</span>
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/inspections/${inspection.id}`)}
                    >
                      {inspection.status === "scheduled" ? "Start" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No inspections found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery || statusFilter !== "all" || siteFilter !== "all" ? 
              "No inspections match your current filters. Try changing your search criteria." : 
              "Get started by scheduling your first safety inspection for a site."}
          </p>
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="mr-2 h-4 w-4" /> Schedule Inspection
            </Link>
          </Button>
        </div>
      )}
    </Layout>
  );
}