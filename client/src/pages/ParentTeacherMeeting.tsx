import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIAvatar from "@/components/AIAvatar";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Award,
  Clock,
  BookOpen,
  BarChart3,
  Download,
  Video,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ParentTeacherMeeting() {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  // Mock data - in production, fetch from API
  const studentData = {
    name: "Alex Johnson",
    grade: "10th Grade",
    curriculum: "CBSE",
    parentName: "Sarah Johnson",
    teacherName: "Mr. Robert Smith",
    meetingDate: new Date("2024-01-20"),
  };

  const performanceData = {
    overallProgress: 78,
    attendance: 95,
    assignmentsCompleted: 42,
    totalAssignments: 48,
    averageTestScore: 76,
    studyStreak: 12,
    totalStudyHours: 45,
  };

  const subjectPerformance = [
    { subject: "Mathematics", score: 82, trend: "up", status: "good" },
    { subject: "Physics", score: 75, trend: "stable", status: "good" },
    { subject: "Chemistry", score: 68, trend: "down", status: "needs-improvement" },
    { subject: "English", score: 85, trend: "up", status: "excellent" },
    { subject: "Biology", score: 72, trend: "up", status: "good" },
  ];

  const strengths = [
    "Strong analytical and problem-solving skills",
    "Excellent participation in class discussions",
    "Consistent study habits and time management",
    "Quick grasp of new mathematical concepts",
    "Good collaboration in group activities",
  ];

  const areasForImprovement = [
    {
      area: "Chemistry - Organic Chemistry",
      issue: "Struggling with reaction mechanisms",
      recommendation: "Additional practice with mechanism problems, recommend 1-on-1 tutoring",
      priority: "high",
    },
    {
      area: "Time Management",
      issue: "Occasionally submits assignments close to deadline",
      recommendation: "Create a weekly study schedule, set earlier personal deadlines",
      priority: "medium",
    },
    {
      area: "Test Anxiety",
      issue: "Performance drops slightly in timed tests",
      recommendation: "Practice with timed mock tests, relaxation techniques before exams",
      priority: "medium",
    },
  ];

  const upcomingMilestones = [
    { event: "Mid-term Exams", date: new Date("2024-02-01"), daysLeft: 12 },
    { event: "Science Project Submission", date: new Date("2024-01-28"), daysLeft: 8 },
    { event: "Math Olympiad", date: new Date("2024-02-15"), daysLeft: 26 },
  ];

  const aiRecommendations = [
    "Focus on Chemistry - schedule 3 extra sessions this week",
    "Continue current study pattern for Mathematics - it's working well",
    "Practice more timed tests to build confidence",
    "Join the peer study group for Chemistry",
    "Maintain the excellent study streak - currently at 12 days!",
  ];

  const getAvatarMessage = () => {
    switch (selectedSection) {
      case "overview":
        return `Welcome to ${studentData.name}'s progress meeting! I'm here to provide a comprehensive analysis. ${studentData.name} is performing well overall with a ${performanceData.overallProgress}% progress rate. Let's discuss the details!`;
      case "strengths":
        return `${studentData.name} has shown remarkable strengths! Particularly impressive is the analytical thinking in Mathematics and active class participation. These are excellent foundations for future success.`;
      case "improvements":
        return `I've identified a few areas where ${studentData.name} can improve. The main focus should be on Chemistry, specifically organic reaction mechanisms. With targeted practice, we can see significant improvement in 2-3 weeks.`;
      case "recommendations":
        return `Based on my analysis, I've prepared personalized recommendations. The priority is Chemistry support, while maintaining the excellent momentum in other subjects. Shall we create an action plan together?`;
      default:
        return `I'm analyzing ${studentData.name}'s complete learning journey to provide you with actionable insights.`;
    }
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setIsAvatarSpeaking(true);
    setTimeout(() => setIsAvatarSpeaking(false), 5000);
  };

  const handleGenerateReport = () => {
    toast.success("Generating comprehensive PDF report...");
    // In production, generate and download PDF
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Parent-Teacher Meeting
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered comprehensive student progress review
        </p>
      </div>

      {/* Meeting Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Student</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {studentData.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {studentData.grade} • {studentData.curriculum}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Participants</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Parent: {studentData.parentName}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Teacher: {studentData.teacherName}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meeting Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {studentData.meetingDate.toLocaleDateString()}
              </p>
              <Button className="mt-2" size="sm">
                <Video className="mr-2 h-4 w-4" />
                Join Virtual Meeting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Avatar Guide */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              AI Meeting Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIAvatar
              message={getAvatarMessage()}
              emotion={selectedSection === "strengths" ? "celebrating" : selectedSection === "improvements" ? "encouraging" : "happy"}
              speaking={isAvatarSpeaking}
              size="large"
            />

            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSectionChange("overview")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSectionChange("strengths")}
              >
                <Award className="mr-2 h-4 w-4" />
                Strengths
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSectionChange("improvements")}
              >
                <Target className="mr-2 h-4 w-4" />
                Areas to Improve
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSectionChange("recommendations")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Recommendations
              </Button>
            </div>

            <Button className="w-full mt-6" onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-600">
                    {performanceData.overallProgress}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Progress</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {performanceData.attendance}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Attendance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {performanceData.averageTestScore}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Test Score</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {performanceData.studyStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjectPerformance.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subject.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subject.score}%
                    </span>
                    {subject.trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
                    {subject.trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
                    {subject.trend === "stable" && <div className="h-5 w-5" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <Award className="h-5 w-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <Target className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {areasForImprovement.map((item, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.area}</h4>
                    <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>
                      {item.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Issue:</strong> {item.issue}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Recommendation:</strong> {item.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <CheckCircle2 className="h-5 w-5" />
                AI-Generated Action Plan
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                Personalized recommendations based on comprehensive data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-indigo-800 dark:text-indigo-200">
                    <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100">
                        {idx + 1}
                      </span>
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingMilestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{milestone.event}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {milestone.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      {milestone.daysLeft} days
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
