import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2, 
  FileText,
  Check,
  X
} from "lucide-react";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatUTCToLocal } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: number;
  section_id: number;
  question: string;
  description: string;
  category: string;
  required: boolean;
  order: number;
  type: string;
  options: any;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: number;
  template_id: number;
  name: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  items: Item[];
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  created_by_id: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_default: boolean;
  version: string;
  sections: Section[];
}

export default function InspectionTemplateDetail() {
  const { id } = useParams();
  const templateId = parseInt(id);
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: template, isLoading, error } = useQuery<Template>({
    queryKey: [`/api/inspection-templates/${templateId}`],
    enabled: !isNaN(templateId),
  });

  // Categories with corresponding colors
  const categoryColors: Record<string, string> = {
    'general': 'bg-blue-100 text-blue-800',
    'fire': 'bg-red-100 text-red-800',
    'electrical': 'bg-yellow-100 text-yellow-800',
    'machinery': 'bg-purple-100 text-purple-800',
    'ppe': 'bg-green-100 text-green-800',
    'environmental': 'bg-emerald-100 text-emerald-800',
    'hazmat': 'bg-orange-100 text-orange-800',
    'fall': 'bg-amber-100 text-amber-800',
    'scaffolding': 'bg-indigo-100 text-indigo-800',
    'trenching': 'bg-rose-100 text-rose-800',
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group checklist items by category
  const groupedItems = template?.checklistItems.reduce<Record<string, ChecklistItem[]>>((groups, item) => {
    const category = item.category || 'uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Get category item classes
  const getItemCategoryClass = (category?: string) => {
    switch(category) {
      case 'critical': return 'border-l-4 border-red-500';
      case 'important': return 'border-l-4 border-amber-500';
      case 'general': return 'border-l-4 border-blue-500';
      case 'documentation': return 'border-l-4 border-purple-500';
      case 'visual': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  // Format item category for display
  const formatItemCategory = (category?: string) => {
    if (!category) return null;
    return category.charAt(0).toUpperCase() + category.slice(1);
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
          <p className="text-muted-foreground mb-4">The inspection template you're looking for doesn't exist or you don't have permission to view it.</p>
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
          <Link href="/inspections/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <PageHeader 
            title={template.title}
            description={template.description}
          />
          <div className="flex items-center mt-2 space-x-4">
            <Badge
              className={`${categoryColors[template.category] || 'bg-gray-100 text-gray-800'} font-medium`}
            >
              {formatCategory(template.category)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {formatUTCToLocal(template.createdAt, "PPP")}
            </span>
            <span className="text-sm text-muted-foreground">
              {template.checklistItems.length} checklist items
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/inspections/new?templateId=${template.id}`}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Start Inspection
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/inspections/templates/${template.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Inspection Template</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this template? This action cannot be undone and will 
                  remove all associated checklist items. Active inspections using this template will not be affected.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    // Handle deletion logic here
                    toast({
                      title: "Template deleted",
                      description: "The template has been permanently deleted.",
                    });
                    navigate("/inspections/templates");
                  }}
                >
                  Delete Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Checklist Items</CardTitle>
          <CardDescription>
            Items are organized by category and will be presented in this order during inspections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.checklistItems.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">No checklist items found for this template.</p>
            </div>
          ) : groupedItems ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium mb-3 capitalize">
                    {category === 'uncategorized' ? 'General Items' : formatItemCategory(category)}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-md bg-background shadow-sm ${getItemCategoryClass(item.category)}`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-foreground">{item.question}</h4>
                          <div className="flex items-center space-x-2">
                            {item.required ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Required
                              </Badge>
                            ) : (
                              <Badge variant="outline">Optional</Badge>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Layout>
  );
}