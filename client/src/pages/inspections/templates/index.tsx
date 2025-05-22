import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ClipboardCheck, Plus, Search, FileText } from "lucide-react";

import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUTCToLocal } from "@/lib/utils";

interface InspectionTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  checklistItemCount?: number;
}

export default function InspectionTemplates() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<InspectionTemplate[]>({
    queryKey: ['/api/inspection-templates'],
  });

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <Layout>
      <PageHeader 
        title="Inspection Templates" 
        description="Create and manage standardized safety inspection templates"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button asChild>
          <Link href="/inspections/templates/new">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border h-64"></div>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge
                    variant="outline"
                    className={`${categoryColors[template.category] || 'bg-gray-100 text-gray-800'} font-medium`}
                  >
                    {formatCategory(template.category)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {formatUTCToLocal(template.createdAt, "PPP")}
                  </div>
                </div>
                <CardTitle className="mt-2 line-clamp-2">{template.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{template.checklistItemCount || 0} checklist items</span>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-4">
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/inspections/templates/${template.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/inspections/new?templateId=${template.id}`}>
                      Start Inspection
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery ? "No templates match your search criteria. Try a different search term." : "Create your first inspection template to get started with standardized safety inspections."}
          </p>
          <Button asChild>
            <Link href="/inspections/templates/new">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Link>
          </Button>
        </div>
      )}
    </Layout>
  );
}