import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDown, ArrowUp, AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp,
  Award, Users, Shield, BarChart2, Compass, Map, Activity
} from "lucide-react";
import { useForm } from "react-hook-form";
import { format, subDays, subMonths } from "date-fns";

// Mock dashboard data
const severityData = [
  { name: 'Low', value: 18, color: '#4ade80' },
  { name: 'Medium', value: 24, color: '#facc15' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Critical', value: 6, color: '#ef4444' },
];

const statusData = [
  { name: 'Open', value: 14, color: '#ef4444' },
  { name: 'Assigned', value: 22, color: '#f97316' },
  { name: 'In Progress', value: 16, color: '#3b82f6' },
  { name: 'Resolved', value: 6, color: '#22c55e' },
  { name: 'Closed', value: 2, color: '#64748b' },
];

const siteData = [
  { name: 'Downtown Tower', open: 6, inProgress: 4, resolved: 2 },
  { name: 'Riverside Plaza', open: 8, inProgress: 5, resolved: 1 },
  { name: 'Phoenix Heights', open: 4, inProgress: 3, resolved: 0 },
  { name: 'Oakwood Residences', open: 7, inProgress: 2, resolved: 1 },
  { name: 'Central Station', open: 5, inProgress: 2, resolved: 2 },
];

const timeToResolveData = [
  { name: '<1 Day', value: 4 },
  { name: '1-3 Days', value: 12 },
  { name: '4-7 Days', value: 20 },
  { name: '>7 Days', value: 8 },
];

const trendsData = [
  { month: 'Jan', reported: 12, resolved: 10 },
  { month: 'Feb', reported: 19, resolved: 15 },
  { month: 'Mar', reported: 15, resolved: 13 },
  { month: 'Apr', reported: 18, resolved: 14 },
  { month: 'May', reported: 22, resolved: 16 },
  { month: 'Jun', reported: 20, resolved: 18 },
];

const topHazardTypes = [
  { name: 'Slip/Trip Hazard', count: 15 },
  { name: 'Electrical Hazard', count: 12 },
  { name: 'Fall Protection', count: 10 },
  { name: 'Improper PPE', count: 8 },
  { name: 'Equipment Malfunction', count: 7 },
];

// Mock performance leaderboard data
const topReportersData = [
  { name: 'Michael Johnson', role: 'Safety Officer', count: 27, responseTime: '24 min', site: 'Downtown Tower' },
  { name: 'Sarah Williams', role: 'Site Manager', count: 23, responseTime: '35 min', site: 'Riverside Plaza' },
  { name: 'Robert Chen', role: 'Foreman', count: 19, responseTime: '42 min', site: 'Oakwood Residences' },
  { name: 'David Rodriguez', role: 'Safety Inspector', count: 18, responseTime: '28 min', site: 'Phoenix Heights' },
  { name: 'Jessica Taylor', role: 'Construction Lead', count: 16, responseTime: '40 min', site: 'Central Station' },
];

const fastestRespondersData = [
  { name: 'Emily Davis', role: 'Safety Officer', avgResponseTime: '18 min', resolvedCount: 24, site: 'Riverside Plaza' },
  { name: 'James Wilson', role: 'Maintenance Supervisor', avgResponseTime: '22 min', resolvedCount: 17, site: 'Downtown Tower' },
  { name: 'Thomas Moore', role: 'Supervisor', avgResponseTime: '25 min', resolvedCount: 19, site: 'Central Station' },
  { name: 'Samantha Lee', role: 'Site Manager', avgResponseTime: '30 min', resolvedCount: 22, site: 'Phoenix Heights' },
  { name: 'Brian Martinez', role: 'Safety Inspector', avgResponseTime: '31 min', resolvedCount: 16, site: 'Oakwood Residences' },
];

const topTeamsData = [
  { name: 'Alpha Safety Team', leader: 'Emily Davis', resolvedHazards: 42, avgResolutionTime: '3.2 days', safetyScore: 94 },
  { name: 'FastTrack Responders', leader: 'Thomas Moore', resolvedHazards: 38, avgResolutionTime: '3.8 days', safetyScore: 91 },
  { name: 'Safety Champions', leader: 'James Wilson', resolvedHazards: 36, avgResolutionTime: '4.1 days', safetyScore: 89 },
  { name: 'Hazard Hunters', leader: 'Michael Johnson', resolvedHazards: 34, avgResolutionTime: '4.5 days', safetyScore: 87 },
  { name: 'Riverside Guardians', leader: 'Sarah Williams', resolvedHazards: 31, avgResolutionTime: '4.8 days', safetyScore: 85 },
];

// Mock recent hazards
const recentHazards = [
  { id: 1, title: "Exposed wiring near main entrance", severity: "high", status: "open", site: "Downtown Tower", reportedBy: "John Smith", reportedDate: "2025-05-20T14:30:00Z" },
  { id: 2, title: "Loose handrail on 3rd floor stairwell", severity: "medium", status: "in_progress", site: "Riverside Plaza", reportedBy: "Jane Doe", reportedDate: "2025-05-21T09:15:00Z" },
  { id: 3, title: "Water leak in basement storage", severity: "medium", status: "assigned", site: "Phoenix Heights", reportedBy: "Mike Johnson", reportedDate: "2025-05-21T11:45:00Z" },
  { id: 4, title: "Missing safety guard on cutting machine", severity: "critical", status: "in_progress", site: "Oakwood Residences", reportedBy: "Sarah Williams", reportedDate: "2025-05-21T16:20:00Z" },
  { id: 5, title: "Improper chemical storage in maintenance room", severity: "high", status: "open", site: "Central Station", reportedBy: "Robert Brown", reportedDate: "2025-05-22T08:05:00Z" },
];

// Get color based on severity
const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get color and icon based on status
const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': 
      return { 
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="h-4 w-4 mr-1" /> 
      };
    case 'assigned': 
      return { 
        color: 'bg-orange-100 text-orange-800',
        icon: <Clock className="h-4 w-4 mr-1" /> 
      };
    case 'in_progress': 
      return { 
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="h-4 w-4 mr-1" /> 
      };
    case 'resolved': 
      return { 
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4 mr-1" /> 
      };
    case 'closed': 
      return { 
        color: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle className="h-4 w-4 mr-1" /> 
      };
    default: 
      return { 
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertTriangle className="h-4 w-4 mr-1" /> 
      };
  }
};

export default function HazardAnalytics() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState("30days");
  const [selectedSite, setSelectedSite] = useState("all");
  
  const form = useForm({
    defaultValues: {
      dateRange: "30days",
      site: "all"
    }
  });

  // Mock stats comparing to previous period
  const stats = {
    totalHazards: { value: 60, change: 15, increased: true },
    openHazards: { value: 14, change: -3, increased: false },
    averageResolveTime: { value: "5.2 days", change: -0.8, increased: false },
    resolvedOnTime: { value: "86%", change: 4, increased: true }
  };

  return (
    <Layout>
      <div className="mb-6">
        <PageHeader 
          title="Safety Excellence Dashboard" 
          description="Comprehensive analytics to drive safety improvement and recognize top performers"
        />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-8 p-8 border border-blue-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">Safety At A Glance</h2>
            <p className="text-blue-700 mb-4">Overall safety performance across all construction sites</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  <h3 className="text-sm font-semibold">Total Hazards</h3>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-blue-900">{stats.totalHazards.value}</div>
                  <div className={`flex items-center text-sm ${stats.totalHazards.increased ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.totalHazards.increased ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.totalHazards.change)}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2 text-red-500" />
                  <h3 className="text-sm font-semibold">Open Hazards</h3>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-blue-900">{stats.openHazards.value}</div>
                  <div className={`flex items-center text-sm ${stats.openHazards.increased ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.openHazards.increased ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.openHazards.change)}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="text-sm font-semibold">Avg Resolution Time</h3>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-blue-900">{stats.averageResolveTime.value}</div>
                  <div className={`flex items-center text-sm ${stats.averageResolveTime.increased ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.averageResolveTime.increased ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.averageResolveTime.change)} days
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Time to close hazards</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <h3 className="text-sm font-semibold">Resolved On Time</h3>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-blue-900">{stats.resolvedOnTime.value}</div>
                  <div className={`flex items-center text-sm ${stats.resolvedOnTime.increased ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.resolvedOnTime.increased ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.resolvedOnTime.change)}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target compliance</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center text-blue-900">
              <Award className="h-5 w-5 mr-2 text-amber-500" />
              Safety Star of the Month
            </h3>
            <div className="flex items-start mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-xl mr-4">
                EM
              </div>
              <div>
                <p className="font-medium text-lg">Emily Davis</p>
                <p className="text-sm text-gray-600">Safety Officer, Riverside Plaza</p>
                <div className="flex mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">24 Hazards Identified</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">18min Avg Response</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 italic border-l-4 border-amber-200 pl-3">
              "Emily's exceptional dedication to workplace safety has resulted in a 45% reduction in critical hazards at Riverside Plaza this quarter."
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="downtown">Downtown Tower</SelectItem>
              <SelectItem value="riverside">Riverside Plaza</SelectItem>
              <SelectItem value="phoenix">Phoenix Heights</SelectItem>
              <SelectItem value="oakwood">Oakwood Residences</SelectItem>
              <SelectItem value="central">Central Station</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline">
          <span className="mr-2">Export Report</span> 📊
        </Button>
      </div>

      {/* Safety Performance Leaderboards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">Top Safety Performers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 border-b">
              <h3 className="font-semibold flex items-center text-amber-800">
                <Award className="h-5 w-5 mr-2 text-amber-500" />
                Top Hazard Reporters
              </h3>
              <p className="text-xs text-amber-700">Personnel who reported the most hazards</p>
            </div>
            <div className="p-4">
              <div className="space-y-5">
                {topReportersData.map((reporter, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                        index === 0 ? 'bg-amber-100 text-amber-700' : 
                        index === 1 ? 'bg-slate-100 text-slate-700' : 
                        index === 2 ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{reporter.name}</p>
                        <p className="text-xs text-gray-500">{reporter.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{reporter.count}</p>
                      <p className="text-xs text-gray-500">{reporter.site}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
              <h3 className="font-semibold flex items-center text-blue-800">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Fastest Responders
              </h3>
              <p className="text-xs text-blue-700">Personnel with fastest hazard response time</p>
            </div>
            <div className="p-4">
              <div className="space-y-5">
                {fastestRespondersData.map((responder, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100 text-blue-700' : 
                        index === 1 ? 'bg-blue-50 text-blue-600' : 
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{responder.name}</p>
                        <p className="text-xs text-gray-500">{responder.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{responder.avgResponseTime}</p>
                      <p className="text-xs text-gray-500">{responder.resolvedCount} resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b">
              <h3 className="font-semibold flex items-center text-green-800">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Top Safety Teams
              </h3>
              <p className="text-xs text-green-700">Teams with highest safety performance</p>
            </div>
            <div className="p-4">
              <div className="space-y-5">
                {topTeamsData.map((team, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                        index === 0 ? 'bg-green-100 text-green-700' : 
                        index === 1 ? 'bg-green-50 text-green-600' : 
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-gray-500">Led by {team.leader}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{team.safetyScore}/100</p>
                      <p className="text-xs text-gray-500">{team.resolvedHazards} resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hazards by Severity</CardTitle>
                <CardDescription>Distribution across severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hazards`, 'Count']} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hazards by Status</CardTitle>
                <CardDescription>Current distribution by resolution status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hazards`, 'Count']} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Time to Resolution</CardTitle>
                <CardDescription>How quickly hazards are being addressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeToResolveData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} hazards`, 'Count']} />
                      <Bar dataKey="value" name="Number of Hazards" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hazard Trends Over Time</CardTitle>
              <CardDescription>Monthly comparison of reported vs. resolved hazards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reported" stroke="#ef4444" name="Reported" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Resolved" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Hazard Trend Analysis</CardTitle>
                <CardDescription>6-month overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Overall Trend</h3>
                      <div className="flex items-center text-lg font-semibold mt-1">
                        <TrendingDown className="h-5 w-5 mr-1 text-green-500" />
                        <span>Improving</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      8% reduction in hazards
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Critical Hazards</h3>
                      <div className="flex items-center text-lg font-semibold mt-1">
                        <TrendingUp className="h-5 w-5 mr-1 text-red-500" />
                        <span>Increasing</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      15% increase in last month
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Resolution Speed</h3>
                      <div className="flex items-center text-lg font-semibold mt-1">
                        <TrendingDown className="h-5 w-5 mr-1 text-green-500" />
                        <span>Improving</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      20% faster resolution time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Safety Recommendations</CardTitle>
                <CardDescription>Based on hazard trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800">Focus on Electrical Hazards</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Electrical hazards have increased 25% in the last quarter. Consider additional training and inspection protocols.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-amber-800">Downtown Tower Issues</h3>
                    <p className="text-xs text-amber-700 mt-1">
                      Downtown Tower site has the most unresolved hazards. Consider allocating additional resources to address backlog.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-green-800">PPE Compliance Improving</h3>
                    <p className="text-xs text-green-700 mt-1">
                      PPE compliance has improved by 18%. Continue with current reinforcement strategy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hazards by Site</CardTitle>
              <CardDescription>Site comparison of open, in-progress and resolved hazards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={siteData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={30}
                    barGap={10}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="open" name="Open" fill="#ef4444" />
                    <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" />
                    <Bar dataKey="resolved" name="Resolved" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Site Safety Rankings</CardTitle>
                <CardDescription>Based on hazard resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">1</div>
                      <span>Oakwood Residences</span>
                    </div>
                    <div className="text-sm text-green-600">92%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">2</div>
                      <span>Central Station</span>
                    </div>
                    <div className="text-sm text-green-600">87%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">3</div>
                      <span>Phoenix Heights</span>
                    </div>
                    <div className="text-sm text-yellow-600">76%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">4</div>
                      <span>Riverside Plaza</span>
                    </div>
                    <div className="text-sm text-yellow-600">73%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">5</div>
                      <span>Downtown Tower</span>
                    </div>
                    <div className="text-sm text-red-600">68%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Site Improvement Opportunities</CardTitle>
                <CardDescription>Recommendations for problematic sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-3">
                    <h3 className="text-sm font-medium">Downtown Tower</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Highest rate of electrical hazards. Schedule additional electrical safety inspection and 
                      prioritize resolution of 6 open electrical issues on floors 3-5.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <h3 className="text-sm font-medium">Riverside Plaza</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Increased slip/trip hazards reported around entrance areas. Recommend inspection of 
                      floor surfaces and drainage system. Current open hazards have exceeded target resolution time.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h3 className="text-sm font-medium">Phoenix Heights</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Recent improvement in hazard reduction but equipment-related hazards remain an issue. 
                      Consider scheduling additional equipment safety training for site personnel.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Hazard Types</CardTitle>
              <CardDescription>Most frequently reported safety issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topHazardTypes}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Hazard Reports</CardTitle>
              <CardDescription>Most recently reported issues across all sites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium">Hazard</th>
                      <th className="text-left py-3 font-medium">Severity</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Site</th>
                      <th className="text-left py-3 font-medium">Reported By</th>
                      <th className="text-left py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHazards.map(hazard => {
                      const statusInfo = getStatusInfo(hazard.status);
                      return (
                        <tr key={hazard.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{hazard.title}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(hazard.severity)}`}>
                              {hazard.severity}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {hazard.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3">{hazard.site}</td>
                          <td className="py-3">{hazard.reportedBy}</td>
                          <td className="py-3">{format(new Date(hazard.reportedDate), 'MMM d, yyyy')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  Top Hazard Reporters
                </CardTitle>
                <CardDescription>Personnel who reported the most hazards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {topReportersData.map((reporter, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                          index === 0 ? 'bg-amber-100 text-amber-700' : 
                          index === 1 ? 'bg-slate-100 text-slate-700' : 
                          index === 2 ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{reporter.name}</p>
                          <p className="text-xs text-gray-500">{reporter.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{reporter.count}</p>
                        <p className="text-xs text-gray-500">{reporter.site}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Fastest Responders
                </CardTitle>
                <CardDescription>Personnel with fastest hazard response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {fastestRespondersData.map((responder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                          index === 0 ? 'bg-blue-100 text-blue-700' : 
                          index === 1 ? 'bg-blue-50 text-blue-600' : 
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{responder.name}</p>
                          <p className="text-xs text-gray-500">{responder.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{responder.avgResponseTime}</p>
                        <p className="text-xs text-gray-500">{responder.resolvedCount} resolved</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Top Safety Teams
                </CardTitle>
                <CardDescription>Teams with highest safety performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {topTeamsData.map((team, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                          index === 0 ? 'bg-green-100 text-green-700' : 
                          index === 1 ? 'bg-green-50 text-green-600' : 
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{team.name}</p>
                          <p className="text-xs text-gray-500">Led by {team.leader}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{team.safetyScore}/100</p>
                        <p className="text-xs text-gray-500">{team.resolvedHazards} resolved</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance Metrics</CardTitle>
              <CardDescription>Detailed performance breakdown by individuals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3 font-medium">Rank</th>
                      <th className="text-left py-3 px-3 font-medium">Name</th>
                      <th className="text-left py-3 px-3 font-medium">Position</th>
                      <th className="text-left py-3 px-3 font-medium">Site</th>
                      <th className="text-center py-3 px-3 font-medium">Hazards Reported</th>
                      <th className="text-center py-3 px-3 font-medium">Hazards Resolved</th>
                      <th className="text-center py-3 px-3 font-medium">Avg. Response Time</th>
                      <th className="text-center py-3 px-3 font-medium">Safety Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...topReportersData, ...fastestRespondersData]
                      .filter((person, index, self) => 
                        index === self.findIndex(p => p.name === person.name)
                      )
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 10)
                      .map((person, index) => {
                        const responder = fastestRespondersData.find(r => r.name === person.name);
                        // Calculate a safety score (just for demonstration)
                        const safetyScore = Math.round(
                          80 + 
                          ((person.count || 0) / 30) * 10 + 
                          ((responder?.resolvedCount || 0) / 25) * 10
                        );
                        
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-3">{index + 1}</td>
                            <td className="py-3 px-3 font-medium">{person.name}</td>
                            <td className="py-3 px-3">{person.role}</td>
                            <td className="py-3 px-3">{person.site}</td>
                            <td className="py-3 px-3 text-center">{person.count || '-'}</td>
                            <td className="py-3 px-3 text-center">{responder?.resolvedCount || '-'}</td>
                            <td className="py-3 px-3 text-center">{responder?.avgResponseTime || person.responseTime || '-'}</td>
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs 
                                  ${safetyScore >= 90 ? 'bg-green-100 text-green-800' : 
                                    safetyScore >= 80 ? 'bg-blue-100 text-blue-800' : 
                                    'bg-amber-100 text-amber-800'}`
                                }>
                                  {safetyScore}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recognition & Incentives</CardTitle>
              <CardDescription>Celebrate top performers and safety champions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                  <div className="flex items-center mb-4">
                    <Award className="h-6 w-6 text-amber-500 mr-2" />
                    <h3 className="font-semibold">Safety Star of the Month</h3>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-xl mr-3">
                      EM
                    </div>
                    <div>
                      <p className="font-medium">Emily Davis</p>
                      <p className="text-sm text-gray-600">Safety Officer, Riverside Plaza</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    For exceptional dedication to workplace safety, identifying 24 hazards and achieving
                    the fastest average response time of 18 minutes.
                  </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="font-semibold">Most Improved</h3>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xl mr-3">
                      RC
                    </div>
                    <div>
                      <p className="font-medium">Robert Chen</p>
                      <p className="text-sm text-gray-600">Foreman, Oakwood Residences</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    For demonstrating a 45% improvement in hazard identification and response time
                    over the previous quarter.
                  </p>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-green-500 mr-2" />
                    <h3 className="font-semibold">Team Achievement Award</h3>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm mr-3">
                      TEAM
                    </div>
                    <div>
                      <p className="font-medium">Alpha Safety Team</p>
                      <p className="text-sm text-gray-600">Led by Emily Davis</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    For resolving 42 hazards with an average resolution time of 3.2 days
                    and achieving a 94% safety score.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}