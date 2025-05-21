import { useState } from "react";
import Layout from "@/components/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Users as UsersIcon, 
  Plus, 
  Filter,
  UserCog,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { cn, formatRoleName, formatUTCToLocal } from "@/lib/utils";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  jobTitle: string;
  department: string;
  profileImageUrl: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export default function Users() {
  const [activeTab, setActiveTab] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery<{ users: User[], total: number }>({
    queryKey: ['/api/users', { 
      limit: pageSize, 
      offset: pageIndex * pageSize,
      role: activeTab !== "all" ? activeTab : undefined
    }],
  });

  const users = data?.users || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const columns = [
    {
      header: "User",
      accessorKey: "user",
      cell: (item: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {item.profileImageUrl ? (
              <img src={item.profileImageUrl} alt={`${item.firstName} ${item.lastName}`} />
            ) : (
              <AvatarFallback className="bg-primary text-white">
                {getInitials(item.firstName, item.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{item.firstName} {item.lastName}</div>
            <div className="text-sm text-muted-foreground">{item.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (item: User) => formatRoleName(item.role),
    },
    {
      header: "Job Title",
      accessorKey: "jobTitle",
      cell: (item: User) => item.jobTitle || "—",
    },
    {
      header: "Contact",
      accessorKey: "contact",
      cell: (item: User) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{item.email}</span>
          </div>
          {item.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{item.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item: User) => (
        <Badge variant={item.isActive ? "outline" : "destructive"} className={item.isActive ? "bg-green-100 text-success" : ""}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin",
      cell: (item: User) => formatUTCToLocal(item.lastLogin) || "Never",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: User) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/users/${item.id}`}>
              <UserCog className="h-4 w-4 mr-1" /> Manage
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Users & Teams" description="Manage users, roles, and permissions across your organization">
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Link>
        </Button>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="safety_officer">Safety Officers</TabsTrigger>
              <TabsTrigger value="supervisor">Supervisors</TabsTrigger>
              <TabsTrigger value="subcontractor">Subcontractors</TabsTrigger>
              <TabsTrigger value="employee">Employees</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DataTable
            columns={columns}
            data={users}
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
                <UsersIcon className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No users found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/users/new">Add user</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
