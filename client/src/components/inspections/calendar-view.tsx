import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";
import { cn, formatUTCToLocal } from "@/lib/utils";
import { Eye, ClipboardCheck } from "lucide-react";

export interface Inspection {
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

interface InspectionEventProps {
  inspections: Inspection[];
}

export function InspectionCalendarView({ inspections }: InspectionEventProps) {
  // Set default date to May 2025 to match our inspection data
  const [date, setDate] = useState<Date | undefined>(new Date('2025-05-22'));
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // Function to get inspection dates for highlighting in calendar
  const getInspectionsByDate = () => {
    const inspectionDates: { [key: string]: Inspection[] } = {};
    
    // Process each inspection
    inspections.forEach(inspection => {
      if (inspection) {
        try {
          // Get the scheduled date - it might be in camelCase or snake_case
          const scheduledDate = inspection.scheduledDate || inspection.scheduled_date;
          
          if (!scheduledDate) {
            console.warn("Missing scheduled date for inspection:", inspection.id);
            return;
          }
          
          // Extract just the date portion (YYYY-MM-DD)
          let dateOnly;
          if (typeof scheduledDate === 'string') {
            if (scheduledDate.includes('T')) {
              dateOnly = scheduledDate.split('T')[0]; // ISO format with time
            } else if (scheduledDate.includes(' ')) {
              dateOnly = scheduledDate.split(' ')[0]; // Format with space before time
            } else {
              dateOnly = scheduledDate; // Already just date
            }
          } else {
            // If it's not a string (maybe a Date object), convert to ISO string first
            dateOnly = new Date(scheduledDate).toISOString().split('T')[0];
          }
          
          // Add this inspection to the array for this date
          if (!inspectionDates[dateOnly]) {
            inspectionDates[dateOnly] = [];
          }
          inspectionDates[dateOnly].push(inspection);
        } catch (error) {
          console.error("Error processing inspection date:", error);
        }
      }
    });
    
    return inspectionDates;
  };

  const inspectionDates = getInspectionsByDate();

  // Custom day renderer to show inspection indicators
  const renderDay = (props: { day: Date }) => {
    // Make sure we have a valid Date object
    if (!props.day || !(props.day instanceof Date)) {
      return <div className="relative w-full h-full flex items-center justify-center">{props.day ? String(props.day.getDate()) : ''}</div>;
    }
    
    const day = props.day;
    const dateString = day.toISOString().split('T')[0];
    
    // Get inspections for this date
    const hasInspections = inspectionDates[dateString]?.length > 0;
    const count = inspectionDates[dateString]?.length || 0;
    
    // Debug info
    if (hasInspections) {
      console.log(`Day ${dateString} has ${count} inspections`);
    }
    
    // Calculate today's date string for comparison
    return (
      <div 
        className={cn(
          "relative w-full h-full flex flex-col items-center justify-center",
          hasInspections ? "bg-gray-50" : ""
        )}
        onClick={() => hasInspections && openInspectionsForDate(dateString)}
      >
        {/* Day number */}
        <span className={hasInspections ? "font-semibold" : ""}>{day.getDate()}</span>
        
        {/* Inspection indicator */}
        {hasInspections && (
          <div className="mt-1 flex items-center space-x-0.5">
            <div 
              className={cn(
                "h-3 w-3 rounded-full",
                count > 2 ? "bg-red-500" :
                count > 1 ? "bg-amber-500" :
                "bg-blue-500"
              )}
            />
            <span className="text-xs text-gray-600 ml-1">{count}</span>
          </div>
        )}
      </div>
    );
  };

  // Function to handle click on a date with inspections
  const openInspectionsForDate = (dateString: string) => {
    if (inspectionDates[dateString] && inspectionDates[dateString].length === 1) {
      setSelectedInspection(inspectionDates[dateString][0]);
    } else if (inspectionDates[dateString] && inspectionDates[dateString].length > 1) {
      // Show multiple inspections dialog
      setMultipleInspections(inspectionDates[dateString]);
      setShowMultipleDialog(true);
    }
  };

  // State for multiple inspections dialog
  const [showMultipleDialog, setShowMultipleDialog] = useState(false);
  const [multipleInspections, setMultipleInspections] = useState<Inspection[]>([]);

  // Function to close inspection details dialog
  const closeInspectionDetails = () => {
    setSelectedInspection(null);
  };

  // Function to close multiple inspections dialog
  const closeMultipleInspections = () => {
    setShowMultipleDialog(false);
    setMultipleInspections([]);
  };

  // Function to get status badge styling
  const getStatusBadgeStyle = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    return cn(
      "px-2 py-1 text-xs rounded-full font-medium",
      status === "pending" ? "bg-amber-100 text-amber-800" :
      status === "in_progress" ? "bg-blue-100 text-blue-800" :
      status === "scheduled" ? "bg-purple-100 text-purple-800" :
      status === "completed" ? "bg-green-100 text-green-800" :
      "bg-gray-100 text-gray-800"
    );
  };

  // Function to format status text
  const formatStatus = (status: string | undefined) => {
    if (!status) return "Unknown";
    
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Calendar</CardTitle>
        <CardDescription>View scheduled inspections for each day</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          components={{
            Day: renderDay,
          }}
          disabled={{ before: new Date(new Date().setDate(new Date().getDate() - 180)) }}
        />

        {/* Inspection details dialog */}
        <Dialog open={selectedInspection !== null} onOpenChange={closeInspectionDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle id="dialog-title">{selectedInspection?.title || "Inspection Details"}</DialogTitle>
              <DialogDescription id="dialog-description">
                {selectedInspection && selectedInspection.scheduledDate ? 
                  `Scheduled for ${formatUTCToLocal(selectedInspection.scheduledDate, "PPpp")}` : 
                  "Inspection schedule details"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={selectedInspection ? getStatusBadgeStyle(selectedInspection.status) : ""}>
                    {selectedInspection ? formatStatus(selectedInspection.status) : ""}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span>{selectedInspection?.inspectionType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Site:</span>
                  <span>{selectedInspection?.siteName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inspector:</span>
                  <span>{selectedInspection?.inspectorName}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm">{selectedInspection?.description || "No description provided."}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={closeInspectionDetails}>
                Close
              </Button>
              <Button asChild>
                <Link href={`/inspections/${selectedInspection?.id}`}>
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Multiple inspections dialog */}
        <Dialog open={showMultipleDialog} onOpenChange={closeMultipleInspections}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle id="dialog-multi-title">
                {multipleInspections[0] && multipleInspections[0].scheduledDate 
                  ? `Inspections for ${formatUTCToLocal(multipleInspections[0].scheduledDate, "PP")}` 
                  : "Scheduled Inspections"}
              </DialogTitle>
              <DialogDescription id="dialog-multi-description">
                {multipleInspections.length} inspections scheduled for this date
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {multipleInspections.map((inspection) => (
                <Card key={inspection.id} className="mb-4">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{inspection.title}</CardTitle>
                      <Badge className={getStatusBadgeStyle(inspection.status)}>
                        {formatStatus(inspection.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{formatUTCToLocal(inspection.scheduledDate, "p")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{inspection.inspectionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Site:</span>
                        <span>{inspection.siteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inspector:</span>
                        <span>{inspection.inspectorName}</span>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <Button size="sm" asChild>
                          <Link href={`/inspections/${inspection.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeMultipleInspections}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {inspections.length === 0 && (
          <div className="py-8 text-center mt-4">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="text-muted-foreground">No inspections scheduled</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/inspections/new">Schedule inspection</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}