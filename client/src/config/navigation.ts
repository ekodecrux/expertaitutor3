import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LineChart,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Video,
  Wallet,
  UserCog,
  School,
  TrendingUp,
  CheckSquare,
  BookMarked,
  Baby,
  DollarSign,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const studentNavigation: NavSection[] = [
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
      { label: "AI Tutor", icon: Bot, path: "/ai-tutor-avatar" },
      { label: "Chat Tutor", icon: MessageSquare, path: "/chat-tutor" },
    ],
  },
  {
    title: "OTHER",
    items: [
      { label: "Rewards", icon: Award, path: "/rewards" },
      { label: "Progress", icon: LineChart, path: "/progress" },
      { label: "Assessment Analysis", icon: BarChart3, path: "/assessment-analysis" },
      { label: "Support", icon: HelpCircle, path: "/support" },
    ],
  },
];

export const teacherNavigation: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", icon: Home, path: "/teacher/dashboard" },
    ],
  },
  {
    title: "CLASS MANAGEMENT",
    items: [
      { label: "My Classes", icon: School, path: "/teacher/classes" },
      { label: "Students", icon: Users, path: "/teacher/students" },
      { label: "Attendance", icon: CheckSquare, path: "/teacher/attendance" },
    ],
  },
  {
    title: "TEACHING",
    items: [
      { label: "Lesson Plans", icon: BookMarked, path: "/teacher/lesson-plans" },
      { label: "Assignments", icon: ClipboardList, path: "/teacher/assignments" },
      { label: "Assessments", icon: FileText, path: "/teacher/assessments" },
      { label: "Grading", icon: BarChart3, path: "/teacher/grading" },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { label: "Messages", icon: MessageSquare, path: "/teacher/messages" },
      { label: "Parent Meetings", icon: Users, path: "/teacher/parent-meetings" },
    ],
  },
  {
    title: "OTHER",
    items: [
      { label: "Reports", icon: LineChart, path: "/teacher/reports" },
      { label: "Support", icon: HelpCircle, path: "/support" },
    ],
  },
];

export const parentNavigation: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", icon: Home, path: "/parent/dashboard" },
    ],
  },
  {
    title: "MY CHILDREN",
    items: [
      { label: "Children Overview", icon: Baby, path: "/parent/children" },
      { label: "Academic Progress", icon: TrendingUp, path: "/parent/progress" },
      { label: "Attendance", icon: CheckSquare, path: "/parent/attendance" },
      { label: "Assessments", icon: FileText, path: "/parent/assessments" },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { label: "Messages", icon: MessageSquare, path: "/parent/messages" },
      { label: "Teacher Meetings", icon: Users, path: "/parent/meetings" },
    ],
  },
  {
    title: "BILLING",
    items: [
      { label: "Subscription", icon: Wallet, path: "/subscription" },
      { label: "Payment History", icon: DollarSign, path: "/payments" },
    ],
  },
  {
    title: "OTHER",
    items: [
      { label: "Support", icon: HelpCircle, path: "/support" },
    ],
  },
];

export const adminNavigation: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", icon: Home, path: "/admin/dashboard" },
    ],
  },
  {
    title: "USER MANAGEMENT",
    items: [
      { label: "Students", icon: GraduationCap, path: "/admin/students" },
      { label: "Teachers", icon: Users, path: "/admin/teachers" },
      { label: "Parents", icon: Users, path: "/admin/parents" },
      { label: "Classes & Sections", icon: School, path: "/admin/classes" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Content Approval", icon: CheckSquare, path: "/admin/content-approval" },
      { label: "Content Sources", icon: BookOpen, path: "/admin/content-sources" },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Reports", icon: BarChart3, path: "/admin/reports" },
      { label: "Analytics", icon: LineChart, path: "/admin/analytics" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { label: "Institution Settings", icon: Settings, path: "/admin/settings" },
      { label: "Subscription", icon: Wallet, path: "/subscription" },
      { label: "Support", icon: HelpCircle, path: "/support" },
    ],
  },
];

export const superAdminNavigation: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", icon: Home, path: "/superadmin/dashboard" },
    ],
  },
  {
    title: "PLATFORM MANAGEMENT",
    items: [
      { label: "Organizations", icon: Building2, path: "/superadmin/organizations" },
      { label: "All Users", icon: Users, path: "/superadmin/users" },
      { label: "Subscriptions", icon: Wallet, path: "/superadmin/subscriptions" },
    ],
  },
  {
    title: "USER MANAGEMENT",
    items: [
      { label: "Students", icon: GraduationCap, path: "/admin/students" },
      { label: "Teachers", icon: Users, path: "/admin/teachers" },
      { label: "Parents", icon: Users, path: "/admin/parents" },
      { label: "Classes & Sections", icon: School, path: "/admin/classes" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Content Approval", icon: CheckSquare, path: "/admin/content-approval" },
      { label: "Content Sources", icon: BookOpen, path: "/admin/content-sources" },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Platform Analytics", icon: TrendingUp, path: "/superadmin/analytics" },
      { label: "Revenue Reports", icon: DollarSign, path: "/superadmin/revenue" },
      { label: "Institution Reports", icon: BarChart3, path: "/admin/reports" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "System Settings", icon: Settings, path: "/superadmin/settings" },
      { label: "Support Tickets", icon: HelpCircle, path: "/superadmin/support" },
    ],
  },
];

export function getNavigationForRole(role: string): NavSection[] {
  switch (role) {
    case "student":
      return studentNavigation;
    case "teacher":
      return teacherNavigation;
    case "parent":
      return parentNavigation;
    case "admin":
    case "institution_admin":
    case "branch_admin":
      return adminNavigation;
    case "super_admin":
      return superAdminNavigation;
    default:
      return studentNavigation;
  }
}
