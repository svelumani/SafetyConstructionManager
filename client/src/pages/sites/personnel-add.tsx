import React from 'react';
import { useParams, useLocation } from 'wouter';
import Layout from '@/components/layout';
import PageHeader from '@/components/page-header';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import AssignPersonnelForm from '@/components/assign-personnel-form';

export default function AddSitePersonnelPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const siteId = parseInt(params.id);

  const { data: site, isLoading: isLoadingSite } = useQuery({
    queryKey: [`/api/sites/${siteId}`],
    queryFn: () => fetch(`/api/sites/${siteId}`).then(res => res.json()),
  });

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => fetch('/api/teams').then(res => res.json()),
  });

  // Filter teams for this site
  const siteTeams = teams?.filter(team => team.site_id === siteId) || [];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={() => navigate(`/sites/${siteId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
        </Button>
        
        {isLoadingSite ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <PageHeader 
              title={`Add Personnel to ${site?.name || 'Site'}`} 
              subtitle="Assign users to this site and manage their roles"
            />
            
            <div className="mt-8">
              <AssignPersonnelForm 
                siteId={siteId} 
                teams={siteTeams}
                onSuccess={() => navigate(`/sites/${siteId}`)}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}