import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Users, MapPin, AlertTriangle, Clipboard, FileText, User, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/hooks/use-sidebar';

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  matchSubpaths?: boolean;
}

const NavLink = ({ href, icon: Icon, children, matchSubpaths = false }: NavLinkProps) => {
  const [location] = useLocation();
  const isActive = matchSubpaths
    ? location === href || location.startsWith(`${href}/`)
    : location === href;

  return (
    <Link href={href}>
      <a
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{children}</span>
      </a>
    </Link>
  );
};

const MobileNav = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold">MySafety</h2>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </SheetTrigger>
          </div>
          <Separator />
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-4">
              <NavLink href="/dashboard" icon={Home}>Dashboard</NavLink>
              <NavLink href="/sites" icon={MapPin} matchSubpaths>Sites</NavLink>
              <NavLink href="/hazards" icon={AlertTriangle}>Hazards</NavLink>
              <NavLink href="/inspections" icon={Clipboard}>Inspections</NavLink>
              <NavLink href="/permits" icon={FileText}>Permits</NavLink>
              <NavLink href="/incidents" icon={AlertTriangle}>Incidents</NavLink>
              <NavLink href="/teams" icon={Users} matchSubpaths>Teams</NavLink>
              <NavLink href="/training" icon={User}>Training</NavLink>
              <NavLink href="/safety-scores" icon={BarChart3}>Safety Scores</NavLink>
              <NavLink href="/users" icon={Users} matchSubpaths>Users</NavLink>
              <NavLink href="/settings" icon={Settings}>Settings</NavLink>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const UserNav = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/auth')
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <a className="w-full cursor-pointer">Settings</a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <MobileNav />
        <div className="flex-1"></div>
        <UserNav />
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 z-20 hidden w-64 flex-col border-r bg-background pt-16 md:flex transition-all duration-300",
            isCollapsed && "w-16"
          )}
        >
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-4">
              <NavLink href="/dashboard" icon={Home}>
                {!isCollapsed && "Dashboard"}
              </NavLink>
              <NavLink href="/sites" icon={MapPin} matchSubpaths>
                {!isCollapsed && "Sites"}
              </NavLink>
              <NavLink href="/hazards" icon={AlertTriangle}>
                {!isCollapsed && "Hazards"}
              </NavLink>
              <NavLink href="/inspections" icon={Clipboard}>
                {!isCollapsed && "Inspections"}
              </NavLink>
              <NavLink href="/permits" icon={FileText}>
                {!isCollapsed && "Permits"}
              </NavLink>
              <NavLink href="/incidents" icon={AlertTriangle}>
                {!isCollapsed && "Incidents"}
              </NavLink>
              <NavLink href="/teams" icon={Users} matchSubpaths>
                {!isCollapsed && "Teams"}
              </NavLink>
              <NavLink href="/training" icon={User}>
                {!isCollapsed && "Training"}
              </NavLink>
              <NavLink href="/safety-scores" icon={BarChart3}>
                {!isCollapsed && "Safety Scores"}
              </NavLink>
              <NavLink href="/users" icon={Users} matchSubpaths>
                {!isCollapsed && "Users"}
              </NavLink>
              <NavLink href="/settings" icon={Settings}>
                {!isCollapsed && "Settings"}
              </NavLink>
            </nav>
          </div>
          <div className="border-t p-4">
            <Button
              variant="outline"
              size="icon"
              className="w-full justify-start"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        </aside>
        <main
          className={cn(
            "flex-1 transition-all duration-300 md:pl-64",
            isCollapsed && "md:pl-16"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}