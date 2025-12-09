import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, HelpCircle, ImageIcon, Lightbulb, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Doubts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [selectedDoubt, setSelectedDoubt] = useState<any>(null);

  const { data: unresolvedDoubts, refetch: refetchUnresolved } = trpc.doubts.getAll.useQuery({ 
    resolved: false 
  });

  const { data: resolvedDoubts } = trpc.doubts.getAll.useQuery({ 
    resolved: true 
  });

  const createDoubtMutation = trpc.doubts.create.useMutation({
    onSuccess: (data) => {
      toast.success('Doubt submitted successfully!');
      setIsDialogOpen(false);
      setQuestionText('');
      refetchUnresolved();
      
      // Show the solution immediately
      setSelectedDoubt({
        questionText,
        aiSolution: data.solution,
        resolved: false,
      });
    },
    onError: () => {
      toast.error('Failed to submit doubt');
    },
  });

  const resolveDoubtMutation = trpc.doubts.resolve.useMutation({
    onSuccess: () => {
      toast.success('Doubt marked as resolved!');
      refetchUnresolved();
      setSelectedDoubt(null);
    },
  });

  const handleSubmitDoubt = () => {
    if (!questionText.trim()) {
      toast.error('Please enter your question');
      return;
    }

    createDoubtMutation.mutate({
      questionText,
    });
  };

  const handleResolveDoubt = (doubtId: number) => {
    resolveDoubtMutation.mutate({ doubtId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Doubts & Questions</h1>
            <p className="text-muted-foreground">
              Get instant AI-powered solutions to your questions
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Ask a Doubt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ask Your Question</DialogTitle>
                <DialogDescription>
                  Describe your doubt clearly and get AI-powered solutions instantly
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Type your question here... Be as specific as possible for better answers."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast.info('Image upload coming soon')}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmitDoubt}
                  disabled={createDoubtMutation.isPending}
                >
                  {createDoubtMutation.isPending ? 'Generating Solution...' : 'Get Solution'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="unresolved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unresolved">
              Unresolved ({unresolvedDoubts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedDoubts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unresolved" className="space-y-4">
            {unresolvedDoubts && unresolvedDoubts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unresolvedDoubts.map((doubt) => (
                  <Card key={doubt.id} className="card-hover cursor-pointer" onClick={() => setSelectedDoubt(doubt)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <HelpCircle className="h-5 w-5 text-orange-500" />
                        Question
                      </CardTitle>
                      <CardDescription>
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3">{doubt.questionText}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoubt(doubt);
                        }}
                      >
                        View Solution
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No unresolved doubts. Ask a question to get started!
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ask Your First Question
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedDoubts && resolvedDoubts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resolvedDoubts.map((doubt) => (
                  <Card key={doubt.id} className="card-hover cursor-pointer" onClick={() => setSelectedDoubt(doubt)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Resolved
                      </CardTitle>
                      <CardDescription>
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3">{doubt.questionText}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoubt(doubt);
                        }}
                      >
                        View Solution
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No resolved doubts yet. Mark doubts as resolved after reviewing solutions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Solution Dialog */}
        <Dialog open={!!selectedDoubt} onOpenChange={() => setSelectedDoubt(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Question & Solution</DialogTitle>
              <DialogDescription>
                AI-generated step-by-step solution
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh]">
              {selectedDoubt && (
                <div className="space-y-6 p-4">
                  {/* Question */}
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <HelpCircle className="h-5 w-5 text-orange-600" />
                        Your Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{selectedDoubt.questionText}</p>
                    </CardContent>
                  </Card>

                  {/* AI Solution */}
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        AI Solution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Streamdown>{selectedDoubt.aiSolution || 'Generating solution...'}</Streamdown>
                    </CardContent>
                  </Card>

                  {/* Alternative Methods */}
                  {selectedDoubt.alternativeMethods && selectedDoubt.alternativeMethods.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MessageCircle className="h-5 w-5 text-indigo-600" />
                          Alternative Methods
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedDoubt.alternativeMethods.map((method: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              <strong>Method {idx + 1}:</strong> {method}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  {!selectedDoubt.resolved && selectedDoubt.id && (
                    <Button
                      className="w-full"
                      onClick={() => handleResolveDoubt(selectedDoubt.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
