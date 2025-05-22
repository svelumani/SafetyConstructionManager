import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Hazards from "@/pages/hazards";
import Inspections from "@/pages/inspections";
import Permits from "@/pages/permits";
import Incidents from "@/pages/incidents";
import Training from "@/pages/training";
import SafetyScores from "@/pages/safety-scores";
import Users from "@/pages/users";
import UserProfile from "@/pages/user-profile";
import Sites from "@/pages/sites";
import TenantRegistration from "@/pages/tenant-registration";
import NewSitePage from "@/pages/sites/new";
import SiteDetailPage from "@/pages/sites/id";
import Teams from "@/pages/teams";
import CreateTeamPage from "@/pages/teams/create";
import TeamDetailPage from "@/pages/teams/[id]";
import EditTeamPage from "@/pages/teams/[id]/edit";
import { ProtectedRoute, SuperAdminRoute } from "@/components/protected-route";
import AddSitePersonnel from "@/pages/sites/personnel/add";
import AddTeamMember from "@/pages/teams/members/add";
// Import hazard-specific pages
import NewHazardReport from "@/pages/hazards/new";
import HazardDetail from "@/pages/hazards/[id]";
import AssignHazard from "@/pages/hazards/[id]/assign";
import HazardAnalytics from "@/pages/hazards/analytics-redesigned";
import InspectionAnalytics from "@/pages/inspections/analytics";
// Import inspection-specific pages
import InspectionTemplates from "@/pages/inspections/templates";
import NewInspectionTemplate from "@/pages/inspections/templates/new";
import InspectionTemplateDetail from "@/pages/inspections/templates/[id]";
import NewInspection from "@/pages/inspections/new";
import InspectionDetail from "@/pages/inspections/[id]";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/tenant-registration" component={TenantRegistration} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* Hazard management routes */}
      <ProtectedRoute path="/hazards" component={Hazards} />
      <ProtectedRoute path="/hazards/new" component={NewHazardReport} />
      <ProtectedRoute path="/hazards/analytics" component={HazardAnalytics} />
      <ProtectedRoute path="/hazards/:id/assign" component={AssignHazard} />
      <ProtectedRoute path="/hazards/:id" component={HazardDetail} />
      
      {/* Inspection management routes */}
      <ProtectedRoute path="/inspections" component={Inspections} />
      <ProtectedRoute path="/inspections/analytics" component={InspectionAnalytics} />
      <ProtectedRoute path="/inspections/templates" component={InspectionTemplates} />
      <ProtectedRoute path="/inspections/templates/new" component={NewInspectionTemplate} />
      <ProtectedRoute path="/inspections/templates/:id" component={InspectionTemplateDetail} />
      <ProtectedRoute path="/inspections/new" component={NewInspection} />
      <ProtectedRoute path="/inspections/:id" component={InspectionDetail} />
      
      <ProtectedRoute path="/permits" component={Permits} />
      <ProtectedRoute path="/incidents" component={Incidents} />
      <ProtectedRoute path="/training" component={Training} />
      <ProtectedRoute path="/safety-scores" component={SafetyScores} />
      <ProtectedRoute path="/users" component={Users} />
      <ProtectedRoute path="/users/:id" component={UserProfile} />
      <ProtectedRoute path="/sites" component={Sites} />
      <ProtectedRoute path="/sites/new" component={NewSitePage} />
      <ProtectedRoute path="/sites/:id" component={SiteDetailPage} />
      <ProtectedRoute path="/sites/:id/personnel/add" component={AddSitePersonnel} />
      
      {/* Team management routes */}
      <ProtectedRoute path="/teams" component={Teams} />
      <ProtectedRoute path="/teams/create" component={CreateTeamPage} />
      <ProtectedRoute path="/teams/:id/edit" component={EditTeamPage} />
      <ProtectedRoute path="/teams/:id/members/add" component={AddTeamMember} />
      <ProtectedRoute path="/teams/:id" component={TeamDetailPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
