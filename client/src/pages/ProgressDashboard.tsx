import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  LineChart,
} from "lucide-react";

export default function ProgressDashboard() {
  // Mock data - will be replaced with real tRPC queries
  const monthlyProgress = {
    target: 100,
    completed: 67,
    onTrack: true,
    activities: [
      { name: "Complete Physics chapters 1-5", progress: 80, status: "on_track" },
      { name: "Solve 200 practice questions", progress: 65, status: "on_track" },
      { name: "Take 2 mock tests", progress: 50, status: "behind" },
      { name: "Watch all video lectures", progress: 90, status: "ahead" },
    ],
  };

  const quarterlyProgress = {
    target: 300,
    completed: 185,
    onTrack: true,
    milestones: [
      { name: "Complete Mechanics", progress: 100, dueDate: "2024-01-15", status: "completed" },
      { name: "Master Thermodynamics", progress: 75, dueDate: "2024-02-28", status: "on_track" },
      { name: "Finish Electromagnetism", progress: 40, dueDate: "2024-03-31", status: "behind" },
    ],
  };

  const yearlyProgress = {
    target: 1200,
    completed: 520,
    onTrack: true,
    subjects: [
      { name: "Physics", progress: 55, target: 400, completed: 220 },
      { name: "Chemistry", progress: 48, target: 400, completed: 192 },
      { name: "Mathematics", progress: 27, target: 400, completed: 108 },
    ],
  };

  const predictiveAnalysis = {
    currentPace: "Good",
    projectedScore: 285,
    targetScore: 300,
    probability: 78,
    recommendations: [
      {
        type: "bridge_course",
        title: "Strengthen Weak Areas in Calculus",
        description: "Your performance in Integration shows gaps. Complete the bridge course to catch up.",
        estimatedDays: 7,
        priority: "high",
      },
      {
        type: "doubt_session",
        title: "Book Doubt Clearing Session",
        description: "You have 12 unanswered doubts in Organic Chemistry. Schedule a session with a teacher.",
        estimatedDays: 1,
        priority: "medium",
      },
      {
        type: "practice",
        title: "Increase Practice Volume",
        description: "To reach your target score, solve 50 more questions per week.",
        estimatedDays: 30,
        priority: "medium",
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "ahead":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "on_track":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      case "behind":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "ahead":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "on_track":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "behind":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Progress Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey with monthly, quarterly, and yearly targets
        </p>
      </div>

      {/* Predictive Analysis Card */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>AI Predictive Analysis</CardTitle>
                <CardDescription>Based on your current performance</CardDescription>
              </div>
            </div>
            <Badge className="bg-purple-600 text-white">
              {predictiveAnalysis.probability}% confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Pace</p>
              <p className="text-2xl font-bold text-green-600">{predictiveAnalysis.currentPace}</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Projected Score</p>
              <p className="text-2xl font-bold text-blue-600">{predictiveAnalysis.projectedScore}</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Score</p>
              <p className="text-2xl font-bold text-purple-600">{predictiveAnalysis.targetScore}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Course Corrections Recommended
            </h3>
            {predictiveAnalysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border-l-4"
                style={{ borderLeftColor: rec.priority === "high" ? "#ef4444" : rec.priority === "medium" ? "#f59e0b" : "#10b981" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <h4 className="font-semibold">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated time: {rec.estimatedDays} days
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {rec.type === "bridge_course" && "Start Course"}
                    {rec.type === "doubt_session" && "Book Session"}
                    {rec.type === "practice" && "View Plan"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tabs */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="quarterly">
            <Target className="h-4 w-4 mr-2" />
            Quarterly
          </TabsTrigger>
          <TabsTrigger value="yearly">
            <Award className="h-4 w-4 mr-2" />
            Yearly
          </TabsTrigger>
        </TabsList>

        {/* Monthly Progress */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Target Progress</CardTitle>
                  <CardDescription>December 2024</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {monthlyProgress.completed}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    of {monthlyProgress.target}% target
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={monthlyProgress.completed} className="h-4" />
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>0%</span>
                  <span className="font-semibold">
                    {monthlyProgress.onTrack ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        On Track
                      </span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        Behind Schedule
                      </span>
                    )}
                  </span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Activities This Month
                </h3>
                {monthlyProgress.activities.map((activity, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(activity.status)}
                        <span className="font-medium">{activity.name}</span>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.progress}%
                      </Badge>
                    </div>
                    <Progress value={activity.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarterly Progress */}
        <TabsContent value="quarterly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quarterly Target Progress</CardTitle>
                  <CardDescription>Q1 2024 (Jan - Mar)</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round((quarterlyProgress.completed / quarterlyProgress.target) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quarterlyProgress.completed} of {quarterlyProgress.target} points
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress
                  value={(quarterlyProgress.completed / quarterlyProgress.target) * 100}
                  className="h-4"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quarterly Milestones
                </h3>
                {quarterlyProgress.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(milestone.status)}
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {milestone.dueDate}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.progress}%
                      </Badge>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Progress */}
        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Yearly Target Progress</CardTitle>
                  <CardDescription>Academic Year 2024-25</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round((yearlyProgress.completed / yearlyProgress.target) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {yearlyProgress.completed} of {yearlyProgress.target} points
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress
                  value={(yearlyProgress.completed / yearlyProgress.target) * 100}
                  className="h-4"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Subject-wise Progress
                </h3>
                {yearlyProgress.subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subject.completed} of {subject.target} points
                        </p>
                      </div>
                      <Badge
                        className={
                          subject.progress >= 60
                            ? "bg-green-500"
                            : subject.progress >= 40
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                        }
                      >
                        {subject.progress}%
                      </Badge>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
