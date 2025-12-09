import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: notifications } = trpc.notifications.getAll.useQuery(
    { unreadOnly: true },
    { enabled: isAuthenticated }
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = getLoginUrl();
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navSections: NavSection[] = [
    {
      title: "MAIN",
      items: [
        { label: "Dashboard", icon: Home, path: "/dashboard" },
      ],
    },
    {
      title: "LEARNING",
      items: [
        { label: "My Courses", icon: BookOpen, path: "/courses" },
        { label: "Video Lessons", icon: Video, path: "/videos" },
        { label: "Lesson Plan", icon: Calendar, path: "/lesson-plan" },
        { label: "Assessments", icon: FileText, path: "/assessments" },
      ],
    },
    {
      title: "AI TOOLS",
      items: [
        { label: "AI Tutor", icon: Sparkles, path: "/ai-tutor" },
        { label: "Chat Tutor", icon: MessageSquare, path: "/chat-tutor" },
      ],
    },
    {
      title: "OTHER",
      items: [
        { label: "Rewards", icon: Award, path: "/rewards" },
        { label: "Progress", icon: LineChart, path: "/progress" },
        { label: "Support", icon: HelpCircle, path: "/support" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
      >
        {/* Logo & Brand */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Myschool-HCL Jigsaw
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Learning Platform
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role || "Student"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            isActive
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          {item.label}
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-3 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.name || "Student"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || "Student"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>

              {/* User Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
