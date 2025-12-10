import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AIAvatar from "@/components/AIAvatar";
import { trpc } from "@/lib/trpc";
import {
  Mic,
  Send,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Target,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type TutorMode = "teaching" | "practice" | "exam" | "revision";
type AvatarEmotion = "neutral" | "happy" | "thinking" | "encouraging" | "celebrating";

export default function AITutorWithAvatar() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TutorMode>("teaching");
  const [avatarEmotion, setAvatarEmotion] = useState<AvatarEmotion>("happy");
  const [avatarMessage, setAvatarMessage] = useState("Hello! I'm your AI Tutor. I'm here to help you learn and master any concept. What would you like to learn today?");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const startSessionMutation = trpc.tutor.startSession.useMutation({
    onSuccess: (data) => {
      if (data?.id) {
        setSessionId(data.id);
        setAvatarEmotion("happy");
        setAvatarMessage(`Great! Let's start your ${mode} session. I'll guide you through this step by step.`);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    },
  });

  const sendMessageMutation = trpc.tutor.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        setAvatarMessage(data.content);
        setAvatarEmotion("thinking");
        setIsSpeaking(true);
        
        // Simulate avatar finishing speaking
        setTimeout(() => {
          setIsSpeaking(false);
          setAvatarEmotion("happy");
        }, 4000);
      }
    },
    onError: () => {
      toast.error("Failed to get response from tutor");
      setAvatarEmotion("neutral");
    },
  });

  useEffect(() => {
    // Auto-start session when mode changes
    if (!sessionId) {
      startSessionMutation.mutate({ mode });
    }
  }, [mode]);

  const handleSend = () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setAvatarEmotion("thinking");

    sendMessageMutation.mutate({
      sessionId,
      content: userMessage,
    });
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice input activated! Speak your question...");
      setAvatarEmotion("neutral");
      // In production, this would activate actual voice recognition
      setTimeout(() => {
        setIsRecording(false);
        toast.success("Voice input received!");
      }, 3000);
    }
  };

  const handleSpeak = (text: string) => {
    // In production, this would use Web Speech API or external TTS service
    // Simulated female, slow English voice as per user preference
  };

  const modeConfig = {
    teaching: {
      icon: BookOpen,
      label: "Teaching Mode",
      description: "Learn new concepts with detailed explanations",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    practice: {
      icon: FileText,
      label: "Practice Mode",
      description: "Solve problems with hints and guidance",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    exam: {
      icon: Target,
      label: "Exam Mode",
      description: "Test yourself without hints",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    revision: {
      icon: RotateCcw,
      label: "Revision Mode",
      description: "Quick review of key concepts",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Tutor with Avatar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive learning with your personal AI tutor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Your AI Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIAvatar
              message={avatarMessage}
              emotion={avatarEmotion}
              speaking={isSpeaking}
              size="large"
              onSpeak={handleSpeak}
            />

            {/* Mode Selector */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Learning Mode
              </p>
              {(Object.keys(modeConfig) as TutorMode[]).map((m) => {
                const config = modeConfig[m];
                const Icon = config.icon;
                return (
                  <Button
                    key={m}
                    variant={mode === m ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setMode(m);
                      setSessionId(null);
                      setMessages([]);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Quick Tips */}
            <Card className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Tip from your tutor:</p>
                    <p className="text-xs">
                      {mode === "teaching" && "Ask me to explain concepts step-by-step!"}
                      {mode === "practice" && "Request hints if you get stuck on a problem."}
                      {mode === "exam" && "I'll only provide answers after you submit."}
                      {mode === "revision" && "I'll help you quickly review key points."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Interaction Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Learning Session</CardTitle>
              <Badge className={modeConfig[mode].color}>
                {modeConfig[mode].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversation Area */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Start your learning session
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Ask a question or request a topic to learn
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={isRecording ? "bg-red-100 dark:bg-red-900 animate-pulse" : ""}
              >
                <Mic className={`h-4 w-4 ${isRecording ? "text-red-600" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Ask a question or request a topic..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sendMessageMutation.isPending || !sessionId}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending || !sessionId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice Control */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Voice: Female, Slow English
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSpeaking(!isSpeaking)}
              >
                {isSpeaking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
