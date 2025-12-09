import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Visualize institution performance trends</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enrollment chart will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Performance chart will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
