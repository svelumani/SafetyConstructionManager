import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Calendar, CheckCircle } from "lucide-react";

// Define types
interface Site {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface ReportHistory {
  id: number;
  siteName: string;
  startDate: string;
  endDate: string;
  generatedBy: string;
  generatedOn: string;
  reportName: string;
  downloadUrl: string;
  status: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedSite, setSelectedSite] = useState<number | null>(null);
  const [includeHazards, setIncludeHazards] = useState(true);
  const [includeIncidents, setIncludeIncidents] = useState(true);
  const [includeInspections, setIncludeInspections] = useState(true);
  const [includePermits, setIncludePermits] = useState(true);
  const [includeTraining, setIncludeTraining] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  // Fetch sites
  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/sites"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/sites");
      const data = await res.json();
      return data.sites;
    },
  });

  // Fetch report history
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports/history"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/reports/history");
      const data = await res.json();
      return data.reports || [];
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/reports/generate", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your report has been successfully generated.",
      });
      // Invalidate reports query to refresh the history
      queryClient.invalidateQueries({ queryKey: ["/api/reports/history"] });
      // Switch to history tab
      setActiveTab("history");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!selectedSite) {
      toast({
        title: "Site selection required",
        description: "Please select a site to generate a report.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Date range required",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const reportData = {
      siteId: selectedSite,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      includeHazards,
      includeIncidents,
      includeInspections,
      includePermits,
      includeTraining,
    };

    generateReportMutation.mutate(reportData);
  };

  const downloadReport = (reportId: number) => {
    // Open in a new tab
    window.open(`/api/reports/download/${reportId}`, "_blank");
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Client Reports</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Site Report</CardTitle>
                <CardDescription>
                  Create a comprehensive Word document report that can be edited offline before sending to clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Select 
                      value={selectedSite?.toString() || ""} 
                      onValueChange={(value) => setSelectedSite(Number(value))}
                    >
                      <SelectTrigger id="site">
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sitesLoading ? (
                          <SelectItem value="loading" disabled>Loading sites...</SelectItem>
                        ) : (
                          sitesData && sitesData.map((site: Site) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <DatePicker 
                        date={startDate} 
                        onSelect={setStartDate} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <DatePicker 
                        date={endDate} 
                        onSelect={setEndDate}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Include in Report</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeHazards" 
                        checked={includeHazards}
                        onCheckedChange={(checked) => setIncludeHazards(checked === true)}
                      />
                      <Label htmlFor="includeHazards">Hazards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeIncidents" 
                        checked={includeIncidents}
                        onCheckedChange={(checked) => setIncludeIncidents(checked === true)}
                      />
                      <Label htmlFor="includeIncidents">Incidents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeInspections" 
                        checked={includeInspections}
                        onCheckedChange={(checked) => setIncludeInspections(checked === true)}
                      />
                      <Label htmlFor="includeInspections">Inspections</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includePermits" 
                        checked={includePermits}
                        onCheckedChange={(checked) => setIncludePermits(checked === true)}
                      />
                      <Label htmlFor="includePermits">Permits</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeTraining" 
                        checked={includeTraining}
                        onCheckedChange={(checked) => setIncludeTraining(checked === true)}
                      />
                      <Label htmlFor="includeTraining">Training</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={generateReportMutation.isPending || !selectedSite || !startDate || !endDate}
                    className="flex items-center gap-2"
                  >
                    {generateReportMutation.isPending ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <FileText size={16} />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>
                  Previously generated reports available for download
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="py-4 text-center">Loading report history...</div>
                ) : reportsData && reportsData.length > 0 ? (
                  <Table>
                    <TableCaption>List of generated reports</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Generated By</TableHead>
                        <TableHead>Generated On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.map((report: ReportHistory) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.reportName}</TableCell>
                          <TableCell>{report.siteName}</TableCell>
                          <TableCell>
                            {format(new Date(report.startDate), "MMM d, yyyy")} - {format(new Date(report.endDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{report.generatedBy}</TableCell>
                          <TableCell>{format(new Date(report.generatedOn), "MMM d, yyyy h:mm a")}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => downloadReport(report.id)}
                              className="flex items-center gap-1"
                            >
                              <Download size={14} />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">No reports have been generated yet</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("generate")}
                      className="flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Generate Your First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}