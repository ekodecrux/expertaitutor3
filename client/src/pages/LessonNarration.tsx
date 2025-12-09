import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AIAvatar from "@/components/AIAvatar";
import { trpc } from "@/lib/trpc";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface LessonStep {
  id: number;
  title: string;
  content: string;
  avatarMessage: string;
  emotion: "neutral" | "happy" | "thinking" | "encouraging" | "celebrating";
  tips?: string[];
}

export default function LessonNarration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Mock lesson data - in production, fetch from API
  const lesson: LessonStep[] = [
    {
      id: 1,
      title: "Introduction to Quadratic Equations",
      content: "A quadratic equation is a polynomial equation of degree 2. The standard form is **ax² + bx + c = 0**, where a ≠ 0.",
      avatarMessage: "Welcome! Today we'll learn about quadratic equations. Don't worry, I'll guide you through each step!",
      emotion: "happy",
      tips: ["Remember: 'a' cannot be zero", "The highest power is 2"],
    },
    {
      id: 2,
      title: "Understanding the Components",
      content: "In the equation ax² + bx + c = 0:\n- **a** is the coefficient of x²\n- **b** is the coefficient of x\n- **c** is the constant term",
      avatarMessage: "Let's break down each part of the equation. Each component has a specific role!",
      emotion: "thinking",
      tips: ["Coefficients can be positive or negative", "The constant term 'c' stands alone"],
    },
    {
      id: 3,
      title: "Example Problem",
      content: "Let's look at an example: **2x² + 5x - 3 = 0**\n\nHere:\n- a = 2\n- b = 5\n- c = -3",
      avatarMessage: "Great! Now let's apply what we learned to a real example. Can you identify the coefficients?",
      emotion: "encouraging",
      tips: ["Notice that c is negative", "a = 2 means the x² term is multiplied by 2"],
    },
    {
      id: 4,
      title: "The Quadratic Formula",
      content: "To solve quadratic equations, we use the formula:\n\n**x = (-b ± √(b² - 4ac)) / 2a**\n\nThis formula works for any quadratic equation!",
      avatarMessage: "This is the powerful quadratic formula! It might look complex, but I'll show you how to use it step by step.",
      emotion: "happy",
      tips: ["The ± symbol means we get two solutions", "The part under the square root is called the discriminant"],
    },
    {
      id: 5,
      title: "Solving Our Example",
      content: "For 2x² + 5x - 3 = 0:\n\nx = (-5 ± √(5² - 4(2)(-3))) / 2(2)\nx = (-5 ± √(25 + 24)) / 4\nx = (-5 ± √49) / 4\nx = (-5 ± 7) / 4\n\n**Solutions:** x = 0.5 or x = -3",
      avatarMessage: "Excellent work! You've solved your first quadratic equation. See how the formula gives us two solutions?",
      emotion: "celebrating",
      tips: ["Always simplify step by step", "Check your answers by substituting back"],
    },
  ];

  const currentLessonStep = lesson[currentStep];

  useEffect(() => {
    if (isPlaying) {
      // Simulate auto-progression
      const timer = setTimeout(() => {
        if (currentStep < lesson.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
          toast.success("Lesson completed!");
        }
      }, 8000); // 8 seconds per step

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep]);

  useEffect(() => {
    // Update progress
    setProgress(((currentStep + 1) / lesson.length) * 100);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < lesson.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lesson Narration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn with your AI tutor guiding you through each step
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Lesson Progress
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {currentStep + 1} / {lesson.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson Steps Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Lesson Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lesson.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentStep === index
                    ? "bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-600"
                    : completedSteps.includes(index)
                    ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                    : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {completedSteps.includes(index) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : currentStep === index ? (
                    <Circle className="h-4 w-4 text-indigo-600 fill-indigo-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium line-clamp-2">
                    {step.title}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardContent className="pt-6">
              <AIAvatar
                message={currentLessonStep.avatarMessage}
                emotion={currentLessonStep.emotion}
                speaking={isPlaying}
                size="medium"
                showControls={false}
              />
            </CardContent>
          </Card>

          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentLessonStep.title}</CardTitle>
                <Badge variant="outline">
                  Step {currentStep + 1} of {lesson.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <Streamdown>{currentLessonStep.content}</Streamdown>
              </div>

              {/* Tips Section */}
              {currentLessonStep.tips && currentLessonStep.tips.length > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                          Key Tips:
                        </p>
                        <ul className="space-y-1">
                          {currentLessonStep.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      {currentStep === 0 ? "Start Lesson" : "Resume"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentStep === lesson.length - 1}
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {currentStep === lesson.length - 1 && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                    Lesson Complete!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    Great job! You've completed this lesson. Ready to practice?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Review Lesson
                    </Button>
                    <Button>
                      Practice Problems
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
