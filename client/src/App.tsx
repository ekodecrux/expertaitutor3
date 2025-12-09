import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import VideoLessons from "./pages/VideoLessons";
import LessonPlan from "./pages/LessonPlan";
import Assessments from "./pages/Assessments";
import AITutor from "./pages/AITutor";
import ChatTutor from "./pages/ChatTutor";
import Rewards from "./pages/Rewards";
import Progress from "./pages/Progress";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import Doubts from "./pages/Doubts";
import Tests from "./pages/Tests";
import AITutorWithAvatar from "./pages/AITutorWithAvatar";
import LessonNarration from "./pages/LessonNarration";
import AssessmentAnalysis from "./pages/AssessmentAnalysis";
import ParentTeacherMeeting from "./pages/ParentTeacherMeeting";
import ContentApprovalQueue from "./pages/admin/ContentApprovalQueue";
import ContentSourcesManagement from "./pages/admin/ContentSourcesManagement";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherLessonPlans from "./pages/teacher/TeacherLessonPlans";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import TeacherGrading from "./pages/teacher/TeacherGrading";
import TeacherMessages from "./pages/teacher/TeacherMessages";
import TeacherParentMeetings from "./pages/teacher/TeacherParentMeetings";
import TeacherReports from "./pages/teacher/TeacherReports";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentProgress from "./pages/parent/ParentProgress";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentAssessments from "./pages/parent/ParentAssessments";
import ParentMessages from "./pages/parent/ParentMessages";
import ParentMeetings from "./pages/parent/ParentMeetings";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminParents from "./pages/admin/AdminParents";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminReports from "./pages/admin/AdminReports";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import SuperAdminOrganizations from "./pages/superadmin/SuperAdminOrganizations";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminSubscriptions from "./pages/superadmin/SuperAdminSubscriptions";
import SuperAdminAnalytics from "./pages/superadmin/SuperAdminAnalytics";
import SuperAdminRevenue from "./pages/superadmin/SuperAdminRevenue";
import SuperAdminSettings from "./pages/superadmin/SuperAdminSettings";
import SuperAdminSupport from "./pages/superadmin/SuperAdminSupport";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PaymentHistory from "./pages/PaymentHistory";
import ContentLibrary from "./pages/ContentLibrary";
import Favorites from "./pages/Favorites";
import Recommendations from "./pages/Recommendations";
import Messages from "./pages/Messages";
import ProfileSettings from "./pages/ProfileSettings";
import { useAuth } from "./_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      
      {/* Protected routes with AppLayout */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Role-specific dashboards */}
      <Route path="/superadmin/dashboard">
        <ProtectedRoute>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/dashboard">
        <ProtectedRoute>
          <TeacherDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/dashboard">
        <ProtectedRoute>
          <ParentDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/courses">
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      </Route>
      
      <Route path="/videos">
        <ProtectedRoute>
          <VideoLessons />
        </ProtectedRoute>
      </Route>
      
      <Route path="/lesson-plan">
        <ProtectedRoute>
          <LessonPlan />
        </ProtectedRoute>
      </Route>
      
      <Route path="/assessments">
        <ProtectedRoute>
          <Assessments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-tutor">
        <ProtectedRoute>
          <AITutor />
        </ProtectedRoute>
      </Route>
      
      <Route path="/chat-tutor">
        <ProtectedRoute>
          <ChatTutor />
        </ProtectedRoute>
      </Route>
      
      <Route path="/rewards">
        <ProtectedRoute>
          <Rewards />
        </ProtectedRoute>
      </Route>
      
      <Route path="/progress">
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      </Route>
      
      <Route path="/support">
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/doubts">
        <ProtectedRoute>
          <Doubts />
        </ProtectedRoute>
      </Route>
      
      <Route path="/tests">
        <ProtectedRoute>
          <Tests />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-tutor-avatar">
        <ProtectedRoute>
          <AITutorWithAvatar />
        </ProtectedRoute>
      </Route>
      
      <Route path="/lesson-narration">
        <ProtectedRoute>
          <LessonNarration />
        </ProtectedRoute>
      </Route>
      
      <Route path="/assessment-analysis">
        <ProtectedRoute>
          <AssessmentAnalysis />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent-teacher-meeting">
        <ProtectedRoute>
          <ParentTeacherMeeting />
        </ProtectedRoute>
      </Route>
      
      {/* Teacher Routes */}
      <Route path="/teacher/classes">
        <ProtectedRoute>
          <TeacherClasses />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/students">
        <ProtectedRoute>
          <TeacherStudents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/attendance">
        <ProtectedRoute>
          <TeacherAttendance />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/lesson-plans">
        <ProtectedRoute>
          <TeacherLessonPlans />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/assignments">
        <ProtectedRoute>
          <TeacherAssignments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/assessments">
        <ProtectedRoute>
          <TeacherAssessments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/grading">
        <ProtectedRoute>
          <TeacherGrading />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/messages">
        <ProtectedRoute>
          <TeacherMessages />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/parent-meetings">
        <ProtectedRoute>
          <TeacherParentMeetings />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher/reports">
        <ProtectedRoute>
          <TeacherReports />
        </ProtectedRoute>
      </Route>
      
      {/* Parent Routes */}
      <Route path="/parent/children">
        <ProtectedRoute>
          <ParentChildren />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/progress">
        <ProtectedRoute>
          <ParentProgress />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/attendance">
        <ProtectedRoute>
          <ParentAttendance />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/assessments">
        <ProtectedRoute>
          <ParentAssessments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/messages">
        <ProtectedRoute>
          <ParentMessages />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent/meetings">
        <ProtectedRoute>
          <ParentMeetings />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/students">
        <ProtectedRoute>
          <AdminStudents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/teachers">
        <ProtectedRoute>
          <AdminTeachers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/parents">
        <ProtectedRoute>
          <AdminParents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/classes">
        <ProtectedRoute>
          <AdminClasses />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/reports">
        <ProtectedRoute>
          <AdminReports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <AdminAnalytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/settings">
        <ProtectedRoute>
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      
      {/* Super Admin Routes */}
      <Route path="/superadmin/organizations">
        <ProtectedRoute>
          <SuperAdminOrganizations />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/users">
        <ProtectedRoute>
          <SuperAdminUsers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/subscriptions">
        <ProtectedRoute>
          <SuperAdminSubscriptions />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/analytics">
        <ProtectedRoute>
          <SuperAdminAnalytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/revenue">
        <ProtectedRoute>
          <SuperAdminRevenue />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/settings">
        <ProtectedRoute>
          <SuperAdminSettings />
        </ProtectedRoute>
      </Route>
      
      <Route path="/superadmin/support">
        <ProtectedRoute>
          <SuperAdminSupport />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Content Management Routes */}
      <Route path="/admin/content-approval">
        <ProtectedRoute>
          <ContentApprovalQueue />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/content-sources">
        <ProtectedRoute>
          <ContentSourcesManagement />
        </ProtectedRoute>
      </Route>
      
      {/* Subscription & Billing Routes */}
      <Route path="/subscription">
        <ProtectedRoute>
          <SubscriptionManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payments">
        <ProtectedRoute>
          <PaymentHistory />
        </ProtectedRoute>
      </Route>
      
      {/* Content Library Route */}
      <Route path="/content-library">
        <ProtectedRoute>
          <ContentLibrary />
        </ProtectedRoute>
      </Route>
      
      {/* Favorites Route */}
      <Route path="/favorites">
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      </Route>
      
      {/* Recommendations Route */}
      <Route path="/recommendations">
        <ProtectedRoute>
          <Recommendations />
        </ProtectedRoute>
      </Route>
      
      {/* Messages Route */}
      <Route path="/messages">
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      </Route>
      
      {/* Profile Settings Route */}
      <Route path="/profile-settings">
        <ProtectedRoute>
          <ProfileSettings />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
