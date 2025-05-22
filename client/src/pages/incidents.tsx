import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  FileText,
  PlusCircle,
  Search,
  ClipboardList,
  CircleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatUTCToLocal } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Interface for incident data from API
interface Incident {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  incidentType: string;
  severity: string;
  status: string;
  reportedById: number;
  reportedByName: string;
  siteId: number;
  siteName: string;
  injuryOccurred: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Incidents() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  
  // Check which route we're on
  const [matchesNew] = useRoute("/incidents/new");
  const [matchesDetail, params] = useRoute("/incidents/:id");
  
  // For sub-pages
  if (matchesNew) {
    const NewIncident = React.lazy(() => import("./incidents/new"));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <NewIncident />
      </React.Suspense>
    );
  }
  
  if (matchesDetail && params?.id) {
    const IncidentDetail = React.lazy(() => import("./incidents/[id]"));
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <IncidentDetail />
      </React.Suspense>
    );
  }

  // Fetch incidents data
  const { data, isLoading, error } = useQuery<{ incidents: Incident[] }>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents based on search query and filters
  const filteredIncidents = data?.incidents?.filter((incident) => {
    // Status filter
    if (statusFilter && incident.status !== statusFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter && incident.severity !== severityFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.incidentType.toLowerCase().includes(query) ||
        incident.siteName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate stats for dashboard cards
  const calculateStats = () => {
    if (!data?.incidents) return { total: 0, reported: 0, investigating: 0, resolved: 0, closed: 0, withInjuries: 0 };

    const incidents = data.incidents;
    
    return {
      total: incidents.length,
      reported: incidents.filter(i => i.status === "reported").length,
      investigating: incidents.filter(i => i.status === "investigating").length,
      resolved: incidents.filter(i => i.status === "resolved").length,
      closed: incidents.filter(i => i.status === "closed").length,
      withInjuries: incidents.filter(i => i.injuryOccurred).length,
    };
  };

  const stats = calculateStats();

  // Get severity badge with appropriate styling
  const getSeverityBadge = (severity: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    if (severity === "critical") {
      variant = "destructive";
    } else if (severity === "major") {
      variant = "destructive";
    } else if (severity === "moderate") {
      variant = "default";
    }
    
    return (
      <Badge variant={variant} className="text-xs px-2 py-0.5">
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reported":
        return <Badge variant="destructive" className="text-xs">Reported</Badge>;
      case "investigating":
        return <Badge variant="default" className="text-xs bg-amber-500">Investigating</Badge>;
      case "resolved":
        return <Badge variant="default" className="text-xs bg-blue-500">Resolved</Badge>;
      case "closed":
        return <Badge variant="default" className="text-xs bg-green-500">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  // Get icon for dashboard cards
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "investigating":
        return <Search className="h-6 w-6 text-amber-500" />;
      case "resolved":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case "closed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "injury":
        return <CircleAlert className="h-6 w-6 text-red-500" />;
      default:
        return <ClipboardList className="h-6 w-6" />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Incident Management</h1>
          <p className="text-muted-foreground">
            Track, investigate, and resolve workplace incidents
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => navigate("/incidents/new")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Report New Incident
        </Button>
      </div>

      {/* Stats dashboard */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-2">
              <ClipboardList className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground text-center">Total Incidents</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-2">
              {getStatusIcon("reported")}
            </div>
            <div className="text-2xl font-bold">{stats.reported}</div>
            <p className="text-sm text-muted-foreground text-center">Reported</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-2">
              {getStatusIcon("investigating")}
            </div>
            <div className="text-2xl font-bold">{stats.investigating}</div>
            <p className="text-sm text-muted-foreground text-center">Investigating</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-2">
              {getStatusIcon("resolved")}
            </div>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground text-center">Resolved</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-2">
              {getStatusIcon("closed")}
            </div>
            <div className="text-2xl font-bold">{stats.closed}</div>
            <p className="text-sm text-muted-foreground text-center">Closed</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-2">
              {getStatusIcon("injury")}
            </div>
            <div className="text-2xl font-bold">{stats.withInjuries}</div>
            <p className="text-sm text-muted-foreground text-center">With Injuries</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "reported" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("reported")}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Reported
              </Button>
              <Button
                variant={statusFilter === "investigating" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("investigating")}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Investigating
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("resolved")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Resolved
              </Button>
              <Button
                variant={statusFilter === "closed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("closed")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Closed
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge 
              variant={severityFilter === null ? "default" : "outline"}
              className="cursor-pointer text-base px-3 py-1"
              onClick={() => setSeverityFilter(null)}
            >
              All Severities
            </Badge>
            <Badge 
              variant={severityFilter === "critical" ? "destructive" : "outline"}
              className="cursor-pointer text-base px-3 py-1"
              onClick={() => setSeverityFilter("critical")}
            >
              Critical
            </Badge>
            <Badge 
              variant={severityFilter === "major" ? "destructive" : "outline"}
              className="cursor-pointer text-base px-3 py-1"
              onClick={() => setSeverityFilter("major")}
            >
              Major
            </Badge>
            <Badge 
              variant={severityFilter === "moderate" ? "default" : "outline"}
              className="cursor-pointer text-base px-3 py-1"
              onClick={() => setSeverityFilter("moderate")}
            >
              Moderate
            </Badge>
            <Badge 
              variant={severityFilter === "minor" ? "secondary" : "outline"}
              className="cursor-pointer text-base px-3 py-1"
              onClick={() => setSeverityFilter("minor")}
            >
              Minor
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Incidents table */}
      <Card>
        <CardHeader>
          <CardTitle>All Incidents</CardTitle>
          <CardDescription>
            {filteredIncidents ? `${filteredIncidents.length} incident${filteredIncidents.length !== 1 ? 's' : ''} found` : 'Loading incidents...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading incidents...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading incidents. Please try again.
            </div>
          ) : filteredIncidents && filteredIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/incidents/${incident.id}`)}>
                    <TableCell className="font-medium">{incident.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {incident.description.substring(0, 60)}
                        {incident.description.length > 60 ? "..." : ""}
                      </div>
                    </TableCell>
                    <TableCell>{formatUTCToLocal(incident.incidentDate, "PP")}</TableCell>
                    <TableCell>{incident.incidentType}</TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell>{incident.siteName}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/incidents/${incident.id}`);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No incidents found. Try adjusting your filters or search query.
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}