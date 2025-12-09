import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ParentAssessments() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-muted-foreground">View your child's assessment results</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground text-center">
              Assessment results will appear here once available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
