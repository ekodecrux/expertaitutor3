import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { invokeLLM } from "../_core/llm.js";

const personaSystemPrompts = {
  student: `You are a helpful navigation assistant for students using the AI Professor platform.

Your role:
- Guide students to find lessons, practice tests, and study materials
- Help them understand their progress and performance
- Suggest next steps based on their learning journey
- Explain features like AI Tutor, spaced repetition, and gamification

Be friendly, encouraging, and concise. Use simple language and provide specific navigation steps.`,

  teacher: `You are a helpful navigation assistant for teachers using the AI Professor platform.

Your role:
- Guide teachers to create and manage classes
- Help them track student performance and progress
- Explain how to schedule video classes and assign content
- Show them analytics and reporting features

Be professional, efficient, and provide clear instructions. Focus on classroom management and student oversight.`,

  parent: `You are a helpful navigation assistant for parents using the AI Professor platform.

Your role:
- Help parents track their child's learning progress
- Explain performance reports and analytics
- Guide them to communication features (messaging teachers, viewing schedules)
- Suggest ways to support their child's learning

Be warm, reassuring, and explain educational concepts clearly. Focus on progress tracking and parent-teacher collaboration.`
};

const quickActionsByPersona = {
  student: [
    { label: "Start a lesson", action: "navigate_lessons" },
    { label: "Take a practice test", action: "navigate_tests" },
    { label: "Check my progress", action: "navigate_progress" },
    { label: "Ask AI Tutor", action: "navigate_ai_tutor" }
  ],
  teacher: [
    { label: "View my classes", action: "navigate_classes" },
    { label: "Schedule a class", action: "navigate_schedule" },
    { label: "Check student performance", action: "navigate_analytics" },
    { label: "Create assignment", action: "navigate_assignments" }
  ],
  parent: [
    { label: "View child's progress", action: "navigate_child_progress" },
    { label: "Contact teacher", action: "navigate_messaging" },
    { label: "Check upcoming classes", action: "navigate_schedule" },
    { label: "View performance report", action: "navigate_reports" }
  ]
};

export const navigationAssistantRouter = router({
  chat: publicProcedure
    .input(z.object({
      message: z.string().min(1),
      persona: z.enum(['student', 'teacher', 'parent']),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })).optional().default([])
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = personaSystemPrompts[input.persona];
      
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: "user" as const, content: input.message }
      ];

      const response = await invokeLLM({ messages });
      
      const assistantMessage = response.choices[0]?.message?.content || 
        "I'm here to help you navigate the platform. What would you like to do?";

      return {
        content: assistantMessage,
        suggestions: quickActionsByPersona[input.persona]
      };
    }),

  getQuickActions: publicProcedure
    .input(z.object({
      persona: z.enum(['student', 'teacher', 'parent'])
    }))
    .query(({ input }) => {
      return quickActionsByPersona[input.persona];
    })
});
