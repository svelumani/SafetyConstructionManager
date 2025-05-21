import React from 'react';
import SiteTeams from './site-teams';

interface SiteTeamsTabProps {
  siteId: number;
}

export default function SiteTeamsTab({ siteId }: SiteTeamsTabProps) {
  return (
    <div className="space-y-8">
      <SiteTeams siteId={siteId} />
    </div>
  );
}