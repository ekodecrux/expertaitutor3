import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  MessageSquare,
  Send,
  Book,
  Video,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Support() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const mockFAQs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on 'Forgot Password' on the login page. Follow the instructions sent to your registered email.",
    },
    {
      question: "How does the AI Tutor work?",
      answer: "The AI Tutor uses advanced language models to provide personalized explanations, answer your doubts, and guide you through problems step-by-step. You can interact via text or voice.",
    },
    {
      question: "Can I change my curriculum?",
      answer: "Yes! Go to your Profile page and update your curriculum selection. Your study plan will be automatically adjusted.",
    },
    {
      question: "How are assessments scored?",
      answer: "Objective questions (MCQ, MSQ, etc.) are scored automatically. Subjective answers are evaluated by our AI system using rubrics and can be reviewed by teachers.",
    },
    {
      question: "What is the rewards system?",
      answer: "You earn points for completing activities, maintaining streaks, and achieving milestones. Points unlock badges and help you level up!",
    },
  ];

  const mockTickets = [
    {
      id: 1,
      subject: "Cannot access video lessons",
      status: "Open",
      date: new Date(Date.now() - 86400000),
      lastReply: "Support team is investigating",
    },
    {
      id: 2,
      subject: "Question about subscription",
      status: "Resolved",
      date: new Date(Date.now() - 172800000 * 3),
      lastReply: "Issue resolved. Thank you!",
    },
  ];

  const handleSubmit = () => {
    if (!subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Support ticket created! We'll respond within 24 hours.");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Support Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help and find answers to your questions
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {mockFAQs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <CardTitle>Contact Support</CardTitle>
              </div>
              <CardDescription>
                Submit a support ticket and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <Input
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <CardTitle>Other Contact Methods</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    support@myschool-hcl-jigsaw.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {mockTickets.length > 0 ? (
            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                        <CardDescription>
                          Created {ticket.date.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={ticket.status === 'Open' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MessageSquare className="h-4 w-4" />
                      <span>Last reply: {ticket.lastReply}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400">
                  No support tickets yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>User Guide</CardTitle>
                    <CardDescription>Complete platform documentation</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Video Tutorials</CardTitle>
                    <CardDescription>Learn how to use the platform</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
