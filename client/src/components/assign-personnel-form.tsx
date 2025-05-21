import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import { apiRequest } from "@/lib/queryClient"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

const formSchema = z.object({
  userId: z.number().positive(),
  siteRole: z.enum([
    "site_manager",
    "safety_coordinator",
    "foreman",
    "worker",
    "subcontractor",
    "visitor",
  ]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  teamId: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type FormValues = z.infer<typeof formSchema>

interface AssignPersonnelFormProps {
  siteId: number
  userId: number
  defaultValues?: Partial<FormValues>
  teams?: { id: number; name: string }[]
  onSuccess?: () => void
}

function AssignPersonnelForm({
  siteId,
  userId,
  defaultValues = {},
  teams = [],
  onSuccess,
}: AssignPersonnelFormProps) {
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      siteRole: "worker",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      teamId: null,
      notes: null,
      ...defaultValues,
    },
  })

  const assignMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", `/api/sites/${siteId}/personnel`, values)
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to assign personnel")
      }
      return await response.json()
    },
    onSuccess: () => {
      toast({
        title: "Personnel assigned",
        description: "Personnel has been successfully assigned to this site.",
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/personnel`] })
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}`] })
      
      if (onSuccess) {
        onSuccess()
      } else {
        setLocation(`/sites/${siteId}`)
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign personnel",
        variant: "destructive",
      })
    },
  })

  function onSubmit(values: FormValues) {
    assignMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
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

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
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
            <FormItem>
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {teams.length > 0 && (
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Team (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                  defaultValue={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No team</SelectItem>
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
                  placeholder="Enter any additional notes about this assignment"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setLocation(`/sites/${siteId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={assignMutation.isPending}>
            {assignMutation.isPending ? "Assigning..." : "Assign Personnel"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AssignPersonnelForm
export { AssignPersonnelForm }