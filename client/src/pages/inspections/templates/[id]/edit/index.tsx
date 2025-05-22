import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useLocation, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";

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
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  checklistItems: z.array(z.object({
    id: z.number().optional(),
    question: z.string().min(5, "Question must be at least 5 characters"),
    description: z.string().optional(),
    required: z.boolean().default(true),
    category: z.string().optional(),
    sortOrder: z.number(),
    isNew: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  })).min(1, "At least one checklist item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChecklistItem {
  id: number;
  templateId: number;
  question: string;
  description: string;
  category: string;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  createdById: number;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  checklistItems: ChecklistItem[];
}

export default function EditInspectionTemplate() {
  const { id } = useParams();
  const templateId = parseInt(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the template data
  const { data: template, isLoading, error } = useQuery<Template>({
    queryKey: [`/api/inspection-templates/${templateId}`],
    enabled: !isNaN(templateId),
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      checklistItems: [],
    },
  });

  // Update form when template data is loaded
  useEffect(() => {
    if (template) {
      form.reset({
        title: template.title,
        description: template.description,
        category: template.category,
        checklistItems: template.checklistItems.map((item, index) => ({
          id: item.id,
          question: item.question,
          description: item.description || "",
          required: item.required,
          category: item.category || "",
          sortOrder: item.sortOrder || index,
          isNew: false,
          isDeleted: false,
        })),
      });
    }
  }, [template, form]);

  // Setup for dynamic checklist items
  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: "checklistItems",
  });

  // Mutation for updating the template
  const updateTemplateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // First update the template details
      const response = await apiRequest("PUT", `/api/inspection-templates/${templateId}`, {
        title: data.title,
        description: data.description,
        category: data.category,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update template");
      }
      
      const updatedTemplate = await response.json();
      
      // Process checklist items
      const itemPromises = data.checklistItems.map(async (item, index) => {
        // For new items
        if (!item.id || item.isNew) {
          if (item.isDeleted) return null; // Skip deleted new items
          
          return apiRequest("POST", `/api/inspection-templates/${templateId}/checklist-items`, {
            question: item.question,
            description: item.description,
            required: item.required,
            category: item.category,
            sortOrder: index,
          });
        }
        
        // For deleted items
        if (item.isDeleted) {
          return apiRequest("DELETE", `/api/inspection-templates/${templateId}/checklist-items/${item.id}`);
        }
        
        // For updated items
        return apiRequest("PUT", `/api/inspection-templates/${templateId}/checklist-items/${item.id}`, {
          question: item.question,
          description: item.description,
          required: item.required,
          category: item.category,
          sortOrder: index,
        });
      });
      
      await Promise.all(itemPromises.filter(Boolean));
      
      return updatedTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspection-templates'] });
      queryClient.invalidateQueries({ queryKey: [`/api/inspection-templates/${templateId}`] });
      toast({
        title: "Success",
        description: "Inspection template updated successfully",
      });
      navigate(`/inspections/templates/${templateId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    updateTemplateMutation.mutate(data);
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

  // Mark item as deleted (or remove if it's new)
  const markItemForDeletion = (index: number) => {
    const item = form.getValues(`checklistItems.${index}`);
    
    if (item.isNew) {
      // If it's a new item, just remove it from the form
      remove(index);
    } else {
      // If it's an existing item, mark it for deletion
      update(index, { ...item, isDeleted: true });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !template) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Template Not Found</h2>
          <p className="text-muted-foreground mb-4">The inspection template you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button asChild>
            <Link href="/inspections/templates">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-2">
        <Button variant="ghost" asChild className="mr-2">
          <Link href={`/inspections/templates/${templateId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader 
        title={`Edit Template: ${template.title}`}
        description="Update this inspection template and its checklist items"
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Title</FormLabel>
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
                      value={field.value}
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
                  isNew: true,
                  isDeleted: false,
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No checklist items</p>
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
                      isNew: true,
                      isDeleted: false,
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                fields.map((field, index) => {
                  // Skip rendering deleted items
                  const isDeleted = form.getValues(`checklistItems.${index}.isDeleted`);
                  if (isDeleted) return null;
                  
                  return (
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
                              disabled={index === fields.filter(
                                (_, i) => !form.getValues(`checklistItems.${i}.isDeleted`)
                              ).length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markItemForDeletion(index)}
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
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sub-category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">None</SelectItem>
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
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/inspections/templates/${templateId}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}