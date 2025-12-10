import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Flame,
  Star,
  BookOpen,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  const progressData = [
    { week: "W1", xp: 120 },
    { week: "W2", xp: 180 },
    { week: "W3", xp: 240 },
    { week: "W4", xp: 320 },
  ];

  const subjectProgressData = [
    { subject: "Math", progress: 85 },
    { subject: "Science", progress: 78 },
    { subject: "English", progress: 92 },
    { subject: "History", progress: 70 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, Rahul!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your Learning Dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-300" />
            <span className="font-bold text-orange-600 dark:text-orange-300">15 Day Streak!</span>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Level</p>
                <p className="text-3xl font-bold">12</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Total XP</p>
                <p className="text-3xl font-bold">3,240</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Badges</p>
                <p className="text-3xl font-bold">18</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Rank</p>
                <p className="text-3xl font-bold">#7</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress to Level 13</span>
              <span className="text-sm font-bold">240/500 XP</span>
            </div>
            <Progress value={48} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              2 completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 days</div>
            <p className="text-xs text-muted-foreground">
              Mathematics Quiz
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>XP Progress</CardTitle>
            <CardDescription>Your experience points over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Completion percentage by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {["🏆", "⭐", "🎯", "🔥", "💎", "🚀"].map((emoji, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs text-center text-gray-600 dark:text-gray-400">Badge {i + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump back into your learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: "Continue Course", color: "bg-blue-100 text-blue-600" },
                { icon: Brain, label: "AI Tutor", color: "bg-purple-100 text-purple-600" },
                { icon: Target, label: "Practice Quiz", color: "bg-green-100 text-green-600" },
                { icon: Trophy, label: "Leaderboard", color: "bg-orange-100 text-orange-600" },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="h-24 flex-col gap-2">
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
