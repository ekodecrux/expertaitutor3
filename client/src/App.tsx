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
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PaymentHistory from "./pages/PaymentHistory";
import ContentLibrary from "./pages/ContentLibrary";
import Favorites from "./pages/Favorites";
import Recommendations from "./pages/Recommendations";
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
