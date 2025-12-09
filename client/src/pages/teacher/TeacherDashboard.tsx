import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, ClipboardList, CheckSquare, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TeacherDashboard() {
  const stats = [
    {
      title: "My Classes",
      value: "4",
      change: "2 sections each",
      icon: School,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Students",
      value: "156",
      change: "Across all classes",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Assignments",
      value: "12",
      change: "To be graded",
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Attendance Rate",
      value: "94%",
      change: "This month",
      icon: CheckSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const myClasses = [
    { name: "Class 10-A", subject: "Mathematics", students: 42, nextClass: "Today, 10:00 AM" },
    { name: "Class 10-B", subject: "Mathematics", students: 38, nextClass: "Today, 2:00 PM" },
    { name: "Class 9-A", subject: "Mathematics", students: 45, nextClass: "Tomorrow, 9:00 AM" },
    { name: "Class 9-B", subject: "Mathematics", students: 31, nextClass: "Tomorrow, 11:00 AM" },
  ];

  const recentSubmissions = [
    { student: "Rahul Sharma", assignment: "Algebra Quiz", score: "85%", time: "2 hours ago" },
    { student: "Priya Patel", assignment: "Geometry Test", score: "92%", time: "4 hours ago" },
    { student: "Amit Kumar", assignment: "Trigonometry HW", score: "78%", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes and track student progress
          </p>
        </div>
        <Link href="/teacher/assignments">
          <Button>Create Assignment</Button>
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

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Your assigned classes and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myClasses.map((cls) => (
              <div key={cls.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <School className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{cls.name} - {cls.subject}</p>
                    <p className="text-sm text-muted-foreground">{cls.students} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Next Class</p>
                  <p className="text-sm text-muted-foreground">{cls.nextClass}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest student work to review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2" />
                    <div>
                      <p className="text-sm font-medium">{submission.student}</p>
                      <p className="text-xs text-muted-foreground">{submission.assignment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{submission.score}</p>
                    <p className="text-xs text-muted-foreground">{submission.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common teaching tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/teacher/attendance">
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </Link>
            <Link href="/teacher/grading">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4" />
                Grade Assignments ({stats[2].value})
              </Button>
            </Link>
            <Link href="/teacher/lesson-plans">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Lesson Plans
              </Button>
            </Link>
            <Link href="/teacher/reports">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Student Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
