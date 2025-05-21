import { 
  AlertTriangle, 
  ChevronRight,
  Cone,
  Droplet,
  Zap
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { cn, formatUTCToLocal, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface HazardReport {
  id: number;
  title: string;
  location: string;
  severity: string;
  reportedBy: string;
  status: string;
  hazardType: string;
  createdAt: string;
}

export default function HazardTable() {
  const { data, isLoading } = useQuery<{ hazards: HazardReport[], total: number }>({
    queryKey: ['/api/hazards', { limit: 4 }],
  });

  const hazards = data?.hazards || [];

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
      header: "Location",
      accessorKey: "location",
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: (item: HazardReport) => (
        <Badge variant="outline" className={cn(
          "px-2 py-1 text-xs rounded-full font-medium",
          item.severity === "high" ? "bg-red-100 text-danger" :
          item.severity === "medium" ? "bg-amber-100 text-warning" :
          "bg-blue-100 text-primary"
        )}>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Reported By",
      accessorKey: "reportedBy",
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
      header: "Actions",
      accessorKey: "actions",
      cell: (item: HazardReport) => (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/hazards/${item.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Hazard Reports</h2>
          <Button variant="link" asChild>
            <Link to="/hazards">View All</Link>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={hazards}
          isLoading={isLoading}
          emptyState={
            <div className="py-8 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground">No hazards reported yet</p>
            </div>
          }
        />
      </div>
      
      {hazards.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">Showing {hazards.length} of {data?.total || 0} hazards</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3 py-1 text-sm"
              disabled
            >
              Previous
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="h-8 px-3 py-1 text-sm"
              asChild
            >
              <Link to="/hazards">Next</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
