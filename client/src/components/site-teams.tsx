import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PlusCircle, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SiteTeamsProps {
  siteId: number;
}

export default function SiteTeams({ siteId }: SiteTeamsProps) {
  const { user } = useAuth();
  
  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams', { siteId }],
    queryFn: ({ signal }) => 
      fetch(`/api/teams?siteId=${siteId}`, { signal })
        .then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Site Teams</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const canCreateTeam = user?.role === 'superAdmin' || user?.role === 'safetyOfficer';

  if (!teams || teams.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Site Teams</h3>
          {canCreateTeam && (
            <Button asChild>
              <Link to={`/teams/create?siteId=${siteId}`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </Link>
            </Button>
          )}
        </div>
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Teams Found</h3>
          <p className="text-muted-foreground mt-2">
            There are no teams assigned to this site yet.
          </p>
          {canCreateTeam && (
            <Button variant="outline" className="mt-4" asChild>
              <Link to={`/teams/create?siteId=${siteId}`}>
                Create your first team
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Site Teams ({teams.length})</h3>
        {canCreateTeam && (
          <Button asChild>
            <Link to={`/teams/create?siteId=${siteId}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team: any) => (
          <Card key={team.id} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{team.name}</CardTitle>
                <Badge variant={team.isActive ? "default" : "secondary"}>
                  {team.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {team.specialty || "General"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="text-muted-foreground">{formatDate(team.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Members:</span>
                  <span className="text-muted-foreground">{team.memberCount || 0}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  asChild
                >
                  <Link to={`/teams/${team.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}