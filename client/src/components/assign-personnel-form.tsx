import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Define schema for site personnel
const sitePersonnelSchema = z.object({
  userId: z.string().min(1, { message: "User is required" }),
  siteRole: z.string().min(1, { message: "Role is required" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  teamId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof sitePersonnelSchema>;

interface AssignPersonnelFormProps {
  siteId: number;
  teams?: any[];
  onSuccess: () => void;
}

export default function AssignPersonnelForm({ siteId, teams = [], onSuccess }: AssignPersonnelFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addToTeam, setAddToTeam] = useState(false);

  // Fetch all users that are not yet assigned to this site
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users', { unassigned: true, siteId }],
    queryFn: () => fetch(`/api/users?unassigned=true&siteId=${siteId}`).then(res => res.json()),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(sitePersonnelSchema),
    defaultValues: {
      userId: '',
      siteRole: '',
      notes: '',
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        userId: parseInt(data.userId),
        teamId: data.teamId ? parseInt(data.teamId) : null,
        siteId,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : null,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
      };
      
      const response = await fetch(`/api/sites/${siteId}/personnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign personnel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Personnel successfully assigned to site',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', { unassigned: true, siteId }] });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    assignMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Personnel to Site</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    disabled={isLoadingUsers || assignMutation.isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading">Loading users...</SelectItem>
                      ) : !users || users.length === 0 ? (
                        <SelectItem value="none" disabled>No available users</SelectItem>
                      ) : (
                        users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="siteRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={assignMutation.isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="site_manager">Site Manager</SelectItem>
                      <SelectItem value="safety_coordinator">Safety Coordinator</SelectItem>
                      <SelectItem value="foreman">Foreman</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={assignMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={assignMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="addToTeam"
                checked={addToTeam}
                onCheckedChange={(checked) => {
                  setAddToTeam(checked as boolean);
                  if (!checked) {
                    form.setValue('teamId', '');
                  }
                }}
                disabled={teams.length === 0 || assignMutation.isPending}
              />
              <label
                htmlFor="addToTeam"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Add to Team {teams.length === 0 && '(No teams available for this site)'}
              </label>
            </div>
            
            {addToTeam && (
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select
                      disabled={assignMutation.isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this assignment"
                      disabled={assignMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  assignMutation.isPending ||
                  isLoadingUsers ||
                  !form.formState.isValid
                }
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign Personnel'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}