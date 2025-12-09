import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function ParentMeetings() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Meetings</h1>
          <p className="text-muted-foreground">Schedule and view meetings with teachers</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Meeting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Meetings Scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Request a meeting with your child's teacher to discuss progress.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
