import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, TrendingUp, CheckSquare, FileText, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ParentDashboard() {
  const children = [
    {
      name: "Rahul Sharma",
      class: "Class 10-A",
      avgScore: "85%",
      attendance: "96%",
      status: "Excellent",
    },
  ];

  const stats = [
    {
      title: "Overall Progress",
      value: "85%",
      change: "+5% this month",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Attendance",
      value: "96%",
      change: "22/23 days present",
      icon: CheckSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Assignments",
      value: "2",
      change: "Due this week",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Upcoming Tests",
      value: "3",
      change: "Next 2 weeks",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const recentActivities = [
    { activity: "Completed Algebra Quiz", score: "92%", time: "2 hours ago" },
    { activity: "Submitted Geometry Assignment", score: "Pending", time: "1 day ago" },
    { activity: "Attended Math Class", score: "Present", time: "2 days ago" },
  ];

  const upcomingEvents = [
    { event: "Mathematics Test", date: "Dec 12, 2025", type: "Assessment" },
    { event: "Parent-Teacher Meeting", date: "Dec 15, 2025", type: "Meeting" },
    { event: "Science Project Due", date: "Dec 18, 2025", type: "Assignment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your child's academic progress and activities
          </p>
        </div>
        <Link href="/parent/meetings">
          <Button>Schedule Meeting</Button>
        </Link>
      </div>

      {/* Children Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Children</CardTitle>
          <CardDescription>Academic overview of your children</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Baby className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-lg font-bold">{child.avgScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-lg font-bold">{child.attendance}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    {child.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities and Upcoming Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your child</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((item, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2" />
                    <div>
                      <p className="text-sm font-medium">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    item.score === "Pending" ? "text-orange-600" : "text-green-600"
                  }`}>
                    {item.score}
                  </span>
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
              {upcomingEvents.map((item, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common parent tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Link href="/parent/progress">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Detailed Progress
            </Button>
          </Link>
          <Link href="/parent/assessments">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              View Assessment Results
            </Button>
          </Link>
          <Link href="/parent/messages">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Teachers
            </Button>
          </Link>
          <Link href="/parent/meetings">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
