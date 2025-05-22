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
  sections: z.array(z.object({
    name: z.string().min(3, "Section name must be at least 3 characters"),
    description: z.string().optional(),
    order: z.number(),
    items: z.array(z.object({
      question: z.string().min(5, "Question must be at least 5 characters"),
      type: z.enum(['yes_no', 'multiple_choice', 'checkbox', 'numeric', 'text']).default('yes_no'),
      description: z.string().optional(),
      required: z.boolean().default(true),
      category: z.string().optional(),
      options: z.array(z.string()).optional().nullable(),
      order: z.number(),
    })).min(1, "At least one item is required in each section"),
  })).min(1, "At least one section is required"),
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
      sections: [
        {
          name: "General Safety",
          description: "Basic safety checks for the site",
          order: 0,
          items: [
            {
              question: "",
              description: "",
              type: "yes_no",
              required: true,
              category: "",
              options: null,
              order: 0,
            },
          ],
        },
      ],
    },
  });

  // Setup for dynamic sections and items
  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  // Mutation for creating a new template
  const createTemplateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // First create the template
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
      
      // Create sections and their items
      for (let sectionIndex = 0; sectionIndex < data.sections.length; sectionIndex++) {
        const section = data.sections[sectionIndex];
        
        // Create section
        const sectionResponse = await apiRequest("POST", "/api/inspection-sections", {
          templateId: template.id,
          name: section.name,
          description: section.description,
          order: sectionIndex,
        });
        
        if (!sectionResponse.ok) {
          throw new Error("Failed to create section");
        }
        
        const createdSection = await sectionResponse.json();
        
        // Now create items for this section
        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];
          
          await apiRequest("POST", "/api/inspection-items", {
            sectionId: createdSection.id,
            question: item.question,
            description: item.description,
            type: item.type || "yes_no",
            required: item.required,
            category: item.category,
            options: item.options,
            order: itemIndex,
          });
        }
      }
      
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
              <CardTitle>Sections</CardTitle>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => appendSection({
                  name: `Section ${sectionFields.length + 1}`,
                  description: "",
                  order: sectionFields.length,
                  items: [
                    {
                      question: "",
                      description: "",
                      required: true,
                      category: "",
                      order: 0,
                    }
                  ]
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {sectionFields.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No sections added yet</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => appendSection({
                      name: "General Safety",
                      description: "Basic safety checks for the site",
                      order: 0,
                      items: [
                        {
                          question: "",
                          description: "",
                          required: true,
                          category: "",
                          order: 0,
                        }
                      ]
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Section
                  </Button>
                </div>
              )}

              {sectionFields.map((sectionField, sectionIndex) => {
                // Create field array for items within this section
                const { fields: itemFields, append: appendItem, remove: removeItem, move: moveItem } = useFieldArray({
                  control: form.control,
                  name: `sections.${sectionIndex}.items`,
                });

                return (
                  <Card key={sectionField.id} className="border border-muted">
                    <CardHeader className="bg-muted/20 py-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-lg">Section #{sectionIndex + 1}</div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => moveSection(sectionIndex, Math.max(0, sectionIndex - 1))}
                            disabled={sectionIndex === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => moveSection(sectionIndex, Math.min(sectionFields.length - 1, sectionIndex + 1))}
                            disabled={sectionIndex === sectionFields.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSection(sectionIndex)}
                            disabled={sectionFields.length <= 1}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`sections.${sectionIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Fire Safety Checks" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`sections.${sectionIndex}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief description of this section" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold">Checklist Items</h4>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => appendItem({
                              question: "",
                              description: "",
                              required: true,
                              category: "",
                              order: itemFields.length,
                            })}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Add Item
                          </Button>
                        </div>
                      
                        {itemFields.length === 0 && (
                          <div className="text-center py-4 border border-dashed rounded-md">
                            <p className="text-muted-foreground text-sm">No items in this section</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="mt-2"
                              onClick={() => appendItem({
                                question: "",
                                description: "",
                                required: true,
                                category: "",
                                order: 0,
                              })}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add First Item
                            </Button>
                          </div>
                        )}

                        {itemFields.map((itemField, itemIndex) => (
                          <Card key={itemField.id} className="border border-muted">
                            <CardHeader className="bg-muted/10 py-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Item #{itemIndex + 1}</div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => moveItem(itemIndex, Math.max(0, itemIndex - 1))}
                                    disabled={itemIndex === 0}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => moveItem(itemIndex, Math.min(itemFields.length - 1, itemIndex + 1))}
                                    disabled={itemIndex === itemFields.length - 1}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeItem(itemIndex)}
                                    disabled={itemFields.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-3">
                              <FormField
                                control={form.control}
                                name={`sections.${sectionIndex}.items.${itemIndex}.question`}
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
                                name={`sections.${sectionIndex}.items.${itemIndex}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description/Guidance</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Additional details or guidance for inspectors" 
                                        className="min-h-16"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {/* Show options field for multiple choice or checkbox questions */}
                              {(form.watch(`sections.${sectionIndex}.items.${itemIndex}.type`) === 'multiple_choice' || 
                                form.watch(`sections.${sectionIndex}.items.${itemIndex}.type`) === 'checkbox') && (
                                <FormField
                                  control={form.control}
                                  name={`sections.${sectionIndex}.items.${itemIndex}.options`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Options</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Enter options, one per line (e.g. Option 1&#10;Option 2&#10;Option 3)" 
                                          className="min-h-24"
                                          value={field.value ? Array.isArray(field.value) ? field.value.join('\n') : field.value : ''}
                                          onChange={(e) => {
                                            const options = e.target.value.split('\n').filter(o => o.trim());
                                            field.onChange(options.length > 0 ? options : null);
                                          }}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter each option on a new line. These will be presented as choices to the inspector.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormField
                                  control={form.control}
                                  name={`sections.${sectionIndex}.items.${itemIndex}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question Type</FormLabel>
                                      <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value || "yes_no"}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select question type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="yes_no">Yes/No</SelectItem>
                                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                          <SelectItem value="checkbox">Checkboxes</SelectItem>
                                          <SelectItem value="numeric">Numeric Input</SelectItem>
                                          <SelectItem value="text">Text Input</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormDescription>
                                        How inspectors will respond to this question
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`sections.${sectionIndex}.items.${itemIndex}.category`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category</FormLabel>
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
                              
                              <div className="flex justify-between items-center">
                                <FormField
                                  control={form.control}
                                  name={`sections.${sectionIndex}.items.${itemIndex}.required`}
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
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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