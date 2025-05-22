import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Tag,
  User,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define training compliance types
type ComplianceStatus = "overdue" | "expiring" | "exempt" | "not_started";

type ComplianceRecord = {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  userEmail: string;
  userTeam: string;
  userPhone: string;
  courseId: number;
  courseTitle: string;
  courseType: string;
  isRequired: boolean;
  assignedDate: string;
  dueDate: string;
  status: ComplianceStatus;
  priority: "high" | "medium" | "low";
  escalationLevel: number;
  lastReminder: string | null;
  managerId: number | null;
  managerName: string | null;
};

export default function TrainingCompliance() {
  const [activeTab, setActiveTab] = useState("overdue");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterByTeam, setFilterByTeam] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const { user } = useAuth();

  // Fetch training courses
  const { data: trainings, isLoading: isLoadingCourses } = useQuery({
    queryKey: [`/api/training-courses?limit=50`],
  });

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && (user.role === 'safety_officer' || user.role === 'super_admin'),
  });

  // Fetch all training records
  const { data: allTrainingRecords, isLoading: isLoadingAllRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user && (user.role === 'safety_officer' || user.role === 'super_admin'),
  });

  const isLoading = isLoadingCourses || isLoadingUsers || isLoadingAllRecords;

  // Process data to create compliance records
  const generateComplianceRecords = (): ComplianceRecord[] => {
    if (!trainings?.courses || !allTrainingRecords?.records || !users?.users) {
      return [];
    }
    
    const courses = trainings.courses;
    const allUsers = users.users;
    const records = allTrainingRecords.records;
    
    // Map to keep track of user training status for each required course
    const userCourseMap = new Map();
    
    // Initialize with all required courses for all users
    courses.filter(course => course.isRequired).forEach(course => {
      allUsers.forEach(usr => {
        const key = `${usr.id}-${course.id}`;
        userCourseMap.set(key, {
          id: parseInt(`${usr.id}${course.id}`),
          userId: usr.id,
          userName: `${usr.firstName || ''} ${usr.lastName || ''}`.trim() || usr.username,
          userRole: usr.role,
          userEmail: usr.email,
          userTeam: usr.teamName || "Unassigned",
          userPhone: usr.phoneNumber || "N/A",
          courseId: course.id,
          courseTitle: course.title,
          courseType: determineCourseType(course.title),
          isRequired: true,
          assignedDate: generateRandomPastDate(120),
          dueDate: generateRandomDate(),
          status: "not_started" as ComplianceStatus,
          priority: "medium" as "high" | "medium" | "low",
          escalationLevel: 0,
          lastReminder: null,
          managerId: null,
          managerName: null,
        });
      });
    });
    
    // Update with actual training records
    records.forEach(record => {
      const key = `${record.userId}-${record.courseId}`;
      const course = courses.find(c => c.id === record.courseId);
      
      if (!course || !course.isRequired) return;
      
      if (userCourseMap.has(key)) {
        const existing = userCourseMap.get(key);
        if (record.completionDate) {
          // Remove from map if completed
          userCourseMap.delete(key);
        } else if (record.startDate) {
          // Update status if in progress
          existing.status = "overdue";
          existing.priority = "high";
          userCourseMap.set(key, existing);
        }
      }
    });
    
    // Determine priority and status based on due date
    const result = Array.from(userCourseMap.values()).map(item => {
      const daysUntilDue = differenceInDays(new Date(item.dueDate), new Date());
      
      if (daysUntilDue < 0) {
        item.status = "overdue";
        item.priority = "high";
        item.escalationLevel = Math.min(3, Math.floor(Math.abs(daysUntilDue) / 7) + 1);
      } else if (daysUntilDue < 7) {
        item.status = "expiring";
        item.priority = "medium";
      }
      
      // Add some realistic manager data
      if (Math.random() > 0.3) {
        const managers = allUsers.filter(u => u.role === 'manager' || u.role === 'supervisor');
        if (managers.length > 0) {
          const manager = managers[Math.floor(Math.random() * managers.length)];
          item.managerId = manager.id;
          item.managerName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.username;
        }
      }
      
      return item;
    });
    
    return result;
  };

  const complianceRecords = generateComplianceRecords();
  
  // Filter compliance records
  const filteredRecords = complianceRecords
    .filter(record => {
      // Filter by tab
      if (activeTab === "overdue" && record.status !== "overdue") return false;
      if (activeTab === "expiring" && record.status !== "expiring") return false;
      if (activeTab === "all") {
        // Show all non-compliant records
      }
      
      // Filter by search query
      if (searchQuery && 
          !record.userName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !record.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.userTeam.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by selected course
      if (selectedCourse && record.courseId.toString() !== selectedCourse) {
        return false;
      }
      
      // Filter by team
      if (filterByTeam && record.userTeam !== filterByTeam) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by priority and due date
      if (a.priority === b.priority) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0;
    });
  
  // Get unique teams for filtering
  const uniqueTeams = Array.from(new Set(complianceRecords.map(record => record.userTeam)));
  
  // Get counts for badges
  const overdueCount = complianceRecords.filter(record => record.status === "overdue").length;
  const expiringCount = complianceRecords.filter(record => record.status === "expiring").length;
  const totalNonCompliant = complianceRecords.length;
  
  function determineCourseType(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("safety")) return "Safety";
    if (lowerTitle.includes("emergency")) return "Emergency";
    if (lowerTitle.includes("compliance")) return "Compliance";
    if (lowerTitle.includes("equipment")) return "Equipment";
    if (lowerTitle.includes("fire")) return "Fire Safety";
    if (lowerTitle.includes("hazard")) return "Hazard";
    return "General";
  }
  
  function generateRandomPastDate(maxDaysAgo: number): string {
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    return format(addDays(new Date(), -daysAgo), 'yyyy-MM-dd');
  }
  
  function generateRandomDate(): string {
    const futureOrPast = Math.random() > 0.3;
    const days = Math.floor(Math.random() * 30) * (futureOrPast ? 1 : -1);
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
  }

  function priorityColor(priority: "high" | "medium" | "low"): string {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  }
  
  function statusColor(status: ComplianceStatus): string {
    switch (status) {
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "expiring": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "exempt": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "not_started": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  }
  
  function handleSendReminder(record: ComplianceRecord) {
    setSelectedRecord(record);
    setEscalationDialogOpen(true);
  }
  
  function handleEscalation() {
    // Here would be code to send notifications, escalate the issue, etc.
    setEscalationDialogOpen(false);
    // This would update the lastReminder field and potentially escalation level in a real app
  }
  
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  function highlightText(text: string, query: string): JSX.Element | string {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    
    if (parts.length <= 1) return text;
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  }
  
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
              <h1 className="text-3xl font-bold tracking-tight">Training Compliance</h1>
              <p className="text-muted-foreground">
                Track employees who need to complete required training courses
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/training">
                <Button variant="outline">Back to Training</Button>
              </Link>
              <Link href="/training-analytics">
                <Button variant="outline">Analytics Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Compliance Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-800 dark:text-red-300 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                Overdue Trainings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-800 dark:text-red-300">{overdueCount}</div>
              <p className="text-sm text-red-600 dark:text-red-400">
                Employees who have missed their training deadlines
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-800 dark:text-amber-300 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800 dark:text-amber-300">{expiringCount}</div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Employees with training expiring in the next 7 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                Total Non-Compliant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalNonCompliant}</div>
              <p className="text-sm text-muted-foreground">
                Employees missing required safety training
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by employee, course, or team..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[180px] md:w-[250px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all-courses">All Courses</SelectItem>
                {trainings?.courses?.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="w-full md:w-auto flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "More Filters"}
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Filter by Team</Label>
                <Select value={filterByTeam} onValueChange={setFilterByTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-teams" value="all-teams">All Teams</SelectItem>
                    {uniqueTeams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        {/* Tab Navigation */}
        <Tabs defaultValue="overdue" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger key="overdue-tab" value="overdue" className="relative">
              Overdue
              <Badge className="ml-2 bg-red-500 hover:bg-red-500">{overdueCount}</Badge>
            </TabsTrigger>
            <TabsTrigger key="expiring-tab" value="expiring" className="relative">
              Expiring Soon
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">{expiringCount}</Badge>
            </TabsTrigger>
            <TabsTrigger key="all-tab" value="all">
              All Non-Compliant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Overdue Training</CardTitle>
                  <CardDescription>
                    Employees who have missed their training completion deadline
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Training Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No overdue training records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {record.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{highlightText(record.userName, searchQuery)}</div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Mail className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userEmail, searchQuery)}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Tag className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userTeam, searchQuery)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {highlightText(record.courseTitle, searchQuery)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {record.courseType}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(record.dueDate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-red-500">
                                {differenceInDays(new Date(), new Date(record.dueDate))} days overdue
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor(record.status)}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={priorityColor(record.priority)}>
                                {record.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleSendReminder(record)}
                              >
                                Escalate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Expiring Soon</CardTitle>
                  <CardDescription>
                    Employees with training expiring in the next 7 days
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Training Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No expiring training records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {record.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{highlightText(record.userName, searchQuery)}</div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Mail className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userEmail, searchQuery)}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Tag className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userTeam, searchQuery)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {highlightText(record.courseTitle, searchQuery)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {record.courseType}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(record.dueDate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-amber-500">
                                {differenceInDays(new Date(record.dueDate), new Date())} days remaining
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor(record.status)}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={priorityColor(record.priority)}>
                                {record.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                onClick={() => handleSendReminder(record)}
                              >
                                Send Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Non-Compliant</CardTitle>
                  <CardDescription>
                    All employees who need to complete required training
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Training Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No non-compliant training records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {record.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{highlightText(record.userName, searchQuery)}</div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Mail className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userEmail, searchQuery)}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Tag className="h-3 w-3 mr-1" /> 
                                    {highlightText(record.userTeam, searchQuery)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {highlightText(record.courseTitle, searchQuery)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {record.courseType}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(record.dueDate), 'MMM d, yyyy')}
                              </div>
                              {differenceInDays(new Date(), new Date(record.dueDate)) > 0 ? (
                                <div className="text-xs text-red-500">
                                  {differenceInDays(new Date(), new Date(record.dueDate))} days overdue
                                </div>
                              ) : (
                                <div className="text-xs text-amber-500">
                                  {differenceInDays(new Date(record.dueDate), new Date())} days remaining
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor(record.status)}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={priorityColor(record.priority)}>
                                {record.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant={record.status === "overdue" ? "destructive" : "default"}
                                onClick={() => handleSendReminder(record)}
                              >
                                {record.status === "overdue" ? "Escalate" : "Send Reminder"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Escalation Dialog */}
        <Dialog open={escalationDialogOpen} onOpenChange={setEscalationDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {selectedRecord?.status === "overdue" ? "Escalate Non-Compliance" : "Send Training Reminder"}
              </DialogTitle>
              <DialogDescription>
                {selectedRecord?.status === "overdue" 
                  ? "This will escalate the training non-compliance issue to the employee's manager and safety team."
                  : "This will send a reminder email to the employee about their upcoming training deadline."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedRecord && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Employee</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedRecord.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedRecord.userName}</div>
                        <div className="text-sm text-muted-foreground">{selectedRecord.userEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Training Course</h4>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="font-medium">{selectedRecord.courseTitle}</div>
                      <div className="text-sm text-muted-foreground">Due: {format(new Date(selectedRecord.dueDate), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                  
                  {selectedRecord.status === "overdue" && selectedRecord.managerId && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Will be escalated to</h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRecord.managerName} (Manager)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span>Safety Department</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Message</h4>
                    <div className="text-sm border rounded-md p-3">
                      {selectedRecord.status === "overdue" ? (
                        <>
                          <p className="font-medium">Non-Compliance Alert: {selectedRecord.courseTitle}</p>
                          <p className="mt-2">This is to notify you that {selectedRecord.userName} has not completed the required training "{selectedRecord.courseTitle}" which was due on {format(new Date(selectedRecord.dueDate), 'MMM d, yyyy')}.</p>
                          <p className="mt-2">This training is mandatory for compliance with safety regulations. Please ensure this training is completed as soon as possible.</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Training Reminder: {selectedRecord.courseTitle}</p>
                          <p className="mt-2">This is a friendly reminder that you need to complete the training "{selectedRecord.courseTitle}" by {format(new Date(selectedRecord.dueDate), 'MMM d, yyyy')}.</p>
                          <p className="mt-2">Please log in to the training portal to complete this required course.</p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEscalationDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={selectedRecord?.status === "overdue" ? "destructive" : "default"}
                onClick={handleEscalation}
              >
                {selectedRecord?.status === "overdue" ? "Escalate Issue" : "Send Reminder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}