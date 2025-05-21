import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowLeft, User, Calendar, Mail, Phone, HardHat, Building, ChevronRight, FileText, Clock } from "lucide-react";
import { formatRoleName, formatUTCToLocal, getInitials } from "@/lib/utils";

interface UserProfile {
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
  bio: string;
  emergencyContact: string;
  lastLogin: string;
  createdAt: string;
  certifications: string[];
}

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const userId = parseInt(params.id);
  
  // Fetch user profile data
  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: [`/api/users/${userId}`],
    enabled: !isNaN(userId),
  });

  // If no valid ID, redirect to users list
  useEffect(() => {
    if (isNaN(userId)) {
      navigate("/users");
    }
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
          </Button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
          </Button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Error Loading Profile</CardTitle>
            <CardDescription>
              We couldn't load this user's profile. Please try again or return to the users list.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/users")}>Return to Users List</Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
        </Button>
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center">
            <Avatar className="h-20 w-20 mr-6">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                <AvatarFallback className="bg-primary text-white text-xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <Badge 
                  variant={user.isActive ? "outline" : "destructive"} 
                  className={`ml-3 ${user.isActive ? "bg-green-100 text-success" : ""}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-lg text-muted-foreground">{user.jobTitle || "No job title"}</div>
              <div className="text-md text-muted-foreground mt-1">
                {user.department ? (
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1 opacity-70" />
                    {user.department}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center mt-3">
                <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                  {formatRoleName(user.role)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                    Member since {formatUTCToLocal(user.createdAt, "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            <Card className="md:col-span-4 mb-6 md:mb-0">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View and edit this user's personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user.firstName} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user.lastName} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={user.phone || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input id="emergencyContact" defaultValue={user.emergencyContact || ''} readOnly />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" className="min-h-[100px]" defaultValue={user.bio || ''} readOnly />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button disabled className="ml-auto">Edit Profile</Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>Employment and job details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" defaultValue={user.jobTitle || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue={user.department || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={formatRoleName(user.role)} readOnly />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Account Status</div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <Label htmlFor="account-status" className="font-normal cursor-pointer">
                      <div className="font-medium">Active Account</div>
                      <div className="text-sm text-muted-foreground">User can access the system</div>
                    </Label>
                    <Switch id="account-status" checked={user.isActive} disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button disabled className="ml-auto">Edit Work Info</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage user security and access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between bg-muted p-4 rounded-md">
                    <div>
                      <div className="font-medium">Reset Password</div>
                      <div className="text-sm text-muted-foreground">
                        Send a password reset email to this user
                      </div>
                    </div>
                    <Button variant="outline" disabled>Send Reset Link</Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-muted p-4 rounded-md">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Require additional security verification
                      </div>
                    </div>
                    <Switch disabled checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between bg-amber-50 p-4 rounded-md border border-amber-200">
                    <div>
                      <div className="font-medium flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        Suspend Account
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Temporarily disable this user's access
                      </div>
                    </div>
                    <Button variant="outline" disabled>Suspend</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground italic">
                  User activity logs will be displayed here. Feature coming soon.
                </div>

                {/* Placeholder content */}
                <div className="border rounded-md">
                  <div className="flex items-center p-3 border-b">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Profile Updated</div>
                      <div className="text-sm text-muted-foreground">Phone number changed</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatUTCToLocal(new Date().toISOString(), "MMM d, h:mm a")}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border-b">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">System Login</div>
                      <div className="text-sm text-muted-foreground">User logged in successfully</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatUTCToLocal(new Date(Date.now() - 24*60*60*1000).toISOString(), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center">
            <Skeleton className="h-20 w-20 rounded-full mr-6" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex mb-6">
        <Skeleton className="h-10 w-24 rounded-full mr-1" />
        <Skeleton className="h-10 w-24 rounded-full mr-1" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}