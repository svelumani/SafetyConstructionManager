import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Edit, 
  Users, 
  ArrowLeft, 
  Building2, 
  User as UserIcon, 
  Calendar, 
  HardHat
} from "lucide-react";

import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team, User, Site } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/lib/permissions";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TeamDetailPage() {
  requirePermission("teams", "read");
  const params = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const teamId = parseInt(params.id);

  // Fetch team data
  const { data: team, isLoading: isLoadingTeam } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !isNaN(teamId),
  });

  // Fetch team members
  const { data: members, isLoading: isLoadingMembers } = useQuery<any[]>({
    queryKey: [`/api/teams/${teamId}/members`],
    enabled: !isNaN(teamId),
  });

  // Fetch site data
  const { data: site } = useQuery<Site>({
    queryKey: [`/api/sites/${team?.siteId}`],
    enabled: !!team?.siteId,
  });

  // Fetch team leader data
  const { data: leader } = useQuery<User>({
    queryKey: [`/api/users/${team?.leaderId}`],
    enabled: !!team?.leaderId,
  });

  if (isLoadingTeam) {
    return (
      <Layout>
        <div className="container py-6">
          <PageHeader
            title={<Skeleton className="h-8 w-48" />}
            description={<Skeleton className="h-4 w-64" />}
          />
          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!team && !isLoadingTeam) {
    return (
      <Layout>
        <div className="container py-6">
          <PageHeader
            title="Team Not Found"
            description="The requested team could not be found"
            actions={
              <Button variant="outline" size="sm" onClick={() => navigate("/teams")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Button>
            }
          />
          <Card className="mt-6 p-6 text-center">
            <p className="mb-4">The team you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate("/teams")}>Go to Team List</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title={team?.name || "Team Details"}
          description={team?.description || "Team information"}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/teams")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Button>
              {requirePermission("teams", "update", false) && (
                <Button size="sm" asChild>
                  <a href={`/teams/${teamId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Team
                  </a>
                </Button>
              )}
            </div>
          }
        />

        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">
              Members {members && members.length > 0 && `(${members.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {site ? (
                    <div>
                      <h3 className="font-medium">{site.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{site.address}</p>
                      <p className="text-sm text-muted-foreground mt-1">Status: {site.status}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Site #{team?.siteId}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    Team Leader
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leader ? (
                    <div>
                      <h3 className="font-medium">{leader.firstName} {leader.lastName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{leader.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">Role: {leader.role}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {team?.leaderId ? `Leader #${team.leaderId}` : "No leader assigned"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Team Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="flex items-center mt-2">
                      <div className="text-sm font-medium">Team Color:</div>
                      <div 
                        className="w-6 h-6 rounded-full ml-2" 
                        style={{ backgroundColor: team?.color || "#3B82F6" }}
                      />
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Created:</span> {team?.createdAt ? formatDate(team.createdAt) : "N/A"}
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Members:</span> {members?.length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {team?.specialties && Object.keys(team.specialties as object).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(team.specialties as object).map(([key, value]) => (
                      <Badge key={key} className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.userName}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 items-center">
                                <HardHat className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{member.siteRole}</span>
                              </div>
                            </TableCell>
                            <TableCell>{member.userEmail}</TableCell>
                            <TableCell>{member.startDate ? formatDate(member.startDate) : "N/A"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={`/sites/${team.siteId}/personnel/${member.id}/edit`}>
                                  View Details
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No members assigned to this team yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate(`/sites/${team?.siteId}/personnel/add`)}
                    >
                      Assign Personnel to Team
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