import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  BookOpen,
  FileText,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
} from "lucide-react";
import { useState } from "react";

export default function LessonPlan() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const mockPlan = {
    name: "JEE 2025 Preparation",
    targetExam: "JEE Main & Advanced",
    startDate: "2024-01-01",
    endDate: "2025-04-30",
    dailyHours: 6,
    weeklyGoals: [
      "Complete 2 chapters of Mathematics",
      "Solve 50 practice problems",
      "Watch 5 video lessons",
      "Take 1 mock test",
    ],
  };

  const mockActivities = [
    {
      id: 1,
      date: new Date(),
      topic: "Quadratic Equations",
      type: "study",
      duration: 120,
      completed: true,
    },
    {
      id: 2,
      date: new Date(),
      topic: "Newton's Laws",
      type: "practice",
      duration: 90,
      completed: false,
    },
    {
      id: 3,
      date: new Date(Date.now() + 86400000),
      topic: "Organic Chemistry",
      type: "revision",
      duration: 60,
      completed: false,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'practice': return <FileText className="h-4 w-4" />;
      case 'test': return <Target className="h-4 w-4" />;
      case 'revision': return <CheckCircle2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'practice': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'test': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'revision': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const todayActivities = mockActivities.filter(
    a => a.date.toDateString() === (selectedDate || new Date()).toDateString()
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Lesson Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized study schedule for {mockPlan.targetExam}
          </p>
        </div>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Plan
        </Button>
      </div>

      {/* Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Target Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockPlan.targetExam}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Daily Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockPlan.dailyHours} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {new Date(mockPlan.startDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              End Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {new Date(mockPlan.endDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <CardTitle>Study Calendar</CardTitle>
            </div>
            <CardDescription>
              Click on a date to view scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle>Weekly Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockPlan.weeklyGoals.map((goal, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{goal}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>
                Activities for {selectedDate?.toLocaleDateString() || 'Today'}
              </CardTitle>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayActivities.length > 0 ? (
            <div className="space-y-3">
              {todayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${
                    activity.completed
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {activity.type}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.duration} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                    {activity.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Button size="sm">Mark Complete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No activities scheduled for this date
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
