import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  FileText,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: knowledgeProfiles } = trpc.progress.getKnowledgeProfile.useQuery();
  const { data: gameStats } = trpc.progress.getGameStats.useQuery();
  const { data: activityLogs } = trpc.progress.getActivityLogs.useQuery({});

  // Calculate stats
  const totalTopics = knowledgeProfiles?.length || 0;
  const masteredTopics = knowledgeProfiles?.filter(kp => (kp.masteryScore || 0) >= 80).length || 0;
  const overallProgress = totalTopics > 0 
    ? Math.round(knowledgeProfiles!.reduce((sum, kp) => sum + (kp.masteryScore || 0), 0) / totalTopics)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your Learning Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {overallProgress}%
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Topics Covered
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalTopics}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mastered Topics
              </CardTitle>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {masteredTopics}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              80%+ mastery level
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Test Score
              </CardTitle>
              <Target className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {gameStats?.totalPoints ? Math.round(gameStats.totalPoints / 10) : 0}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Based on recent tests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                <CardTitle>Your Knowledge Map</CardTitle>
              </div>
              <Link href="/progress">
                <Button variant="ghost" size="sm">
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Track your mastery across different topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {knowledgeProfiles && knowledgeProfiles.length > 0 ? (
              <div className="space-y-4">
                {knowledgeProfiles.slice(0, 5).map((kp) => (
                  <div key={kp.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Topic {kp.topicId}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {kp.masteryScore || 0}%
                      </span>
                    </div>
                    <Progress value={kp.masteryScore || 0} className="h-2" />
                  </div>
                ))}
                {knowledgeProfiles.length > 5 && (
                  <Link href="/progress">
                    <Button variant="outline" className="w-full mt-4">
                      View All Topics
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No learning data yet. Start practicing!
                </p>
                <Link href="/courses">
                  <Button>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/lesson-plan">
              <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">
                <Calendar className="mr-2 h-4 w-4" />
                My Study Plan (JEE/GRE/TOEFL)
              </Button>
            </Link>

            <Link href="/ai-tutor">
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Tutor (Speak, Learn, Ask)
              </Button>
            </Link>

            <Link href="/courses">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
            </Link>

            <Link href="/assessments">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle>Recent Assessments</CardTitle>
            </div>
            <Link href="/assessments">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.activityType}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.pointsEarned} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">
                No assessments yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-red-500" />
            <CardTitle>Notifications</CardTitle>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              0 new
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No notifications
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
