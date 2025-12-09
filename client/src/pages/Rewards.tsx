import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Award,
  TrendingUp,
  Flame,
  Star,
  Trophy,
  Zap,
  Target,
  Medal,
} from "lucide-react";

export default function Rewards() {
  const { data: gameStats } = trpc.progress.getGameStats.useQuery();
  const { data: achievements } = trpc.progress.getAchievements.useQuery();

  const mockBadges = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first learning session",
      icon: "🎯",
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000 * 7),
      rarity: "Common",
    },
    {
      id: 2,
      name: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000 * 3),
      rarity: "Rare",
    },
    {
      id: 3,
      name: "Perfect Score",
      description: "Score 100% on any test",
      icon: "⭐",
      unlocked: false,
      rarity: "Epic",
    },
    {
      id: 4,
      name: "Knowledge Seeker",
      description: "Ask 10 doubts",
      icon: "💡",
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000),
      rarity: "Common",
    },
    {
      id: 5,
      name: "Test Master",
      description: "Complete 10 practice tests",
      icon: "📝",
      unlocked: false,
      rarity: "Rare",
    },
    {
      id: 6,
      name: "Speed Demon",
      description: "Complete a test in record time",
      icon: "⚡",
      unlocked: false,
      rarity: "Epic",
    },
  ];

  const mockLeaderboard = [
    { rank: 1, name: "Rahul Sharma", points: 2850, avatar: "R" },
    { rank: 2, name: "Priya Patel", points: 2720, avatar: "P" },
    { rank: 3, name: "Arjun Kumar", points: 2650, avatar: "A" },
    { rank: 4, name: "You", points: gameStats?.totalPoints || 0, avatar: "Y", isCurrentUser: true },
    { rank: 5, name: "Sneha Singh", points: 2400, avatar: "S" },
  ];

  const currentLevel = Math.floor((gameStats?.totalPoints || 0) / 100) + 1;
  const pointsToNextLevel = ((currentLevel * 100) - (gameStats?.totalPoints || 0));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Rewards & Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and earn badges
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Points
              </CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {gameStats?.totalPoints || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Streak
              </CardTitle>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {gameStats?.currentStreak || 0} days
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Level
              </CardTitle>
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentLevel}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Badges Earned
              </CardTitle>
              <Award className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {mockBadges.filter(b => b.unlocked).length}/{mockBadges.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <CardTitle>Level Progress</CardTitle>
          </div>
          <CardDescription>
            {pointsToNextLevel} points to reach Level {currentLevel + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Level {currentLevel}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {gameStats?.totalPoints || 0} / {currentLevel * 100} pts
              </span>
            </div>
            <Progress value={((gameStats?.totalPoints || 0) % 100)} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`${
                  badge.unlocked
                    ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
                    : 'opacity-60'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-5xl">{badge.icon}</div>
                    <Badge variant={
                      badge.rarity === 'Common' ? 'secondary' :
                      badge.rarity === 'Rare' ? 'default' :
                      'destructive'
                    }>
                      {badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {badge.unlocked ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Award className="h-4 w-4" />
                      <span>Unlocked {badge.unlockedAt?.toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      🔒 Locked
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                <CardTitle>Top Learners</CardTitle>
              </div>
              <CardDescription>
                See how you rank against other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.isCurrentUser
                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gray-300 text-gray-900' :
                        entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                        {entry.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {entry.points}
                        </span>
                      </div>
                    </div>
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
