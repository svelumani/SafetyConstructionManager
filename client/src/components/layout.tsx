import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClipboardList,
  AlertTriangle,
  FileCheck,
  FileWarning,
  BarChart3,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  Home,
  Award,
  FileText,
  Calendar,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  title: string;
  href: string;
  icon: ReactNode;
};

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Hazards",
      href: "/hazards",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Inspections",
      href: "/inspections",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Permits",
      href: "/permits",
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: "Incidents",
      href: "/incidents",
      icon: <FileWarning className="h-5 w-5" />,
    },
    {
      title: "Training",
      href: "/training",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "Daily Report",
      href: "/daily-report",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Client Reports",
      href: "/reports",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Safety Scores",
      href: "/safety-scores",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Sites",
      href: "/sites",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Teams",
      href: "/teams",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" && location === "/") {
      return true;
    }
    return location === href;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold">MySafety</h1>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div
                  className={`mr-3 flex-shrink-0 ${
                    isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </div>
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b h-16">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-4">
                <div className="px-4 mb-6">
                  <h1 className="text-2xl font-bold">MySafety</h1>
                </div>
                <nav className="flex-1 px-2 pb-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`mr-3 flex-shrink-0 ${
                          isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-bold">MySafety</h1>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-background p-10">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/super-admin",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Tenants",
      href: "/super-admin/tenants",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Templates",
      href: "/super-admin/templates",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Logs",
      href: "/super-admin/logs",
      icon: <FileWarning className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (href: string) => {
    if (href === "/super-admin" && location === "/super-admin") {
      return true;
    }
    return location === href;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold">MySafety Admin</h1>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div
                  className={`mr-3 flex-shrink-0 ${
                    isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </div>
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b h-16">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-4">
                <div className="px-4 mb-6">
                  <h1 className="text-2xl font-bold">MySafety Admin</h1>
                </div>
                <nav className="flex-1 px-2 pb-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`mr-3 flex-shrink-0 ${
                          isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-bold">MySafety Admin</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Super Admin</p>
                    <p className="text-xs text-muted-foreground">admin@mysafety.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-background p-10">{children}</main>
      </div>
    </div>
  );
}