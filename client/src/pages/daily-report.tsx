import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mail,
  Printer,
  Loader2,
  BarChart,
  Clipboard,
  HardHat,
  Shield,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function DailyReport() {
  const [dateFilter, setDateFilter] = useState("today");
  const { user } = useAuth();
  
  // Get dashboard statistics
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });
  
  // Get open hazards
  const { data: hazardsData, isLoading: isLoadingHazards } = useQuery({
    queryKey: ["/api/hazards"],
  });
  
  // Get permits
  const { data: permitsData, isLoading: isLoadingPermits } = useQuery({
    queryKey: ["/api/permits"],
  });
  
  // Get inspections
  const { data: inspectionsData, isLoading: isLoadingInspections } = useQuery({
    queryKey: ["/api/inspections"],
  });
  
  // Get training compliance
  const { data: trainingCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/training-courses?limit=50"],
  });
  
  const { data: trainingRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/training-records"],
  });
  
  const isLoading = isLoadingStats || isLoadingHazards || isLoadingPermits || 
                    isLoadingInspections || isLoadingCourses || isLoadingRecords;
  
  const getFilterDate = () => {
    const today = new Date();
    switch (dateFilter) {
      case "yesterday":
        return subDays(today, 1);
      case "week":
        return subDays(today, 7);
      default:
        return today;
    }
  };
  
  const filterDate = getFilterDate();
  
  // Calculate summary data
  const calculateSummary = () => {
    if (isLoading) return null;
    
    // Default values in case data is missing
    const openHazards = hazardsData?.hazards?.filter(h => 
      ["open", "assigned", "in_progress"].includes(h.status)
    ).length || 0;
    
    const todaysInspections = inspectionsData?.inspections?.filter(i => 
      new Date(i.scheduledDate).toDateString() === filterDate.toDateString()
    ).length || 0;
    
    const expiringPermits = permitsData?.permits?.filter(p => 
      p.status === "approved" && new Date(p.expiryDate) <= subDays(new Date(), 7)
    ).length || 0;
    
    let trainingCompliance = 0;
    if (trainingCourses?.courses && trainingRecords?.records) {
      const requiredCourses = trainingCourses.courses.filter(c => c.isRequired).length;
      const completedRequired = trainingRecords.records.filter(r => r.completionDate).length;
      trainingCompliance = requiredCourses > 0 ? 
        Math.round((completedRequired / requiredCourses) * 100) : 100;
    }
    
    // Calculate 24-hour activity
    const last24Hours = subDays(new Date(), 1);
    const newHazards = hazardsData?.hazards?.filter(h => 
      new Date(h.reportedDate) >= last24Hours
    ).length || 0;
    
    const completedInspections = inspectionsData?.inspections?.filter(i => 
      i.status === "completed" && new Date(i.completedDate) >= last24Hours
    ).length || 0;
    
    const incidents = dashboardStats?.incidents?.reported || 0;
    
    const permitsProcessed = permitsData?.permits?.filter(p => 
      new Date(p.issueDate) >= last24Hours || 
      new Date(p.closedDate) >= last24Hours
    ).length || 0;
    
    // High priority action items
    const actionItems = [
      ...((hazardsData?.hazards || [])
        .filter(h => h.priority === "high" && ["open", "assigned"].includes(h.status))
        .slice(0, 2)
        .map(h => ({
          type: "hazard",
          id: h.id,
          description: h.description?.substring(0, 50) + "..." || "High priority hazard",
          assignedTo: h.assignedToName || "Unassigned",
          dueDate: h.dueDate || null
        })) || []),
      ...((inspectionsData?.inspections || [])
        .filter(i => new Date(i.scheduledDate).toDateString() === new Date().toDateString())
        .slice(0, 2)
        .map(i => ({
          type: "inspection",
          id: i.id,
          description: i.title || "Scheduled inspection",
          assignedTo: i.assignedToName || "Unassigned",
          dueDate: i.scheduledDate || null
        })) || []),
      ...((permitsData?.permits || [])
        .filter(p => p.status === "approved" && 
          new Date(p.expiryDate) <= subDays(new Date(), 3))
        .slice(0, 1)
        .map(p => ({
          type: "permit",
          id: p.id,
          description: `${p.type} permit expiring soon`,
          assignedTo: p.requestedByName || "Unknown",
          dueDate: p.expiryDate || null
        })) || [])
    ].slice(0, 5);
    
    return {
      todaySummary: {
        openHazards,
        inspectionsDue: todaysInspections,
        expiringPermits,
        trainingCompliance
      },
      activity24h: {
        newHazards,
        completedInspections,
        incidents,
        permitsProcessed
      },
      actionItems
    };
  };
  
  const summary = calculateSummary();
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleEmailReport = () => {
    // In a real implementation, this would trigger an API call
    // to send the report via email to stakeholders
    alert("Email functionality would be implemented here");
  };
  
  const getStatusColor = (type: string) => {
    switch (type) {
      case "hazard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "inspection": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "permit": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Daily Safety Report</h1>
              <p className="text-muted-foreground">
                Overview of critical safety information for {format(filterDate, "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="today" value="today">Today</SelectItem>
                  <SelectItem key="yesterday" value="yesterday">Yesterday</SelectItem>
                  <SelectItem key="week" value="week">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleEmailReport}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
        
        {/* Today's Safety Pulse */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Today's Safety Pulse
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Open Hazards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary?.todaySummary.openHazards}</div>
                <p className="text-sm text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-blue-500" />
                  Inspections Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary?.todaySummary.inspectionsDue}</div>
                <p className="text-sm text-muted-foreground">
                  Scheduled for today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-amber-500" />
                  Expiring Permits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary?.todaySummary.expiringPermits}</div>
                <p className="text-sm text-muted-foreground">
                  Expiring this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <HardHat className="h-5 w-5 mr-2 text-green-500" />
                  Training Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{summary?.todaySummary.trainingCompliance}%</div>
                  <Progress 
                    value={summary?.todaySummary.trainingCompliance} 
                    className="h-2 w-[60px]" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Required training completion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 24-Hour Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            24-Hour Activity
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">New Hazards Reported</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activity24h.newHazards}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inspections Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activity24h.completedInspections}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activity24h.incidents}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Permits Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activity24h.permitsProcessed}</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Action Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clipboard className="h-5 w-5 mr-2 text-primary" />
            Priority Action Items
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Due By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.actionItems && summary.actionItems.length > 0 ? (
                  summary.actionItems.map((item, index) => (
                    <TableRow key={`${item.type}-${item.id}-${index}`}>
                      <TableCell>
                        <Badge className={getStatusColor(item.type)}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell>
                        {item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No priority action items for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
        
        <div className="flex justify-end gap-2 print:hidden">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </Layout>
  );
}