import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIAvatar from "@/components/AIAvatar";
import { trpc } from "@/lib/trpc";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  BookOpen,
  Lightbulb,
  BarChart3,
  Play,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TopicAnalysis {
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: "mastered" | "good" | "needs-improvement" | "critical";
  gaps: string[];
  recommendations: string[];
}

export default function AssessmentAnalysis() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  // Mock data - in production, fetch from API
  const assessmentData = {
    testName: "Mathematics - Quadratic Equations Test",
    date: new Date("2024-01-15"),
    overallScore: 72,
    totalQuestions: 25,
    correctAnswers: 18,
    timeSpent: 45, // minutes
  };

  const topicAnalysis: TopicAnalysis[] = [
    {
      topic: "Quadratic Formula",
      score: 90,
      totalQuestions: 5,
      correctAnswers: 4,
      status: "mastered",
      gaps: [],
      recommendations: ["Practice more complex word problems", "Try advanced applications"],
    },
    {
      topic: "Factoring",
      score: 75,
      totalQuestions: 6,
      correctAnswers: 4,
      status: "good",
      gaps: ["Difficulty with trinomials where a ≠ 1"],
      recommendations: ["Review factoring techniques for complex trinomials", "Practice 10 more problems"],
    },
    {
      topic: "Completing the Square",
      score: 50,
      totalQuestions: 7,
      correctAnswers: 3,
      status: "needs-improvement",
      gaps: [
        "Not converting to standard form correctly",
        "Errors in calculating the constant term",
        "Sign errors when moving terms",
      ],
      recommendations: [
        "Watch video lesson on completing the square",
        "Practice step-by-step with guided examples",
        "Focus on sign management",
      ],
    },
    {
      topic: "Discriminant Analysis",
      score: 40,
      totalQuestions: 4,
      correctAnswers: 1,
      status: "critical",
      gaps: [
        "Misunderstanding the meaning of discriminant values",
        "Incorrect calculation of b² - 4ac",
        "Unable to determine nature of roots",
      ],
      recommendations: [
        "Start with fundamentals - what is the discriminant?",
        "Practice calculating discriminants",
        "Learn to interpret discriminant values",
        "Schedule 1-on-1 tutoring session",
      ],
    },
    {
      topic: "Word Problems",
      score: 66,
      totalQuestions: 3,
      correctAnswers: 2,
      status: "good",
      gaps: ["Difficulty translating problem to equation"],
      recommendations: ["Practice more word problems", "Focus on problem comprehension"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "needs-improvement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mastered":
        return <CheckCircle2 className="h-4 w-4" />;
      case "good":
        return <TrendingUp className="h-4 w-4" />;
      case "needs-improvement":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getAvatarMessage = () => {
    if (!selectedTopic) {
      return `I've analyzed your test results. You scored ${assessmentData.overallScore}% overall. Let me help you understand where you can improve!`;
    }

    const topic = topicAnalysis.find((t) => t.topic === selectedTopic);
    if (!topic) return "";

    if (topic.status === "mastered") {
      return `Excellent work on ${topic.topic}! You've mastered this topic with ${topic.score}% accuracy. Keep up the great work!`;
    } else if (topic.status === "critical") {
      return `I notice you're struggling with ${topic.topic}. Don't worry! Let's work together to build a strong foundation. I've prepared a personalized learning path for you.`;
    } else if (topic.status === "needs-improvement") {
      return `You're making progress on ${topic.topic}, but there's room for improvement. I've identified specific gaps we can work on together.`;
    } else {
      return `Good job on ${topic.topic}! You're doing well. Let's fine-tune a few areas to reach mastery level.`;
    }
  };

  const getAvatarEmotion = () => {
    if (!selectedTopic) return "happy";

    const topic = topicAnalysis.find((t) => t.topic === selectedTopic);
    if (!topic) return "neutral";

    if (topic.status === "mastered") return "celebrating";
    if (topic.status === "critical") return "encouraging";
    if (topic.status === "needs-improvement") return "thinking";
    return "happy";
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setIsAvatarSpeaking(true);
    setTimeout(() => setIsAvatarSpeaking(false), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assessment Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analysis of your performance with personalized recommendations
        </p>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{assessmentData.testName}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Taken on {assessmentData.date.toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">
                {assessmentData.overallScore}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {assessmentData.correctAnswers}/{assessmentData.totalQuestions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {assessmentData.timeSpent}m
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {topicAnalysis.filter((t) => t.status === "mastered").length}/{topicAnalysis.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Topics Mastered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Analysis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIAvatar
              message={getAvatarMessage()}
              emotion={getAvatarEmotion()}
              speaking={isAvatarSpeaking}
              size="large"
            />
          </CardContent>
        </Card>

        {/* Topic-wise Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Topic-wise Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicAnalysis.map((topic) => (
              <div
                key={topic.topic}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTopic === topic.topic
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
                onClick={() => handleTopicClick(topic.topic)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {topic.topic}
                    </h4>
                    <Badge className={getStatusColor(topic.status)}>
                      {getStatusIcon(topic.status)}
                      <span className="ml-1">{topic.status.replace("-", " ")}</span>
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {topic.score}%
                  </span>
                </div>

                <Progress value={topic.score} className="mb-3" />

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {topic.correctAnswers} / {topic.totalQuestions} questions correct
                </p>

                {selectedTopic === topic.topic && (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Gaps */}
                    {topic.gaps.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-orange-900 dark:text-orange-100 mb-2 text-sm">
                              Knowledge Gaps:
                            </p>
                            <ul className="space-y-1">
                              {topic.gaps.map((gap, idx) => (
                                <li key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                                  • {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
                            Recommendations:
                          </p>
                          <ul className="space-y-1">
                            {topic.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Review Lesson
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="mr-2 h-4 w-4" />
                        Practice
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Personalized Study Plan */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Personalized Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Based on your assessment, I've created a personalized study plan to help you improve:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Priority: Discriminant Analysis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start here - this needs immediate attention. Estimated time: 2 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Next: Completing the Square</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build on fundamentals. Estimated time: 3 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Then: Factoring & Word Problems</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Polish your skills. Estimated time: 2 hours
                </p>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4">
            Start Personalized Learning Path
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
