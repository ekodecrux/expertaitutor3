import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes with AppLayout */}
      <Route path={"/dashboard"}>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      
      <Route path={"/courses"}>
        <AppLayout>
          <Courses />
        </AppLayout>
      </Route>
      
      <Route path={"/videos"}>
        <AppLayout>
          <VideoLessons />
        </AppLayout>
      </Route>
      
      <Route path={"/lesson-plan"}>
        <AppLayout>
          <LessonPlan />
        </AppLayout>
      </Route>
      
      <Route path={"/assessments"}>
        <AppLayout>
          <Assessments />
        </AppLayout>
      </Route>
      
      <Route path={"/ai-tutor"}>
        <AppLayout>
          <AITutor />
        </AppLayout>
      </Route>
      
      <Route path={"/chat-tutor"}>
        <AppLayout>
          <ChatTutor />
        </AppLayout>
      </Route>
      
      <Route path={"/rewards"}>
        <AppLayout>
          <Rewards />
        </AppLayout>
      </Route>
      
      <Route path={"/progress"}>
        <AppLayout>
          <Progress />
        </AppLayout>
      </Route>
      
      <Route path={"/support"}>
        <AppLayout>
          <Support />
        </AppLayout>
      </Route>
      
      <Route path={"/profile"}>
        <AppLayout>
          <Profile />
        </AppLayout>
      </Route>
      
      <Route path={"/doubts"}>
        <AppLayout>
          <Doubts />
        </AppLayout>
      </Route>
      
      <Route path={"/tests"}>
        <AppLayout>
          <Tests />
        </AppLayout>
      </Route>
      
      <Route path={"/ai-tutor-avatar"}>
        <AppLayout>
          <AITutorWithAvatar />
        </AppLayout>
      </Route>
      
      <Route path={"/lesson-narration"}>
        <AppLayout>
          <LessonNarration />
        </AppLayout>
      </Route>
      
      <Route path={"/assessment-analysis"}>
        <AppLayout>
          <AssessmentAnalysis />
        </AppLayout>
      </Route>
      
      <Route path={"/parent-teacher-meeting"}>
        <AppLayout>
          <ParentTeacherMeeting />
        </AppLayout>
      </Route>
      
      <Route path={"/404"} component={NotFound} />
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
