import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Building,
  Calendar,
  ChevronUp,
  ClipboardList,
  Clock,
  FileCheck,
  HardHat,
  LineChart,
  ListChecks,
  PlusCircle,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { formatUTCToLocal } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Mock incident data
const mockIncidents = [
  { id: 1, title: "Forklift Tipping Incident", severity: "major", status: "investigating", location: "Warehouse B", incidentDate: "2025-05-15T14:30:00.000Z", reportedByName: "John Doe" },
  { id: 2, title: "Chemical Spill", severity: "critical", status: "resolved", location: "Lab Area", incidentDate: "2025-05-10T09:45:00.000Z", reportedByName: "Sarah Johnson" },
  { id: 3, title: "Worker Fall from Scaffold", severity: "major", status: "investigating", location: "Building A, 3rd Floor", incidentDate: "2025-05-10T09:30:00.000Z", reportedByName: "Shyam Rodriguez" },
  { id: 4, title: "Machinery Breakdown", severity: "moderate", status: "closed", location: "Production Line 3", incidentDate: "2025-05-08T13:15:00.000Z", reportedByName: "Michel Laurent" },
  { id: 5, title: "Electrical Short Circuit", severity: "major", status: "reported", location: "Electrical Room", incidentDate: "2025-05-03T15:20:00.000Z", reportedByName: "Amanda Chen" },
  { id: 6, title: "Gas Leak", severity: "critical", status: "resolved", location: "Utility Area", incidentDate: "2025-04-28T11:10:00.000Z", reportedByName: "Robert Kim" },
  { id: 7, title: "Slip and Fall", severity: "minor", status: "closed", location: "Office Hallway", incidentDate: "2025-04-25T10:00:00.000Z", reportedByName: "Tina Patel" },
];

// Mock incident statistics
const mockStats = {
  totalIncidents: 30,
  openIncidents: 12,
  closedIncidents: 18,
  criticalIncidents: 5,
  majorIncidents: 14,
  moderateIncidents: 7,
  minorIncidents: 4,
  reportedToday: 3,
  resolvedToday: 2,
  averageResolutionTime: "3.2 days",
  incidentTrend: -12, // percentage decrease from previous period
  siteWithMostIncidents: "Downtown Highrise Project",
  siteWithLeastIncidents: "Suburban Mall Renovation",
  mostCommonIncidentType: "Fall",
  topReporter: "Safety Manager: Shyam Rodriguez",
  incidentsByMonth: [
    { month: "Jan", count: 6 },
    { month: "Feb", count: 8 },
    { month: "Mar", count: 12 },
    { month: "Apr", count: 10 },
    { month: "May", count: 9 },
  ],
  incidentsBySeverity: {
    critical: 5,
    major: 14,
    moderate: 7,
    minor: 4,
  },
  incidentsByStatus: {
    reported: 5,
    investigating: 7,
    resolved: 6,
    closed: 12,
  },
  incidentsBySite: [
    { site: "Downtown Highrise Project", count: 12 },
    { site: "Harbor Bridge Expansion", count: 7 },
    { site: "Medical Center", count: 6 },
    { site: "Suburban Mall Renovation", count: 3 },
    { site: "Airport Terminal", count: 2 },
  ],
  incidentsByType: [
    { type: "Fall", count: 9 },
    { type: "Struck by Object", count: 6 },
    { type: "Equipment Failure", count: 5 },
    { type: "Chemical Exposure", count: 4 },
    { type: "Electrical", count: 3 },
    { type: "Other", count: 3 },
  ],
  safetyPerformance: [
    { team: "Electrical Team", incidentRate: 0.5, improvementRate: 45 },
    { team: "Structural Team", incidentRate: 0.8, improvementRate: 30 },
    { team: "Plumbing Team", incidentRate: 1.2, improvementRate: 25 },
    { team: "Finishing Team", incidentRate: 1.5, improvementRate: 20 },
    { team: "Excavation Team", incidentRate: 1.8, improvementRate: 15 },
  ],
};

// Calculate percentage distribution for severity
const totalIncidents = mockStats.totalIncidents;
const severityPercentages = {
  critical: Math.round((mockStats.incidentsBySeverity.critical / totalIncidents) * 100),
  major: Math.round((mockStats.incidentsBySeverity.major / totalIncidents) * 100),
  moderate: Math.round((mockStats.incidentsBySeverity.moderate / totalIncidents) * 100),
  minor: Math.round((mockStats.incidentsBySeverity.minor / totalIncidents) * 100),
};

// Calculate percentage distribution for status
const statusPercentages = {
  reported: Math.round((mockStats.incidentsByStatus.reported / totalIncidents) * 100),
  investigating: Math.round((mockStats.incidentsByStatus.investigating / totalIncidents) * 100),
  resolved: Math.round((mockStats.incidentsByStatus.resolved / totalIncidents) * 100),
  closed: Math.round((mockStats.incidentsByStatus.closed / totalIncidents) * 100),
};

export default function IncidentAnalytics() {
  const { user } = useAuth();
  
  // In a real application, you would fetch this data from your API
  const { data: incidentStats = mockStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/incident-stats"],
    enabled: false, // Disable this query as we're using mock data
  });
  
  // Use mock incident data instead of fetching from API
  const { data: incidents = mockIncidents, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["/api/incidents"],
    enabled: false, // Disable API call and use mock data
  });

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Incident Analytics</h1>
            <p className="text-muted-foreground">
              Track, analyze, and improve safety performance across all sites and teams
            </p>
          </div>
          <Link href="/incidents/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Report Incident
            </Button>
          </Link>
        </div>

        {/* Hero Section with Key Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Active Incidents
              </CardTitle>
              <CardDescription>
                Currently being addressed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-4xl font-bold">{incidentStats.openIncidents}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ChevronUp className="h-4 w-4 text-red-500" />
                  <span>+{Math.round(incidentStats.openIncidents / totalIncidents * 100)}% of total</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reported</span>
                  <span className="font-medium">{incidentStats.incidentsByStatus.reported}</span>
                </div>
                <Progress value={statusPercentages.reported} className="h-2 bg-red-100" />
                
                <div className="flex justify-between text-sm">
                  <span>Investigating</span>
                  <span className="font-medium">{incidentStats.incidentsByStatus.investigating}</span>
                </div>
                <Progress value={statusPercentages.investigating} className="h-2 bg-amber-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                Resolved Incidents
              </CardTitle>
              <CardDescription>
                Completed and archived cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-4xl font-bold">{incidentStats.closedIncidents}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {incidentStats.incidentTrend < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span>{Math.abs(incidentStats.incidentTrend)}% decrease</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span>{incidentStats.incidentTrend}% increase</span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Resolved</span>
                  <span className="font-medium">{incidentStats.incidentsByStatus.resolved}</span>
                </div>
                <Progress value={statusPercentages.resolved} className="h-2 bg-blue-100" indicatorStyle="bg-blue-400" />
                
                <div className="flex justify-between text-sm">
                  <span>Closed</span>
                  <span className="font-medium">{incidentStats.incidentsByStatus.closed}</span>
                </div>
                <Progress value={statusPercentages.closed} className="h-2 bg-green-100" indicatorStyle="bg-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Resolution Metrics
              </CardTitle>
              <CardDescription>
                Time to resolve incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-4xl font-bold">{incidentStats.averageResolutionTime}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>Avg. resolution time</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Today</span>
                  <span className="font-medium">
                    {incidentStats.reportedToday} reported, {incidentStats.resolvedToday} resolved
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  <span>{incidentStats.incidentsByStatus.investigating} incidents awaiting resolution</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Severity Distribution
              </CardTitle>
              <CardDescription>
                By incident impact level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-4xl font-bold text-red-500">{incidentStats.criticalIncidents}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Critical</span> incidents
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Critical</span>
                  <span className="font-medium">{severityPercentages.critical}%</span>
                </div>
                <Progress value={severityPercentages.critical} className="h-2 bg-red-100" indicatorStyle="bg-red-500" />
                
                <div className="flex justify-between text-sm">
                  <span>Major</span>
                  <span className="font-medium">{severityPercentages.major}%</span>
                </div>
                <Progress value={severityPercentages.major} className="h-2 bg-orange-100" indicatorStyle="bg-orange-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Trend Analysis Section */}
        <section>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="by-site">By Site</TabsTrigger>
              <TabsTrigger value="by-type">By Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Incident Trends (Last 5 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end justify-between p-2">
                      {mockStats.incidentsByMonth.map((month) => (
                        <div key={month.month} className="flex flex-col items-center gap-2">
                          <div 
                            className="bg-blue-500 w-12 rounded-t-md" 
                            style={{ 
                              height: `${(month.count / 12) * 150}px`,
                              backgroundColor: month.count > 10 ? 'rgb(239 68 68)' : 'rgb(59 130 246)'
                            }}
                          />
                          <span className="text-sm font-medium">{month.month}</span>
                          <span className="text-xs text-muted-foreground">{month.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-green-500" />
                      Safety Performance Score
                    </CardTitle>
                    <CardDescription>Based on incident frequency and severity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                          />
                          {/* Foreground circle representing score */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeDasharray="282.7"
                            strokeDashoffset={(282.7 * (100 - 78)) / 100}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-4xl font-bold">78</div>
                          <div className="text-xs text-muted-foreground">Safety Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Previous Month: 72</span>
                        <span className="text-green-500 font-medium">+8.3%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Safety score calculated based on incident rate, severity, and resolution time
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-amber-500" />
                      Key Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          Most Incidents
                        </span>
                        <span className="font-medium text-red-500">12</span>
                      </div>
                      <div className="text-sm font-medium truncate">{incidentStats.siteWithMostIncidents}</div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-1">
                          <HardHat className="h-4 w-4" />
                          Most Common Type
                        </span>
                        <span className="font-medium text-amber-500">30%</span>
                      </div>
                      <div className="text-sm font-medium">{incidentStats.mostCommonIncidentType}</div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          Top Reporter
                        </span>
                        <span className="font-medium text-blue-500">8</span>
                      </div>
                      <div className="text-sm font-medium">{incidentStats.topReporter}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="by-site" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Incidents by Location</CardTitle>
                  <CardDescription>Distribution across active construction sites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {incidentStats.incidentsBySite.map((site) => (
                      <div key={site.site} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex-1 text-sm font-medium">{site.site}</div>
                          <div className="text-sm font-medium">{site.count}</div>
                          <div className="w-20 text-sm text-right text-muted-foreground">
                            {Math.round((site.count / totalIncidents) * 100)}%
                          </div>
                        </div>
                        <Progress 
                          value={Math.round((site.count / totalIncidents) * 100)} 
                          className="h-2"
                          indicatorStyle={
                            site.count > 10 
                              ? "bg-red-500" 
                              : site.count > 5 
                              ? "bg-amber-500" 
                              : "bg-green-500"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="by-type" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Incidents by Type</CardTitle>
                  <CardDescription>Categories of safety incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {incidentStats.incidentsByType.map((type) => (
                      <div key={type.type} className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-4xl font-bold">{type.count}</div>
                        <div className="text-sm font-medium mt-2">{type.type}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((type.count / totalIncidents) * 100)}% of total
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Performance Leaderboards Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Safety Performance Leaderboards</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background overflow-hidden border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Teams with Lowest Incident Rates
                </CardTitle>
                <CardDescription>Based on incidents per 1000 labor hours</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {incidentStats.safetyPerformance
                    .sort((a, b) => a.incidentRate - b.incidentRate)
                    .slice(0, 3)
                    .map((team, index) => (
                      <div key={team.team} className="relative">
                        <div className="flex items-center">
                          <div className="absolute -left-2 -top-2 flex items-center justify-center rounded-full bg-blue-100 w-8 h-8 text-blue-700 font-bold">
                            #{index + 1}
                          </div>
                          <div className="ml-8 flex-1">
                            <div className="font-medium">{team.team}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span>{team.incidentRate} incidents per 1000 hours</span>
                            </div>
                          </div>
                          <div className="text-green-500 font-medium text-sm flex items-center">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            {team.improvementRate}%
                          </div>
                        </div>
                        <Progress 
                          value={100 - (team.incidentRate * 40)} 
                          className="h-2 mt-2"
                          indicatorStyle="bg-blue-500"
                        />
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background overflow-hidden border-green-200 dark:border-green-800">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-500" />
                  Most Improved Safety Performance
                </CardTitle>
                <CardDescription>Based on year-over-year improvement</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {incidentStats.safetyPerformance
                    .sort((a, b) => b.improvementRate - a.improvementRate)
                    .slice(0, 3)
                    .map((team, index) => (
                      <div key={team.team} className="relative">
                        <div className="flex items-center">
                          <div className="absolute -left-2 -top-2 flex items-center justify-center rounded-full bg-green-100 w-8 h-8 text-green-700 font-bold">
                            #{index + 1}
                          </div>
                          <div className="ml-8 flex-1">
                            <div className="font-medium">{team.team}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Current rate: {team.incidentRate} per 1000 hours</span>
                            </div>
                          </div>
                          <div className="text-green-500 font-medium flex items-center">
                            <ChevronUp className="h-4 w-4 mr-1" />
                            {team.improvementRate}%
                          </div>
                        </div>
                        <Progress 
                          value={team.improvementRate * 2} 
                          className="h-2 mt-2"
                          indicatorStyle="bg-green-500"
                        />
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Incidents Section */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Recent Incidents</CardTitle>
                <Link href="/incidents">
                  <Button variant="outline" size="sm" className="h-8">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(mockIncidents) && mockIncidents.length > 0 ? mockIncidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex flex-col md:flex-row justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <Link href={`/incidents/${incident.id}`}>
                        <div className="font-medium hover:underline">{incident.title}</div>
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatUTCToLocal(incident.incidentDate)}
                        <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {incident.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end gap-2 mt-2 md:mt-0">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        incident.severity === "critical" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                          : incident.severity === "major"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          : incident.severity === "moderate"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}>
                        {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        incident.status === "reported" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                          : incident.status === "investigating"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : incident.status === "resolved"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-4">No recent incidents found</div>}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}