import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import AssignPersonnelForm from './assign-personnel-form';
import { useToast } from '@/hooks/use-toast';

interface SitePersonnelListProps {
  siteId: number;
  siteName: string;
}

export default function SitePersonnelList({ siteId, siteName }: SitePersonnelListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [personnelToRemove, setPersonnelToRemove] = useState<number | null>(null);

  // Fetch site personnel
  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/sites/${siteId}/personnel`],
  });

  // Remove personnel mutation
  const removeMutation = useMutation({
    mutationFn: async (personnelId: number) => {
      const res = await apiRequest('DELETE', `/api/site-personnel/${personnelId}`);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      setPersonnelToRemove(null);
      toast({
        title: 'Personnel removed',
        description: 'The team member has been removed from this site.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove personnel',
        description: 'There was an error removing the team member. Please try again.',
        variant: 'destructive',
      });
      console.error('Error removing personnel:', error);
    },
  });

  // Format site role for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
  };

  // Get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'site_manager':
        return 'bg-blue-500';
      case 'safety_coordinator':
        return 'bg-green-500';
      case 'foreman':
        return 'bg-amber-500';
      case 'worker':
        return 'bg-slate-500';
      case 'subcontractor':
        return 'bg-purple-500';
      case 'visitor':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRemovePersonnel = (id: number) => {
    setPersonnelToRemove(id);
  };

  const confirmRemovePersonnel = () => {
    if (personnelToRemove) {
      removeMutation.mutate(personnelToRemove);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Site Personnel</CardTitle>
            <CardDescription>Manage the team members assigned to this site</CardDescription>
          </div>
          <Button onClick={() => setIsAssignDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Personnel
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load personnel data
            </div>
          ) : data?.personnel?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.personnel.map((person: any) => {
                  // Find the user data
                  const startDate = new Date(person.startDate);
                  const endDate = person.endDate ? new Date(person.endDate) : null;
                  
                  return (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.userName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(person.role)}>
                          {formatRole(person.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(startDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {endDate ? format(endDate, 'MMM d, yyyy') : 'Ongoing'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {person.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePersonnel(person.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No personnel assigned to this site yet.
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign First Team Member
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Personnel Dialog */}
      <AssignPersonnelForm
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        siteId={siteId}
        siteName={siteName}
      />

      {/* Confirmation Dialog for Removing Personnel */}
      <AlertDialog
        open={!!personnelToRemove}
        onOpenChange={(open) => !open && setPersonnelToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Personnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member from the site? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemovePersonnel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}