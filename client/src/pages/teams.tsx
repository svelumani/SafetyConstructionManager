import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, RefreshCw, Search } from "lucide-react";

import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Team } from "@shared/schema";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { requirePermission } from "@/lib/permissions";

export default function TeamsPage() {
  requirePermission("teams", "read");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: teams,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const filteredTeams = teams?.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-6">
        <PageHeader
          title="Teams"
          description="Manage teams across your sites"
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" asChild>
                <Link href="/teams/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Link>
              </Button>
            </div>
          }
        />

        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="mb-4">
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                prefix={<Search className="h-4 w-4 text-gray-500" />}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeletons for teams
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-5 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-[100px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTeams && filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" onClick={() => navigate(`/teams/${team.id}`)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {team.color && (
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: team.color }}
                              />
                            )}
                            {team.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/sites/${team.siteId}`} className="text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                            Site #{team.siteId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {team.leaderId ? (
                            <Link href={`/users/${team.leaderId}`} className="text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                              Leader #{team.leaderId}
                            </Link>
                          ) : (
                            <Badge variant="outline">No Leader</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge>{0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/teams/${team.id}/edit`}>Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? (
                          <>No teams match your search query.</>
                        ) : (
                          <>No teams found. <Link href="/teams/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create your first team</Link>.</>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}