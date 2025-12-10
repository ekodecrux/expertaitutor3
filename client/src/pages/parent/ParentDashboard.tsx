import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  TrendingUp,
  Calendar,
  MessageSquare,
  Award,
  BookOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ParentDashboard() {
  const gradesData = [
    { month: "Jan", grade: 78 },
    { month: "Feb", grade: 82 },
    { month: "Mar", grade: 80 },
    { month: "Apr", grade: 85 },
    { month: "May", grade: 87 },
    { month: "Jun", grade: 85 },
  ];

  const subjectData = [
    { subject: "Math", score: 85 },
    { subject: "Science", score: 88 },
    { subject: "English", score: 82 },
    { subject: "History", score: 78 },
    { subject: "Geography", score: 80 },
  ];

  const skillsData = [
    { skill: "Problem Solving", value: 85 },
    { skill: "Critical Thinking", value: 78 },
    { skill: "Creativity", value: 90 },
    { skill: "Communication", value: 82 },
    { skill: "Teamwork", value: 88 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Parent Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor your child's academic progress and activities
        </p>
      </div>

      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Rahul Sharma</h2>
                <p className="text-white/80">Class 10A • Roll No: 15</p>
              </div>
            </div>
            <Button variant="secondary">View Full Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Excellent</span> attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">
              3 pending submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Badges earned this term
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Progress</CardTitle>
            <CardDescription>Overall performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gradesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="grade" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Current scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
          <CardDescription>21st century skills evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Skills" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: BookOpen, text: "Completed Math Assignment #5", time: "2 hours ago", color: "bg-green-100 text-green-600" },
                { icon: MessageSquare, text: "Teacher comment on Science project", time: "1 day ago", color: "bg-blue-100 text-blue-600" },
                { icon: Award, text: "Earned 'Quick Learner' badge", time: "2 days ago", color: "bg-purple-100 text-purple-600" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: Calendar, text: "Parent-Teacher Meeting", time: "Tomorrow, 3:00 PM" },
                { icon: BookOpen, text: "Mid-term Exams Begin", time: "Next Monday" },
                { icon: MessageSquare, text: "School Annual Day", time: "Dec 20, 2025" },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <event.icon className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
