import { useState } from 'react';
import { Send, Mic, MicOff, Play, Square, Trophy, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
// import { useToast } from '@/hooks/use-toast';

const SCENARIO_TYPES = [
  { id: 'debate', label: 'Debate', icon: '🗣️', description: 'Argue for or against a topic' },
  { id: 'interview', label: 'Interview', icon: '💼', description: 'Practice job or college interviews' },
  { id: 'experiment', label: 'Experiment', icon: '🔬', description: 'Conduct virtual lab experiments' },
  { id: 'presentation', label: 'Presentation', icon: '📊', description: 'Present research or projects' },
  { id: 'discussion', label: 'Discussion', icon: '💬', description: 'Academic topic discussions' },
];

const SAMPLE_SCENARIOS = [
  {
    id: 1,
    title: 'Climate Change Debate',
    type: 'debate',
    difficulty: 'intermediate',
    description: 'Debate the effectiveness of renewable energy policies',
    characterRole: 'Climate Skeptic',
    estimatedDuration: 15,
  },
  {
    id: 2,
    title: 'Medical School Interview',
    type: 'interview',
    difficulty: 'advanced',
    description: 'Practice common medical school interview questions',
    characterRole: 'Admissions Officer',
    estimatedDuration: 20,
  },
  {
    id: 3,
    title: 'Physics Lab Experiment',
    type: 'experiment',
    difficulty: 'beginner',
    description: 'Conduct a virtual pendulum experiment',
    characterRole: 'Lab Assistant',
    estimatedDuration: 10,
  },
];

export default function AIRoleplay() {
  // const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const startSession = async (scenario: any) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'll be playing the role of ${scenario.characterRole}. ${scenario.description}. Let's begin!`,
        timestamp: new Date(),
      },
    ]);
    setSessionTime(0);
  };

  const endSession = () => {
    setSessionActive(false);
    alert(`Session completed! You practiced for ${Math.floor(sessionTime / 60)} minutes.`);
    // Show performance feedback modal
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response (replace with actual tRPC call)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `That's an interesting point. Let me challenge that perspective...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start voice recording
      setIsRecording(true);
    } else {
      // Stop recording and transcribe
      setIsRecording(false);
    }
  };

  if (!sessionActive) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Roleplay Practice</h1>
          <p className="text-muted-foreground">
            Practice real-world scenarios with AI-powered conversations
          </p>
        </div>

        {/* Scenario Types */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {SCENARIO_TYPES.map((type) => (
            <Card
              key={type.id}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">{type.icon}</div>
                <h3 className="font-semibold mb-1">{type.label}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Scenarios */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Scenarios</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_SCENARIOS.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge variant={scenario.difficulty === 'advanced' ? 'destructive' : 'secondary'}>
                      {scenario.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>Role: {scenario.characterRole}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{scenario.estimatedDuration} minutes</span>
                    </div>
                  </div>
                  <Button onClick={() => startSession(scenario)} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Roleplay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Session UI
  return (
    <div className="container py-8 max-w-4xl">
      {/* Session Header */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedScenario.title}</h2>
              <p className="text-sm text-muted-foreground">
                Playing as: {selectedScenario.characterRole}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              <Button onClick={endSession} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
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
              placeholder="Type your response..."
              className="flex-1"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={toggleRecording} variant={isRecording ? 'destructive' : 'outline'} size="icon">
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={sendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Session Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Engagement</span>
                <span>85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Clarity</span>
                <span>72%</span>
              </div>
              <Progress value={72} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Argument Strength</span>
                <span>90%</span>
              </div>
              <Progress value={90} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
