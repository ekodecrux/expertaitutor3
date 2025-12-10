import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { trpc } from "@/lib/trpc";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function SuperAdminDashboard() {
  // Mock data - replace with real backend queries later
  const isLoading = false;
  const stats = { totalOrganizations: 24, totalUsers: 12458, monthlyRevenue: 45230, activeSubscriptions: 18 };
  const organizations = [
    { id: 1, name: "Delhi Public School", type: "school", userCount: 1250, subscriptionPlan: "Enterprise", status: "active" },
    { id: 2, name: "Kendriya Vidyalaya", type: "school", userCount: 850, subscriptionPlan: "Premium", status: "active" },
    { id: 3, name: "Ryan International", type: "school", userCount: 650, subscriptionPlan: "Basic", status: "pending" },
  ];

  // Mock data for charts (replace with real data from backend)
  const userGrowthData = [
    { month: "Jan", users: 8500 },
    { month: "Feb", users: 9200 },
    { month: "Mar", users: 10100 },
    { month: "Apr", users: 11000 },
    { month: "May", users: 11800 },
    { month: "Jun", users: 12458 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 35000 },
    { month: "Feb", revenue: 38000 },
    { month: "Mar", revenue: 40000 },
    { month: "Apr", revenue: 42000 },
    { month: "May", revenue: 43500 },
    { month: "Jun", revenue: 45230 },
  ];

  const subscriptionData = [
    { name: "Free", value: 8 },
    { name: "Basic", value: 5 },
    { name: "Premium", value: 3 },
    { name: "Enterprise", value: 2 },
  ];

  const organizationTypeData = [
    { type: "School", count: 12 },
    { type: "University", count: 6 },
    { type: "Corporate", count: 4 },
    { type: "Coaching", count: 2 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Platform-wide overview and management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrganizations || 24}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || "12,458"}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+658</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || "45,230"}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 18}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total platform users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Distribution by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Organization Types */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Type</CardTitle>
            <CardDescription>Distribution by organization category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={organizationTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Organizations</CardTitle>
          <CardDescription>Latest organizations onboarded to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations?.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {org.type} • {org.userCount || 0} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {org.subscriptionPlan || "Free"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {org.status === "active" ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">All systems running smoothly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 pending, 4 resolved today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
