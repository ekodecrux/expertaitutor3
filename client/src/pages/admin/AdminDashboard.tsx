import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "1,245",
      change: "+45 this month",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      value: "87",
      change: "+3 this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Courses",
      value: "42",
      change: "12 in progress",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "Content review needed",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivities = [
    { action: "New student enrolled", user: "Priya Sharma", time: "2 hours ago" },
    { action: "Content submitted for approval", user: "Dr. Rajesh Kumar", time: "4 hours ago" },
    { action: "Class schedule updated", user: "Mrs. Anjali Verma", time: "1 day ago" },
  ];

  const classPerformance = [
    { class: "Class 10-A", students: 45, avgScore: "85%", status: "Excellent" },
    { class: "Class 10-B", students: 42, avgScore: "78%", status: "Good" },
    { class: "Class 9-A", students: 48, avgScore: "72%", status: "Average" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Institution Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your institution and monitor performance
          </p>
        </div>
        <Link href="/admin/students">
          <Button>Add New Student</Button>
        </Link>
      </div>

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

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
          <CardDescription>Average scores and student count by class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classPerformance.map((cls) => (
              <div key={cls.class} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{cls.class}</p>
                  <p className="text-sm text-muted-foreground">{cls.students} students</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-lg font-bold">{cls.avgScore}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    cls.status === "Excellent" 
                      ? "bg-green-100 text-green-700" 
                      : cls.status === "Good"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates in your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/students">
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
            </Link>
            <Link href="/admin/teachers">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Teachers
              </Button>
            </Link>
            <Link href="/admin/content-approval">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Review Content ({stats[3].value} pending)
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
