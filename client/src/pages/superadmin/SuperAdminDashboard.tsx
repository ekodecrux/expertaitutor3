import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, DollarSign, TrendingUp, Activity } from "lucide-react";

export default function SuperAdminDashboard() {
  const stats = [
    {
      title: "Total Organizations",
      value: "24",
      change: "+3 this month",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: "12,458",
      change: "+1,234 this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Monthly Revenue",
      value: "$45,230",
      change: "+12% from last month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Subscriptions",
      value: "18",
      change: "2 pending renewal",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentOrganizations = [
    { name: "Delhi Public School", users: 1250, plan: "Enterprise", status: "Active" },
    { name: "Kendriya Vidyalaya", users: 850, plan: "Premium", status: "Active" },
    { name: "Ryan International", users: 650, plan: "Basic", status: "Trial" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide overview and management
        </p>
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

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Organizations</CardTitle>
          <CardDescription>Latest institutions onboarded to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrganizations.map((org) => (
              <div key={org.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-muted-foreground">{org.users} users • {org.plan} plan</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  org.status === "Active" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {org.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Uptime</span>
                <span className="text-sm font-semibold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-semibold">142ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Health</span>
                <span className="text-sm font-semibold text-green-600">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>This month's revenue by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enterprise Plans</span>
                <span className="text-sm font-semibold">$28,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Premium Plans</span>
                <span className="text-sm font-semibold">$12,300</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Basic Plans</span>
                <span className="text-sm font-semibold">$4,430</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
