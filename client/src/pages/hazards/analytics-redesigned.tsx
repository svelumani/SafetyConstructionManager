import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDown, ArrowUp, AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp,
  Award, Users, Shield, BarChart2, Activity, MapPin, Flag
} from "lucide-react";
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
  { name: 'Emily Davis', role: 'Safety Officer', count: 24, site: 'Riverside Plaza' },
  { name: 'Michael Chen', role: 'Site Manager', count: 19, site: 'Phoenix Heights' },
  { name: 'Sarah Johnson', role: 'Foreman', count: 16, site: 'Downtown Tower' },
  { name: 'James Wilson', role: 'Electrician', count: 12, site: 'Central Station' },
  { name: 'David Rodriguez', role: 'Safety Coordinator', count: 10, site: 'Multiple Sites' },
];

const fastestRespondersData = [
  { name: 'Emily Davis', role: 'Safety Officer', avgResponseTime: '18min', resolvedCount: 21 },
  { name: 'John Smith', role: 'Project Manager', avgResponseTime: '24min', resolvedCount: 15 },
  { name: 'Lisa Anderson', role: 'Safety Inspector', avgResponseTime: '33min', resolvedCount: 18 },
  { name: 'Thomas Lee', role: 'Site Supervisor', avgResponseTime: '47min', resolvedCount: 9 },
  { name: 'Karen Miller', role: 'Health & Safety Manager', avgResponseTime: '52min', resolvedCount: 11 },
];

const topTeamsData = [
  { name: 'Alpha Safety Team', leader: 'Emily Davis', safetyScore: 94, resolvedHazards: 43 },
  { name: 'Eagle Response Unit', leader: 'John Smith', safetyScore: 89, resolvedHazards: 37 },
  { name: 'Riverside Safety Crew', leader: 'Maria Garcia', safetyScore: 85, resolvedHazards: 32 },
  { name: 'Phoenix Prevention', leader: 'Thomas Lee', safetyScore: 82, resolvedHazards: 29 },
  { name: 'Downtown Safety Squad', leader: 'James Wilson', safetyScore: 79, resolvedHazards: 25 },
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
  const [dateRange, setDateRange] = useState("30days");
  const [selectedSite, setSelectedSite] = useState("all");

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
                ED
              </div>
              <div>
                <p className="font-medium text-lg">Emily Davis</p>
                <p className="text-sm text-gray-600">Safety Officer, Riverside Plaza</p>
                <div className="flex flex-wrap mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">24 Hazards Identified</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">18min Avg Response</span>
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
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
          <span className="flex items-center">
            <Award className="h-6 w-6 mr-2 text-amber-500" />
            Top Safety Performers
          </span>
        </h2>
        
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
      </section>
      
      {/* Hazard Distribution Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
          <span className="flex items-center">
            <BarChart2 className="h-6 w-6 mr-2 text-blue-500" />
            Hazard Distribution
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hazards by Severity</CardTitle>
              <CardDescription>Distribution of hazards by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Hazards`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hazards by Status</CardTitle>
              <CardDescription>Current distribution of hazard statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Hazards`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Trends Over Time Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
          <span className="flex items-center">
            <Activity className="h-6 w-6 mr-2 text-indigo-500" />
            Trends Over Time
          </span>
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Hazard Reporting Trends</CardTitle>
            <CardDescription>Monthly reported vs. resolved hazards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="reported" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReported)" />
                  <Area type="monotone" dataKey="resolved" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Site Comparison Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
          <span className="flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-orange-500" />
            Site Comparison
          </span>
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Hazards by Construction Site</CardTitle>
            <CardDescription>Compare hazard statuses across all active construction sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={siteData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open" stackId="a" fill="#ef4444" name="Open" />
                  <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                  <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Hazard Types</CardTitle>
              <CardDescription>Most frequently reported hazard categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topHazardTypes}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Distribution</CardTitle>
              <CardDescription>Time taken to resolve hazards by category</CardDescription>
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
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Key Insights Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
          <span className="flex items-center">
            <Flag className="h-6 w-6 mr-2 text-red-500" />
            Key Insights & Recommendations
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Positive Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-3 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Decreasing Resolution Time</p>
                    <p className="text-sm text-gray-600">Average resolution time has decreased by 0.8 days, improving overall safety response efficiency.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-3 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Improved On-Time Resolution</p>
                    <p className="text-sm text-gray-600">86% of hazards are now resolved within target timeframes, up by 4% from the previous period.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-3 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Increased Team Performance</p>
                    <p className="text-sm text-gray-600">The Alpha Safety Team has achieved a 94% safety score, setting a new benchmark for all teams.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-800 mr-3 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Rising Hazard Reports</p>
                    <p className="text-sm text-gray-600">Total hazards have increased by 15%, with particular concerns at Riverside Plaza and Downtown Tower.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-800 mr-3 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Slip/Trip Hazards Prevalence</p>
                    <p className="text-sm text-gray-600">Slip and trip hazards remain the most reported category, suggesting need for targeted preventative measures.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-800 mr-3 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Slow Resolution at Phoenix Heights</p>
                    <p className="text-sm text-gray-600">Phoenix Heights has the lowest hazard resolution rate, with 4 open and 0 resolved hazards this period.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actionable Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">1</div>
                  <div>
                    <p className="font-medium">Targeted Training Program</p>
                    <p className="text-sm text-gray-600">Implement specialized training for slip/trip hazard prevention across all sites.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">2</div>
                  <div>
                    <p className="font-medium">Improve Phoenix Heights Response</p>
                    <p className="text-sm text-gray-600">Assign additional safety personnel to Phoenix Heights to address the backlog of open hazards.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">3</div>
                  <div>
                    <p className="font-medium">Expand Recognition Program</p>
                    <p className="text-sm text-gray-600">Extend the safety star program to include team-based incentives to encourage collaborative safety culture.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">4</div>
                  <div>
                    <p className="font-medium">Safety Audit Schedule</p>
                    <p className="text-sm text-gray-600">Implement bi-weekly safety audits at sites with highest hazard reports (Riverside and Downtown).</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}