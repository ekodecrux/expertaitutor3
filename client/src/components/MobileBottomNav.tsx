import { Home, BookOpen, Trophy, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    label: "Learn",
    icon: BookOpen,
    path: "/courses",
  },
  {
    label: "Rewards",
    icon: Trophy,
    path: "/rewards",
  },
  {
    label: "Tutor",
    icon: MessageSquare,
    path: "/tutor",
  },
  {
    label: "Profile",
    icon: User,
    path: "/profile",
  },
];

export default function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="mobile-bottom-nav lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + "/");
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  "min-w-[60px] min-h-[44px]", // Touch-friendly size
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
