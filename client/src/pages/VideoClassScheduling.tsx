import { Video, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VideoClassScheduling() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Class Scheduling</h1>
          <p className="text-muted-foreground">
            Schedule and manage live classes
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule New Class
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No classes scheduled yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
