import { useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Clock,
  AlertCircle,
  CheckCircle2
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

interface Permit {
  id: number;
  permitType: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  requesterId: number;
  requesterName: string;
  siteId: number;
  siteName: string;
}

export default function Permits() {
  const [location, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ permits: Permit[]; total: string }>({
    queryKey: ["/api/permits"],
  });

  const filteredPermits = statusFilter && data?.permits
    ? data.permits.filter((permit) => permit.status === statusFilter)
    : data?.permits;

  const activePermitsCount = data?.permits?.filter(
    (permit) => permit.status === "approved" && new Date(permit.endDate) > new Date()
  )?.length || 0;

  const expiringPermitsCount = data?.permits?.filter(
    (permit) => {
      const endDate = new Date(permit.endDate);
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);
      return permit.status === "approved" && endDate <= sevenDaysFromNow && endDate > now;
    }
  )?.length || 0;

  const pendingPermitsCount = data?.permits?.filter(
    (permit) => permit.status === "requested"
  )?.length || 0;

  function getStatusBadge(status: string) {
    return (
      <Badge
        variant={
          status === "approved"
            ? "success"
            : status === "requested"
            ? "default"
            : status === "expired" || status === "denied"
            ? "destructive"
            : "outline"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  return (
    <Layout title="Permits" description="Manage and track construction permits across all sites">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div className="text-3xl font-bold">{activePermitsCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-10 w-10 text-amber-500" />
              <div className="text-3xl font-bold">{expiringPermitsCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-10 w-10 text-blue-500" />
              <div className="text-3xl font-bold">{pendingPermitsCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link href="/permits/new">
            <Plus className="mr-2 h-4 w-4" /> New Permit
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
          <Button 
            variant={statusFilter === "requested" ? "default" : "outline"}
            onClick={() => setStatusFilter("requested")}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === "expired" ? "default" : "outline"}
            onClick={() => setStatusFilter("expired")}
          >
            Expired
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Permit Records</CardTitle>
          <CardDescription>
            Manage construction permits across all your sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-4 text-red-500">
              Failed to load permits
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">Loading permits...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permit</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermits && filteredPermits.length > 0 ? (
                    filteredPermits.map((permit) => (
                      <TableRow key={permit.id}>
                        <TableCell>
                          <div>
                            <Link href={`/permits/${permit.id}`}>
                              <span className="font-medium text-primary hover:underline cursor-pointer">
                                {permit.title}
                              </span>
                            </Link>
                            <div className="text-sm text-muted-foreground">{permit.permitType}</div>
                          </div>
                        </TableCell>
                        <TableCell>{permit.siteName}</TableCell>
                        <TableCell>{permit.location}</TableCell>
                        <TableCell>{getStatusBadge(permit.status)}</TableCell>
                        <TableCell>{formatUTCToLocal(permit.startDate, "PP")}</TableCell>
                        <TableCell>{formatUTCToLocal(permit.endDate, "PP")}</TableCell>
                        <TableCell>{permit.requesterName}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/permits/${permit.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">No permits found</TableCell>
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