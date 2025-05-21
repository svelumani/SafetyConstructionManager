import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const siteRoles = [
  { value: "site_manager", label: "Site Manager" },
  { value: "safety_coordinator", label: "Safety Coordinator" },
  { value: "foreman", label: "Foreman" },
  { value: "worker", label: "Worker" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "visitor", label: "Visitor" },
];

// Form schema for validation
const formSchema = z.object({
  userId: z.number({
    required_error: "User is required",
  }),
  siteRole: z.string({
    required_error: "Site role is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  notes: z.string().optional(),
  assignToTeam: z.boolean().default(false),
  teamId: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignPersonnelFormProps {
  siteId: number;
  teamId?: number;
  onSuccess?: () => void;
  availableUsers: Array<{ id: number; name: string; email: string }>;
  availableTeams?: Array<{ id: number; name: string }>;
  defaultValues?: Partial<FormValues>;
}

export function AssignPersonnelForm({
  siteId,
  teamId,
  onSuccess,
  availableUsers,
  availableTeams = [],
  defaultValues,
}: AssignPersonnelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: defaultValues?.userId,
      siteRole: defaultValues?.siteRole || "worker",
      startDate: defaultValues?.startDate || new Date(),
      endDate: defaultValues?.endDate,
      notes: defaultValues?.notes || "",
      assignToTeam: Boolean(teamId) || defaultValues?.assignToTeam || false,
      teamId: teamId || defaultValues?.teamId,
    },
  });

  const watchAssignToTeam = form.watch("assignToTeam");

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        siteId,
        startDate: values.startDate ? format(values.startDate, "yyyy-MM-dd") : null,
        endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
        teamId: values.assignToTeam ? values.teamId : null,
      };

      const res = await apiRequest("POST", "/api/site-personnel", payload);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to assign personnel");
      }

      toast({
        title: "Success",
        description: "Personnel assigned successfully",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] });
      if (values.assignToTeam && values.teamId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/teams/${values.teamId}/personnel`] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The user to be assigned to this site
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siteRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {siteRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The role of the user at this site
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date when the user starts working on this site
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Expected end date (leave blank if indefinite)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional information about this assignment"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any additional details about this assignment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {availableTeams.length > 0 && (
          <>
            <FormField
              control={form.control}
              name="assignToTeam"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Assign to Team</FormLabel>
                    <FormDescription>
                      Add this person to a team within the site
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {watchAssignToTeam && (
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The team this person will be assigned to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Personnel"
          )}
        </Button>
      </form>
    </Form>
  );
}