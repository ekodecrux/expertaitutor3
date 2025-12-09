import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: profile } = trpc.profile.get.useQuery();
  const { data: knowledgeProfiles } = trpc.progress.getKnowledgeProfile.useQuery();
  const { data: gameStats } = trpc.progress.getGameStats.useQuery();
  const { data: achievements } = trpc.progress.getAchievements.useQuery();
  const { data: activityLogs } = trpc.progress.getActivityLogs.useQuery({});

  const calculateOverallProgress = () => {
    if (!knowledgeProfiles || knowledgeProfiles.length === 0) return 0;
    const total = knowledgeProfiles.reduce((sum, kp) => sum + (kp.masteryScore || 0), 0);
    return Math.round(total / knowledgeProfiles.length);
  };

  const getWeeklyStudyTime = () => {
    if (!activityLogs) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLogs = activityLogs.filter(log => 
      new Date(log.createdAt) >= oneWeekAgo
    );
    
    return weeklyLogs.reduce((sum, log) => sum + (log.durationSeconds || 0), 0);
  };

  const weeklyMinutes = Math.round(getWeeklyStudyTime() / 60);
  const overallProgress = calculateOverallProgress();

  const getTopWeakTopics = () => {
    if (!knowledgeProfiles) return [];
    return [...knowledgeProfiles]
      .sort((a, b) => (a.masteryScore || 0) - (b.masteryScore || 0))
      .slice(0, 5);
  };

  const getTopStrongTopics = () => {
    if (!knowledgeProfiles) return [];
    return [...knowledgeProfiles]
      .sort((a, b) => (b.masteryScore || 0) - (a.masteryScore || 0))
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your learning progress and upcoming activities
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {knowledgeProfiles?.length || 0} topics tracked
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameStats?.currentStreak || 0} days</div>
              <p className="text-xs text-muted-foreground mt-2">
                Longest: {gameStats?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weekly Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyMinutes} min</div>
              <p className="text-xs text-muted-foreground mt-2">
                Target: {profile?.studyHoursPerDay ? profile.studyHoursPerDay * 60 * 7 : 0} min/week
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameStats?.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Level {gameStats?.level || 1}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Continue your learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/ai-tutor">
                    <Button className="w-full justify-start" variant="outline">
                      <Brain className="mr-2 h-4 w-4" />
                      Start AI Tutor Session
                    </Button>
                  </Link>
                  <Link href="/tests">
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Take a Practice Test
                    </Button>
                  </Link>
                  <Link href="/doubts">
                    <Button className="w-full justify-start" variant="outline">
                      <Target className="mr-2 h-4 w-4" />
                      Ask a Doubt
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Study Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Learning preferences and goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Curriculum</span>
                        <span className="text-sm font-medium">{profile.curriculum || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Grade</span>
                        <span className="text-sm font-medium">{profile.grade || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Target Exams</span>
                        <span className="text-sm font-medium">
                          {profile.targetExams?.length || 0} exams
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily Goal</span>
                        <span className="text-sm font-medium">
                          {profile.studyHoursPerDay || 0} hours
                        </span>
                      </div>
                      <Link href="/profile">
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          Update Profile
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete your profile to get personalized recommendations
                      </p>
                      <Link href="/profile">
                        <Button>Complete Profile</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.activityType}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round((log.durationSeconds || 0) / 60)} min
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +{log.pointsEarned || 0} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet. Start learning to see your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weak Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Topics to Improve
                  </CardTitle>
                  <CardDescription>Focus on these areas for better results</CardDescription>
                </CardHeader>
                <CardContent>
                  {getTopWeakTopics().length > 0 ? (
                    <div className="space-y-4">
                      {getTopWeakTopics().map((kp) => (
                        <div key={kp.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Topic #{kp.topicId}</span>
                            <span className="text-sm text-muted-foreground">
                              {kp.masteryScore}%
                            </span>
                          </div>
                          <Progress value={kp.masteryScore || 0} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Start practicing to see your progress
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Strong Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    Strong Topics
                  </CardTitle>
                  <CardDescription>You're excelling in these areas!</CardDescription>
                </CardHeader>
                <CardContent>
                  {getTopStrongTopics().length > 0 ? (
                    <div className="space-y-4">
                      {getTopStrongTopics().map((kp) => (
                        <div key={kp.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Topic #{kp.topicId}</span>
                            <span className="text-sm text-muted-foreground">
                              {kp.masteryScore}%
                            </span>
                          </div>
                          <Progress value={kp.masteryScore || 0} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Start practicing to see your progress
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Badges and milestones you've earned</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {achievements.map((sa) => (
                      <div
                        key={sa.id}
                        className="flex flex-col items-center p-4 bg-gradient-achievement rounded-lg text-white text-center"
                      >
                        <Trophy className="h-8 w-8 mb-2" />
                        <p className="text-sm font-semibold">
                          {sa.achievement?.name || 'Achievement'}
                        </p>
                        <p className="text-xs opacity-90 mt-1">
                          {new Date(sa.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No achievements yet. Keep learning to earn badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Complete log of your learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{log.activityType}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round((log.durationSeconds || 0) / 60)} minutes
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{log.pointsEarned || 0} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No activity recorded yet. Start your learning journey!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
