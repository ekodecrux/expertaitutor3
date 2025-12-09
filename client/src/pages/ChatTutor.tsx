import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import {
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  FileText,
  Target,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TutorMode = "teaching" | "practice" | "exam" | "revision";

export default function ChatTutor() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Chat Tutor. I'm here to help you learn and understand concepts better. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TutorMode>("teaching");
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId] = useState(1); // Mock session ID

  const chatMutation = trpc.tutor.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      }
    },
    onError: () => {
      toast.error("Failed to get response from tutor");
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    chatMutation.mutate({
      sessionId,
      content: userMessage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice input feature coming soon!");
    }
  };

  const modeConfig = {
    teaching: {
      icon: BookOpen,
      label: "Teaching Mode",
      description: "Step-by-step explanations",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    practice: {
      icon: FileText,
      label: "Practice Mode",
      description: "Solve problems with hints",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    exam: {
      icon: Target,
      label: "Exam Mode",
      description: "Test yourself",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    revision: {
      icon: RotateCcw,
      label: "Revision Mode",
      description: "Quick review",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  };

  const CurrentModeIcon = modeConfig[mode].icon;

  return (
    <div className="h-[calc(100vh-8rem)] p-6 max-w-7xl mx-auto">
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Chat Tutor
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ask questions and get instant help
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI-Powered
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(modeConfig) as TutorMode[]).map((m) => {
              const config = modeConfig[m];
              const Icon = config.icon;
              return (
                <Button
                  key={m}
                  variant={mode === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode(m)}
                  className={mode === m ? "" : ""}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Streamdown>{message.content}</Streamdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold ml-3 flex-shrink-0">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                      AI
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={modeConfig[mode].color}>
                  <CurrentModeIcon className="mr-1 h-3 w-3" />
                  {modeConfig[mode].label}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {modeConfig[mode].description}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={isRecording ? "bg-red-100 dark:bg-red-900" : ""}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? "text-red-600" : ""}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ask a question or describe a problem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
