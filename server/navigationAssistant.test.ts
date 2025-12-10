import { describe, it, expect, vi, beforeEach } from "vitest";
import { navigationAssistantRouter } from "./routers/navigationAssistant";
import * as llm from "./_core/llm";

vi.mock("./_core/llm");

describe("Navigation Assistant Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("chat endpoint", () => {
    it("should generate AI response for student persona", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: "To start a lesson, click on 'Lessons' in the navigation menu."
          }
        }]
      };

      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.chat({
        message: "How do I start a lesson?",
        persona: "student",
        conversationHistory: []
      });

      expect(result.content).toBe("To start a lesson, click on 'Lessons' in the navigation menu.");
      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0].label).toBe("Start a lesson");
    });

    it("should generate AI response for teacher persona", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: "To view your classes, navigate to the Classes section in the sidebar."
          }
        }]
      };

      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.chat({
        message: "Where can I see my classes?",
        persona: "teacher",
        conversationHistory: []
      });

      expect(result.content).toBe("To view your classes, navigate to the Classes section in the sidebar.");
      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0].label).toBe("View my classes");
    });

    it("should generate AI response for parent persona", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: "You can check your child's progress in the Progress Dashboard."
          }
        }]
      };

      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.chat({
        message: "How do I check my child's progress?",
        persona: "parent",
        conversationHistory: []
      });

      expect(result.content).toBe("You can check your child's progress in the Progress Dashboard.");
      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0].label).toBe("View child's progress");
    });

    it("should include conversation history in LLM call", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: "Yes, you can also take practice tests from the Tests page."
          }
        }]
      };

      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const caller = navigationAssistantRouter.createCaller({} as any);
      await caller.chat({
        message: "What else can I do?",
        persona: "student",
        conversationHistory: [
          { role: "user", content: "How do I start a lesson?" },
          { role: "assistant", content: "Click on Lessons in the menu." }
        ]
      });

      expect(llm.invokeLLM).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user", content: "How do I start a lesson?" }),
          expect.objectContaining({ role: "assistant", content: "Click on Lessons in the menu." }),
          expect.objectContaining({ role: "user", content: "What else can I do?" })
        ])
      });
    });

    it("should return fallback message if LLM response is empty", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: ""
          }
        }]
      };

      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.chat({
        message: "Help",
        persona: "student",
        conversationHistory: []
      });

      expect(result.content).toBe("I'm here to help you navigate the platform. What would you like to do?");
    });
  });

  describe("getQuickActions endpoint", () => {
    it("should return student quick actions", async () => {
      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.getQuickActions({ persona: "student" });

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        label: "Start a lesson",
        action: "navigate_lessons"
      });
    });

    it("should return teacher quick actions", async () => {
      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.getQuickActions({ persona: "teacher" });

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        label: "View my classes",
        action: "navigate_classes"
      });
    });

    it("should return parent quick actions", async () => {
      const caller = navigationAssistantRouter.createCaller({} as any);
      const result = await caller.getQuickActions({ persona: "parent" });

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        label: "View child's progress",
        action: "navigate_child_progress"
      });
    });
  });
});
