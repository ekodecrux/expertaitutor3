import { useState } from 'react';
import { Calendar, Clock, Brain, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function ReviewSchedule() {
  const [selectedTab, setSelectedTab] = useState('due-now');

  const dueNowTopics = [
    {
      id: 1,
      title: 'Quadratic Equations',
      subject: 'Mathematics',
      lastReviewed: '2024-12-02',
      dueStatus: 'overdue',
      easeFactor: 2.5,
      interval: 7,
    },
  ];

  const reviewStats = {
    totalReviews: 45,
    reviewsToday: 8,
    averageEaseFactor: 2.6,
    retentionRate: 87,
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Spaced Repetition Review</h1>
        <p className="text-muted-foreground">
          Review topics at optimal intervals for long-term retention
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Brain className="w-8 h-8 text-purple-500" />
              <div className="text-right">
                <div className="text-2xl font-bold">{reviewStats.totalReviews}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="due-now">Due Now</TabsTrigger>
        </TabsList>
        <TabsContent value="due-now" className="mt-4">
          {dueNowTopics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>{topic.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm">Again</Button>
                  <Button variant="outline" size="sm">Hard</Button>
                  <Button variant="outline" size="sm">Good</Button>
                  <Button variant="default" size="sm">Easy</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
