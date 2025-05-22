import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

// Schema validation for the form
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  checklistItems: z.array(z.object({
    question: z.string().min(5, "Question must be at least 5 characters"),
    description: z.string().optional(),
    required: z.boolean().default(true),
    category: z.string().optional(),
    sortOrder: z.number(),
  })).min(1, "At least one checklist item is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewInspectionTemplate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      checklistItems: [
        {
          question: "",
          description: "",
          required: true,
          category: "",
          sortOrder: 0,
        },
      ],
    },
  });

  // Setup for dynamic checklist items
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "checklistItems",
  });

  // Mutation for creating a new template
  const createTemplateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/inspection-templates", {
        name: data.name,
        description: data.description,
        category: data.category,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create template");
      }
      
      const template = await response.json();
      
      // Now create checklist items
      const itemPromises = data.checklistItems.map((item, index) => 
        apiRequest("POST", `/api/inspection-templates/${template.id}/checklist-items`, {
          ...item,
          sortOrder: index,
        })
      );
      
      await Promise.all(itemPromises);
      
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspection-templates'] });
      toast({
        title: "Success",
        description: "Inspection template created successfully",
      });
      navigate("/inspections/templates");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createTemplateMutation.mutate(data);
  };

  // Handle moving items up and down
  const moveItemUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const moveItemDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Create Inspection Template" 
        description="Design a standardized safety inspection template with checklist items"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Safety Inspection" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this inspection template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose and scope of this inspection template" 
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Safety</SelectItem>
                        <SelectItem value="fire">Fire Safety</SelectItem>
                        <SelectItem value="electrical">Electrical Safety</SelectItem>
                        <SelectItem value="machinery">Machinery & Equipment</SelectItem>
                        <SelectItem value="ppe">PPE Compliance</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="hazmat">Hazardous Materials</SelectItem>
                        <SelectItem value="fall">Fall Protection</SelectItem>
                        <SelectItem value="scaffolding">Scaffolding</SelectItem>
                        <SelectItem value="trenching">Trenching & Excavation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Checklist Items</CardTitle>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => append({
                  question: "",
                  description: "",
                  required: true,
                  category: "",
                  sortOrder: fields.length,
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No checklist items added yet</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => append({
                      question: "",
                      description: "",
                      required: true,
                      category: "",
                      sortOrder: 0,
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </div>
              )}

              {fields.map((field, index) => (
                <Card key={field.id} className="border border-muted">
                  <CardHeader className="bg-muted/30 py-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Item #{index + 1}</div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveItemDown(index)}
                          disabled={index === fields.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name={`checklistItems.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question/Item</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Are fire extinguishers properly mounted and accessible?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`checklistItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description/Guidance</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional details or guidance for inspectors" 
                              className="min-h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between items-center">
                      <FormField
                        control={form.control}
                        name={`checklistItems.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Required item</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`checklistItems.${index}.category`}
                        render={({ field }) => (
                          <FormItem className="w-48">
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sub-category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="documentation">Documentation</SelectItem>
                                <SelectItem value="visual">Visual Inspection</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/inspections/templates")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}