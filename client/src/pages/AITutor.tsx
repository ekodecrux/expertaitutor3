import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Bot, ImageIcon, Mic, Send, Sparkles, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function AITutor() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'teaching' | 'practice' | 'exam' | 'revision'>('teaching');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string; createdAt: Date }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: activeSession } = trpc.tutor.getActiveSession.useQuery(undefined, {
    enabled: !!user,
  });

  const startSessionMutation = trpc.tutor.startSession.useMutation({
    onSuccess: (data) => {
      if (data) {
        setCurrentSessionId(data.id);
        setMessages([]);
        toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode activated`);
      }
    },
  });

  const sendMessageMutation = trpc.tutor.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        createdAt: new Date(),
      }]);
    },
  });

  const transcribeAudioMutation = trpc.tutor.transcribeAudio.useMutation({
    onSuccess: (data) => {
      setMessage(data.text);
      toast.success('Audio transcribed successfully');
    },
    onError: () => {
      toast.error('Failed to transcribe audio');
    },
  });

  useEffect(() => {
    if (activeSession) {
      setCurrentSessionId(activeSession.id);
      if (activeSession.mode) {
        setMode(activeSession.mode);
      }
    }
  }, [activeSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartSession = () => {
    startSessionMutation.mutate({ mode });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentSessionId) return;

    const userMessage = { role: 'user', content: message, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);

    sendMessageMutation.mutate({
      sessionId: currentSessionId,
      content: message,
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Upload audio to server (simplified - in production, use proper upload flow)
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        // For now, we'll show a message that voice input is ready
        toast.info('Processing audio...');
        
        // In production, upload to S3 and get URL, then transcribe
        // transcribeAudioMutation.mutate({ audioUrl: uploadedUrl });
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const modeDescriptions = {
    teaching: 'Learn new concepts with step-by-step explanations',
    practice: 'Practice problems with hints and guidance',
    exam: 'Simulate exam conditions with timed challenges',
    revision: 'Review and reinforce previously learned topics',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Tutor
          </h1>
          <p className="text-muted-foreground">Your personal learning companion powered by advanced AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Mode Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Learning Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground">
                {modeDescriptions[mode]}
              </p>

              {!currentSessionId && (
                <Button 
                  onClick={handleStartSession} 
                  className="w-full"
                  disabled={startSessionMutation.isPending}
                >
                  Start Session
                </Button>
              )}

              {currentSessionId && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Session Active
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Quick Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ask for step-by-step explanations</li>
                  <li>• Request hints before solutions</li>
                  <li>• Upload images of questions</li>
                  <li>• Use voice input for convenience</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="relative">
                    <Bot className="h-8 w-8 text-indigo-600" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span>AI Tutor</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {messages.length} messages
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                {messages.length === 0 && !currentSessionId && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bot className="h-24 w-24 text-indigo-200 dark:text-indigo-800 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Welcome to AI Tutor!</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select a learning mode and start a session to begin your personalized learning journey.
                      I'm here to help you understand concepts, practice problems, and achieve your goals.
                    </p>
                  </div>
                )}

                {messages.length === 0 && currentSessionId && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Sparkles className="h-16 w-16 text-indigo-600 mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Session Started!</h3>
                    <p className="text-muted-foreground">
                      Ask me anything to get started. I'm ready to help!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('Image upload coming soon')}
                    disabled={!currentSessionId}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!currentSessionId}
                    className={isRecording ? 'bg-red-100 dark:bg-red-900' : ''}
                  >
                    {isRecording ? (
                      <StopCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  <Input
                    placeholder={currentSessionId ? "Ask me anything..." : "Start a session first..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!currentSessionId || sendMessageMutation.isPending}
                    className="flex-1"
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentSessionId || !message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
