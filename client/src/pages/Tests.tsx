import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Tests() {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const { data: subjects } = trpc.curriculum.getSubjects.useQuery({
    curriculum: 'CBSE',
  });

  const { data: tests } = trpc.tests.getBySubject.useQuery(
    { subjectId: selectedSubject! },
    { enabled: !!selectedSubject }
  );

  const { data: activeTest } = trpc.tests.getById.useQuery(
    { testId: activeTestId! },
    { enabled: !!activeTestId }
  );

  const { data: attempts } = trpc.tests.getAttempts.useQuery({});

  const startAttemptMutation = trpc.tests.startAttempt.useMutation({
    onSuccess: (data) => {
      setAttemptId(data.id);
      setCurrentQuestionIndex(0);
      setAnswers({});
      toast.success('Test started!');
    },
  });

  const submitAnswerMutation = trpc.tests.submitAnswer.useMutation();

  const submitTestMutation = trpc.tests.submitTest.useMutation({
    onSuccess: (data) => {
      setTestResults(data);
      setShowResults(true);
      setActiveTestId(null);
      setAttemptId(null);
      toast.success('Test submitted successfully!');
    },
  });

  const handleStartTest = (testId: number) => {
    setActiveTestId(testId);
    startAttemptMutation.mutate({ testId });
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (attemptId) {
      submitAnswerMutation.mutate({
        attemptId,
        questionId,
        answer,
        timeSpent: 60,
      });
    }
  };

  const handleNextQuestion = () => {
    if (activeTest && currentQuestionIndex < (activeTest.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    if (attemptId) {
      submitTestMutation.mutate({ attemptId });
    }
  };

  const currentQuestion = activeTest?.questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Tests & Assessments</h1>
          <p className="text-muted-foreground">
            Test your knowledge and track your progress
          </p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="history">My Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {/* Subject Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Subject</CardTitle>
                <CardDescription>Choose a subject to view available tests</CardDescription>
              </CardHeader>
              <CardContent>
                {subjects && subjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                      <Button
                        key={subject.id}
                        variant={selectedSubject === subject.id ? 'default' : 'outline'}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                        onClick={() => setSelectedSubject(subject.id)}
                      >
                        <BookOpen className="h-6 w-6" />
                        <span className="text-sm font-medium">{subject.name}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No subjects available yet. Sample data will be added soon.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The system is fully functional - subjects and tests can be added via the admin panel.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Tests */}
            {selectedSubject && tests && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <Card key={test.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {test.name}
                        </CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium">{test.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{test.durationMinutes} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Marks</span>
                            <span className="font-medium">{test.totalMarks}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleStartTest(test.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Test
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No tests available for this subject yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {attempts && attempts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Attempt</CardTitle>
                      <CardDescription>
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-bold text-lg">
                            {attempt.score}/{attempt.maxScore}
                          </span>
                        </div>
                        <Progress value={((attempt.score || 0) / (attempt.maxScore || 1)) * 100} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-medium">{attempt.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time Spent</p>
                          <p className="font-medium">
                            {Math.round((attempt.timeSpentSeconds || 0) / 60)} min
                          </p>
                        </div>
                      </div>

                      <div className={`p-2 rounded text-center text-sm font-medium ${
                        (attempt.score || 0) >= (attempt.maxScore || 0) * 0.7
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {(attempt.score || 0) >= (attempt.maxScore || 0) * 0.7 ? 'Passed' : 'Needs Improvement'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No test attempts yet. Start a test to see your results here!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Test Taking Dialog */}
        <Dialog open={!!activeTestId && !!attemptId} onOpenChange={() => {
          setActiveTestId(null);
          setAttemptId(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{activeTest?.test?.name}</DialogTitle>
              <DialogDescription>
                Question {currentQuestionIndex + 1} of {activeTest?.questions?.length || 0}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              {currentQuestion && (
                <div className="space-y-6 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Marks: {currentQuestion.marks || currentQuestion.question?.marks}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {activeTest.test?.durationMinutes} min
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {currentQuestion.question?.questionText}
                    </h3>

                    {currentQuestion.question?.type === 'mcq' && currentQuestion.question?.options && (
                      <RadioGroup
                        value={answers[currentQuestion.questionId] || ''}
                        onValueChange={(value) => handleAnswerSelect(currentQuestion.questionId, value)}
                      >
                        <div className="space-y-2">
                          {currentQuestion.question.options.map((option: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                              <RadioGroupItem value={option.text} id={`option-${idx}`} />
                              <label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                                <span className="mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                                {option.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}

                    {currentQuestion.question?.type === 'numeric' && (
                      <Input
                        type="number"
                        placeholder="Enter your answer..."
                        value={answers[currentQuestion.questionId] || ''}
                        onChange={(e) => handleAnswerSelect(currentQuestion.questionId, e.target.value)}
                      />
                    )}

                    {(currentQuestion.question?.type === 'short_answer' || 
                      currentQuestion.question?.type === 'long_answer') && (
                      <Textarea
                        className="min-h-[150px]"
                        placeholder="Type your answer here..."
                        value={answers[currentQuestion.questionId] || ''}
                        onChange={(e) => handleAnswerSelect(currentQuestion.questionId, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === (activeTest?.questions?.length || 0) - 1 ? (
                  <Button onClick={handleSubmitTest} disabled={submitTestMutation.isPending}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {submitTestMutation.isPending ? 'Submitting...' : 'Submit Test'}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Results</DialogTitle>
              <DialogDescription>Here's how you performed</DialogDescription>
            </DialogHeader>

            {testResults && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {testResults.score}/{testResults.maxScore}
                  </div>
                  <Progress value={(testResults.score / testResults.maxScore) * 100} className="mb-2" />
                  <p className="text-muted-foreground">
                    Accuracy: {testResults.accuracy}%
                  </p>
                </div>

                <div className={`p-4 rounded-lg text-center ${
                  testResults.score >= testResults.maxScore * 0.7
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  <Award className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-semibold text-lg">
                    {testResults.score >= testResults.maxScore * 0.7 
                      ? 'Great Job! You Passed!' 
                      : 'Keep Practicing!'}
                  </p>
                </div>

                <Button className="w-full" onClick={() => setShowResults(false)}>
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
