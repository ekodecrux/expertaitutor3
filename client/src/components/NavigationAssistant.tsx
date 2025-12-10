import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Start a lesson', action: 'navigate:/lessons' },
  { label: 'Take a test', action: 'navigate:/tests' },
  { label: 'Check progress', action: 'navigate:/progress' },
  { label: 'View rewards', action: 'navigate:/rewards' },
  { label: 'Ask AI Tutor', action: 'navigate:/ai-tutor' },
];

const PERSONA_GUIDES = {
  student: {
    welcome: "Hi! I'm your learning assistant. I can help you navigate the platform, start lessons, take tests, or answer questions about your progress.",
    suggestions: ['How do I start my next lesson?', 'Show me my progress', 'What tests are available?'],
  },
  teacher: {
    welcome: "Hello! I can help you manage classes, track student progress, schedule video sessions, or generate reports.",
    suggestions: ['Show student performance', 'Schedule a class', 'View analytics'],
  },
  parent: {
    welcome: "Welcome! I can show you your child's progress, upcoming milestones, or help you understand their learning journey.",
    suggestions: ["Show my child's progress", 'What are the upcoming goals?', 'How is performance trending?'],
  },
};

export default function NavigationAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [persona, setPersona] = useState<'student' | 'teacher' | 'parent'>('student');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: PERSONA_GUIDES[persona].welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, persona]);

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response (replace with actual tRPC call)
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: getAIResponse(inputMessage, persona),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  };

  const getAIResponse = (query: string, userPersona: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('lesson') || lowerQuery.includes('study')) {
      return "I can help you start a lesson! Go to the Lessons page from the sidebar, or click 'Start a lesson' below.";
    } else if (lowerQuery.includes('test') || lowerQuery.includes('exam')) {
      return "You can take practice tests from the Tests page. Would you like me to show you available tests?";
    } else if (lowerQuery.includes('progress') || lowerQuery.includes('performance')) {
      return "Check your progress dashboard to see detailed analytics, including monthly/quarterly targets and AI predictions.";
    } else if (lowerQuery.includes('reward') || lowerQuery.includes('badge')) {
      return "Visit the Rewards page to see your badges, leaderboard rank, and virtual currency!";
    } else {
      return "I'm here to help! Try asking about lessons, tests, progress, or rewards. You can also use voice input by clicking the microphone icon.";
    }
  };

  const handleQuickAction = (action: string) => {
    if (action.startsWith('navigate:')) {
      const path = action.replace('navigate:', '');
      window.location.href = path;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Navigation Assistant</CardTitle>
          </div>
          <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          {(['student', 'teacher', 'parent'] as const).map((p) => (
            <Badge
              key={p}
              variant={persona === p ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPersona(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 min-h-[60px]"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={sendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
