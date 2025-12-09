import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  Award,
  BarChart3,
} from "lucide-react";

export default function Progress() {
  const { data: knowledgeProfiles } = trpc.progress.getKnowledgeProfile.useQuery();
  const { data: activityLogs } = trpc.progress.getActivityLogs.useQuery({});

  const mockSubjectProgress = [
    { subject: "Mathematics", mastery: 75, topics: 12, completed: 9 },
    { subject: "Physics", mastery: 60, topics: 10, completed: 6 },
    { subject: "Chemistry", mastery: 45, topics: 8, completed: 4 },
    { subject: "English", mastery: 80, topics: 6, completed: 5 },
  ];

  const mockWeeklyActivity = [
    { day: "Mon", hours: 3.5 },
    { day: "Tue", hours: 4.0 },
    { day: "Wed", hours: 2.5 },
    { day: "Thu", hours: 5.0 },
    { day: "Fri", hours: 3.0 },
    { day: "Sat", hours: 6.0 },
    { day: "Sun", hours: 4.5 },
  ];

  const totalHours = mockWeeklyActivity.reduce((sum, day) => sum + day.hours, 0);
  const avgHoursPerDay = totalHours / 7;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Progress Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your learning journey and achievements
        </p>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                This Week
              </CardTitle>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total study time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Daily Average
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgHoursPerDay.toFixed(1)}h
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Topics Mastered
              </CardTitle>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {mockSubjectProgress.reduce((sum, s) => sum + s.completed, 0)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Out of {mockSubjectProgress.reduce((sum, s) => sum + s.topics, 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Mastery
              </CardTitle>
              <Target className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(mockSubjectProgress.reduce((sum, s) => sum + s.mastery, 0) / mockSubjectProgress.length)}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across all subjects
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subjects">Subject Progress</TabsTrigger>
          <TabsTrigger value="activity">Weekly Activity</TabsTrigger>
          <TabsTrigger value="topics">Topic Mastery</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <CardTitle>Subject-wise Progress</CardTitle>
              </div>
              <CardDescription>
                Your mastery level across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockSubjectProgress.map((subject) => (
                <div key={subject.subject} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {subject.subject}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.completed} of {subject.topics} topics completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subject.mastery}%
                      </div>
                    </div>
                  </div>
                  <ProgressBar value={subject.mastery} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <CardTitle>Weekly Study Hours</CardTitle>
              </div>
              <CardDescription>
                Your study time distribution this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWeeklyActivity.map((day) => {
                  const maxHours = Math.max(...mockWeeklyActivity.map(d => d.hours));
                  const percentage = (day.hours / maxHours) * 100;
                  return (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-12">
                          {day.day}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {day.hours.toFixed(1)} hours
                        </span>
                      </div>
                      <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle>Topic Mastery Heatmap</CardTitle>
              </div>
              <CardDescription>
                Detailed breakdown of your knowledge across topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {knowledgeProfiles && knowledgeProfiles.length > 0 ? (
                <div className="space-y-4">
                  {knowledgeProfiles.map((kp) => (
                    <div key={kp.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Topic {kp.topicId}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            {kp.attemptsCount || 0} attempts
                          </span>
                          <span className="font-medium">
                            {kp.masteryScore || 0}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={kp.masteryScore || 0} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No topic data available yet. Start learning to see your progress!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
