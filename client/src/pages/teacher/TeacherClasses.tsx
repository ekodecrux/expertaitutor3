import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { School, Users, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function TeacherClasses() {
  const { data: classes, isLoading } = trpc.teacher.getMyClasses.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground">Manage your assigned classes and sections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request New Class
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes && classes.length > 0 ? (
          classes.map((classItem: any) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-indigo-600" />
                    <CardTitle>{classItem.name}</CardTitle>
                  </div>
                  <Badge>{classItem.section}</Badge>
                </div>
                <CardDescription>{classItem.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{classItem.studentCount || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{classItem.schedule || "Mon, Wed, Fri - 10:00 AM"}</span>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/teacher/classes/${classItem.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <School className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classes Assigned</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any classes assigned yet. Contact your admin to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
