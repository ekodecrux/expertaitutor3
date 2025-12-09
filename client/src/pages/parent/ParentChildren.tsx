import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Baby, Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function ParentChildren() {
  const { data: children, isLoading } = trpc.parent.getChildren.useQuery();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Children</h1>
        <p className="text-muted-foreground">View and monitor your children's academic progress</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {children && children.length > 0 ? (
            children.map((child: any) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Baby className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle>{child.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{child.email}</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-2xl font-bold">85%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attendance</p>
                        <p className="text-2xl font-bold">96%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/parent/progress?studentId=${child.id}`}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Progress
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/parent/children/${child.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Baby className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
                <p className="text-muted-foreground text-center">
                  Contact the school admin to link your children's accounts.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
