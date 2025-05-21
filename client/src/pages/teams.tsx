import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Team } from "@shared/schema";
import { requirePermission } from "@/lib/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function Teams() {
  requirePermission("teams", "read");
  const [, navigate] = useLocation();
  
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title="Teams"
          description="Manage your construction teams"
          actions={
            requirePermission("teams", "create", false) ? (
              <Button size="sm" onClick={() => navigate("/teams/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            ) : null
          }
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : teams && teams.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Name</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: team.color || "#3B82F6" }}
                            ></div>
                            {team.name}
                          </div>
                        </TableCell>
                        <TableCell>Site #{team.siteId}</TableCell>
                        <TableCell>{team.memberCount || 0}</TableCell>
                        <TableCell>
                          {team.leaderId ? `Leader #${team.leaderId}` : "Unassigned"}
                        </TableCell>
                        <TableCell>{formatDate(team.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/teams/${team.id}`)}
                          >
                            View
                          </Button>
                          {requirePermission("teams", "update", false) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/teams/${team.id}/edit`)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No teams found</p>
                {requirePermission("teams", "create", false) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate("/teams/create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}