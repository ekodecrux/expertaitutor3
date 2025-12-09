import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function TeacherGrading() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Grading</h1>
        <p className="text-muted-foreground">Grade assignments and assessments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Grading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Submissions to Grade</h3>
            <p className="text-muted-foreground text-center">
              All submissions have been graded.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
