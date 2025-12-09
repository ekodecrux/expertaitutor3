import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  Target,
  TrendingUp,
  Award,
  Play,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";

export default function Assessments() {
  const mockAssessments = [
    {
      id: 1,
      name: "Mathematics Chapter Test - Algebra",
      type: "Chapter Test",
      subject: "Mathematics",
      duration: 60,
      totalMarks: 50,
      difficulty: "Medium",
      questions: 25,
      attempts: 0,
    },
    {
      id: 2,
      name: "Physics Mock Exam",
      type: "Mock Exam",
      subject: "Physics",
      duration: 180,
      totalMarks: 100,
      difficulty: "Hard",
      questions: 75,
      attempts: 0,
    },
    {
      id: 3,
      name: "Quick Quiz - Trigonometry",
      type: "Practice Quiz",
      subject: "Mathematics",
      duration: 15,
      totalMarks: 10,
      difficulty: "Easy",
      questions: 10,
      attempts: 0,
    },
  ];

  const mockHistory = [
    {
      id: 1,
      name: "Algebra Practice Test",
      subject: "Mathematics",
      date: new Date(Date.now() - 86400000),
      score: 42,
      maxScore: 50,
      accuracy: 84,
      timeSpent: 55,
    },
    {
      id: 2,
      name: "Chemistry Quiz",
      subject: "Chemistry",
      date: new Date(Date.now() - 172800000),
      score: 18,
      maxScore: 20,
      accuracy: 90,
      timeSpent: 12,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assessments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge and track your progress
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Tests</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={
                      assessment.difficulty === 'Easy' ? 'default' :
                      assessment.difficulty === 'Medium' ? 'secondary' :
                      'destructive'
                    }>
                      {assessment.difficulty}
                    </Badge>
                    <Badge variant="outline">{assessment.type}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{assessment.name}</CardTitle>
                  <CardDescription>{assessment.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {assessment.duration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {assessment.totalMarks} marks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {assessment.questions} questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {assessment.attempts} attempts
                      </span>
                    </div>
                  </div>

                  <Link href="/tests">
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No scheduled assessments
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Teachers can schedule assessments for you
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {mockHistory.length > 0 ? (
            <div className="space-y-4">
              {mockHistory.map((attempt) => (
                <Card key={attempt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{attempt.name}</CardTitle>
                        <CardDescription>
                          {attempt.subject} • {attempt.date.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {attempt.score}/{attempt.maxScore}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.accuracy}% accuracy
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Performance</span>
                        <span className="font-medium">
                          {Math.round((attempt.score / attempt.maxScore) * 100)}%
                        </span>
                      </div>
                      <Progress value={(attempt.score / attempt.maxScore) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Time Spent</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {attempt.timeSpent} min
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Accuracy</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {attempt.accuracy}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Result</p>
                        <p className={`font-medium ${
                          attempt.score >= attempt.maxScore * 0.7
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {attempt.score >= attempt.maxScore * 0.7 ? 'Passed' : 'Needs Improvement'}
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Detailed Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">
                No assessment history yet
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
