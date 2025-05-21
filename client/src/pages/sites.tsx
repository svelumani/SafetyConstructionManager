import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Plus, 
  Filter,
  ExternalLink,
  MapPin,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn, formatUTCToLocal } from "@/lib/utils";
import { Link } from "wouter";

interface Site {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  gpsCoordinates: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  isActive: boolean;
}

export default function Sites() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ sites: Site[], total: number }>({
    queryKey: ['/api/sites', { 
      limit: pageSize, 
      offset: pageIndex * pageSize
    }],
  });

  const sites = data?.sites || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const columns = [
    {
      header: "Site Name",
      accessorKey: "name",
      cell: (item: Site) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">
            {[item.city, item.state].filter(Boolean).join(", ")}
          </div>
        </div>
      ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: (item: Site) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{item.address}</span>
          </div>
          <div className="text-sm">
            {`${item.city}, ${item.state} ${item.zipCode}, ${item.country}`}
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contact",
      cell: (item: Site) => (
        <div className="space-y-1">
          {item.contactName && (
            <div className="text-sm font-medium">{item.contactName}</div>
          )}
          {item.contactEmail && (
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{item.contactEmail}</span>
            </div>
          )}
          {item.contactPhone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{item.contactPhone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Project Dates",
      accessorKey: "dates",
      cell: (item: Site) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>
              {item.startDate ? formatUTCToLocal(item.startDate, "PP") : "—"} 
              {" to "} 
              {item.endDate ? formatUTCToLocal(item.endDate, "PP") : "Present"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Site) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.status === "active" ? "bg-green-100 text-success" :
          item.status === "planned" ? "bg-blue-100 text-primary" :
          item.status === "completed" ? "bg-purple-100 text-purple-600" :
          "bg-gray-100 text-gray-600"
        )}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: Site) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/sites/${item.id}`}>
              Manage
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Sites" description="Manage construction sites and locations">
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link href="/sites/new">
            <Plus className="mr-2 h-4 w-4" /> Add Site
          </Link>
        </Button>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Sites</CardTitle>
        </CardHeader>
        <CardContent>          
          <DataTable
            columns={columns}
            data={sites}
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
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No sites found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/sites/new">Add site</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
