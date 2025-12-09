import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Plus } from "lucide-react";

export default function AdminClasses() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Classes & Sections</h1>
          <p className="text-muted-foreground">Manage classes, sections, and assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Classes Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first class to get started.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
