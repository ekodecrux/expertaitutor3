import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createStudentContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-student",
    email: "student@example.com",
    name: "Test Student",
    loginMethod: "manus",
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Profile Management", () => {
  it("should allow student to update profile", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.update({
      country: "India",
      curriculum: "CBSE",
      grade: "10",
      targetExams: ["JEE", "NEET"],
      preferredLanguages: ["English", "Hindi"],
      preferredSubjects: ["Mathematics", "Physics"],
      studyHoursPerDay: 4,
    });

    expect(result).toEqual({ success: true });
  });

  it("should retrieve student profile", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    // First update profile
    await caller.profile.update({
      country: "India",
      curriculum: "CBSE",
      grade: "10",
    });

    // Then retrieve it
    const profile = await caller.profile.get();
    
    expect(profile).toBeDefined();
    if (profile) {
      expect(profile.userId).toBe(1);
      expect(profile.curriculum).toBe("CBSE");
    }
  });
});

describe("AI Tutor Session", () => {
  it("should start a new tutor session", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.tutor.startSession({
      mode: "teaching",
      topicId: 1,
    });

    expect(session).toBeDefined();
    if (session) {
      expect(session.studentUserId).toBe(1);
      expect(session.mode).toBe("teaching");
      expect(session.active).toBe(true);
    }
  });

  it("should get active tutor session", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    // Start a session
    await caller.tutor.startSession({
      mode: "practice",
    });

    // Get active session
    const activeSession = await caller.tutor.getActiveSession();

    expect(activeSession).toBeDefined();
    if (activeSession) {
      expect(activeSession.studentUserId).toBe(1);
      expect(activeSession.active).toBe(true);
    }
  });
});

describe("Progress Tracking", () => {
  it("should retrieve knowledge profile", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const knowledgeProfiles = await caller.progress.getKnowledgeProfile();

    expect(Array.isArray(knowledgeProfiles)).toBe(true);
  });

  it("should retrieve game stats", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const gameStats = await caller.progress.getGameStats();

    // May be undefined for new users
    expect(gameStats === undefined || typeof gameStats === 'object').toBe(true);
  });

  it("should retrieve activity logs", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const activityLogs = await caller.progress.getActivityLogs({});

    expect(Array.isArray(activityLogs)).toBe(true);
  });
});

describe("Doubts System", () => {
  it("should create a new doubt", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.doubts.create({
      questionText: "What is the quadratic formula?",
      topicId: 1,
      subjectId: 1,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.solution).toBeDefined();
  }, 15000);

  it("should retrieve unresolved doubts", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const doubts = await caller.doubts.getAll({ resolved: false });

    expect(Array.isArray(doubts)).toBe(true);
  });
});

describe("Notifications", () => {
  it("should retrieve user notifications", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.getAll({});

    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should retrieve only unread notifications", async () => {
    const { ctx } = createStudentContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.getAll({ unreadOnly: true });

    expect(Array.isArray(notifications)).toBe(true);
  });
});
