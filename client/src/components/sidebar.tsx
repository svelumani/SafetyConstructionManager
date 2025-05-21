import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import {
  Home,
  AlertTriangle,
  ClipboardCheck,
  SquareStack,
  Cross,
  GraduationCap,
  Trophy,
  Users,
  Building2,
  Settings,
  Building,
  Heart,
  ScrollText,
  LineChart,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [activePath, setActivePath] = useState(location);

  // Track active path
  useEffect(() => {
    setActivePath(location);
  }, [location]);

  // Items for Super Admin
  const superAdminItems = [
    { label: 'Dashboard', icon: <Home className="mr-3 text-lg" />, path: '/super-admin' },
    { label: 'Tenants', icon: <Building className="mr-3 text-lg" />, path: '/super-admin/tenants' },
    { label: 'Templates', icon: <ScrollText className="mr-3 text-lg" />, path: '/super-admin/templates' },
    { label: 'System Logs', icon: <LineChart className="mr-3 text-lg" />, path: '/super-admin/logs' },
  ];

  // Items for Safety Officers and other users
  const mainItems = [
    { label: 'Overview', icon: <Home className="mr-3 text-lg" />, path: '/dashboard' },
  ];

  const safetyItems = [
    { label: 'Hazard Reporting', icon: <AlertTriangle className="mr-3 text-lg" />, path: '/hazards' },
    { label: 'Inspections', icon: <ClipboardCheck className="mr-3 text-lg" />, path: '/inspections' },
    { label: 'Permits & Tickets', icon: <SquareStack className="mr-3 text-lg" />, path: '/permits' },
    { label: 'Incident Reports', icon: <Cross className="mr-3 text-lg" />, path: '/incidents' },
  ];

  const trainingItems = [
    { label: 'Onboarding LMS', icon: <GraduationCap className="mr-3 text-lg" />, path: '/training' },
    { label: 'Safety Scores', icon: <Trophy className="mr-3 text-lg" />, path: '/safety-scores' },
  ];

  const adminItems = [
    { label: 'Users & Teams', icon: <Users className="mr-3 text-lg" />, path: '/users' },
    { label: 'Sites', icon: <Building2 className="mr-3 text-lg" />, path: '/sites' },
    { label: 'Settings', icon: <Settings className="mr-3 text-lg" />, path: '/settings' },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = user?.role === 'super_admin' ? superAdminItems : [...mainItems, ...safetyItems, ...trainingItems, ...adminItems];

  // Close the sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  // Group items for non-super admins
  const groups = user?.role !== 'super_admin' ? [
    { id: 'main', label: 'Dashboard', items: mainItems },
    { id: 'safety', label: 'Safety Management', items: safetyItems },
    { id: 'training', label: 'Training', items: trainingItems },
    { id: 'admin', label: 'Administration', items: adminItems },
  ] : null;

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 transform z-20 w-64 bg-white shadow-md transition-transform duration-200 ease-in-out h-full pt-16 border-r border-gray-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="py-2 h-full overflow-y-auto flex flex-col">
          {user?.role !== 'super_admin' && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 p-2 rounded-md bg-blue-50 text-primary">
                <Building2 className="h-5 w-5" />
                <div>
                  <div className="font-medium">{user?.tenantName || "Your Organization"}</div>
                  <div className="text-xs text-gray-500">Main Tenant</div>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'super_admin' ? (
            // Super Admin menu
            <>
              <div className="px-4 pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Super Admin</div>
              </div>
              {superAdminItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-4 py-2.5 font-medium",
                    activePath === item.path
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            // Regular user menu grouped by sections
            groups?.map((group) => (
              <div key={group.id}>
                <div className="px-4 pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.label}</div>
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center px-4 py-2.5 font-medium",
                      activePath === item.path
                        ? "text-primary bg-blue-50"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            ))
          )}
          
          {/* Logout at the bottom for all users */}
          <div className="mt-auto px-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="mr-3 text-lg" />
              Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
