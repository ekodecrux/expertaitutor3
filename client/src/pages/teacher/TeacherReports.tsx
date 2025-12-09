import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function TeacherReports() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">View class performance and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Performance data will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Attendance trends will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
