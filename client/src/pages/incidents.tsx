import { useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  AlertCircle,
  Search,
  Clipboard,
  FileCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { formatUTCToLocal } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  photoUrls?: string[];
}

export default function Incidents() {
  const [location, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ incidents: Incident[]; total: string }>({
    queryKey: ["/api/incidents"],
  });

  const filteredIncidents = statusFilter && data?.incidents
    ? data.incidents.filter((incident) => incident.status === statusFilter)
    : data?.incidents;

  const reportedCount = data?.incidents?.filter(
    (incident) => incident.status === "reported"
  )?.length || 0;

  const investigatingCount = data?.incidents?.filter(
    (incident) => incident.status === "investigating"
  )?.length || 0;

  const resolvedCount = data?.incidents?.filter(
    (incident) => incident.status === "resolved" || incident.status === "closed"
  )?.length || 0;

  function getStatusBadge(status: string) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (status === "reported") {
      variant = "destructive";
    } else if (status === "investigating") {
      variant = "secondary";
    } else if (status === "resolved") {
      variant = "default";
    }
    
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  function getSeverityBadge(severity: string) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (severity === "critical") {
      variant = "destructive";
    } else if (severity === "major") {
      variant = "destructive";
    } else if (severity === "moderate") {
      variant = "secondary";
    } else if (severity === "minor") {
      variant = "default";
    }
    
    return (
      <Badge variant={variant}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-2">Incidents</h1>
      <p className="text-muted-foreground mb-6">Manage and track workplace incidents across all sites</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <div className="text-3xl font-bold">{reportedCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Investigating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-10 w-10 text-amber-500" />
              <div className="text-3xl font-bold">{investigatingCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FileCheck className="h-10 w-10 text-green-500" />
              <div className="text-3xl font-bold">{resolvedCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Button asChild size="lg">
          <Link href="/incidents/new">
            <Plus className="mr-2 h-5 w-5" /> Report Incident
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
            size="lg"
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "reported" ? "default" : "outline"}
            onClick={() => setStatusFilter("reported")}
            size="lg"
          >
            Reported
          </Button>
          <Button 
            variant={statusFilter === "investigating" ? "default" : "outline"}
            onClick={() => setStatusFilter("investigating")}
            size="lg"
          >
            Investigating
          </Button>
          <Button 
            variant={statusFilter === "resolved" ? "default" : "outline"}
            onClick={() => setStatusFilter("resolved")}
            size="lg"
          >
            Resolved
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Incident Records</CardTitle>
          <CardDescription>
            Manage workplace incidents across all your sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-4 text-red-500">
              Failed to load incidents
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">Loading incidents...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents && filteredIncidents.length > 0 ? (
                    filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div>
                            <Link href={`/incidents/${incident.id}`}>
                              <span className="font-medium text-primary hover:underline cursor-pointer">
                                {incident.title}
                              </span>
                            </Link>
                            <div className="text-sm text-muted-foreground">{incident.incidentType}</div>
                          </div>
                        </TableCell>
                        <TableCell>{incident.siteName}</TableCell>
                        <TableCell>{formatUTCToLocal(incident.incidentDate, "PP")}</TableCell>
                        <TableCell>{getStatusBadge(incident.status)}</TableCell>
                        <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                        <TableCell>{incident.reportedByName}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/incidents/${incident.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {filteredIncidents?.length === 0 
                          ? "No incidents found with the selected filter" 
                          : "No incidents reported yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}