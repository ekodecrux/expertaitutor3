import { router, protectedProcedure } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../db.js";
import { reviewSchedules, reviewSessions } from "../../drizzle/schema.js";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";

/**
 * Spaced Repetition System using SM-2 Algorithm
 * Based on SuperMemo 2 algorithm for optimal review scheduling
 */

/**
 * SM-2 Algorithm Implementation
 * 
 * Quality (q): 0-5 scale
 * - 5: Perfect response
 * - 4: Correct response after hesitation
 * - 3: Correct response with serious difficulty
 * - 2: Incorrect response; correct one seemed easy to recall
 * - 1: Incorrect response; correct one seemed familiar
 * - 0: Complete blackout
 * 
 * EF (Ease Factor): 1.3 - 2.5+
 * - Starts at 2.5
 * - Decreases when q < 3
 * - Increases when q >= 3
 * 
 * Interval (I): Days until next review
 * - I(1) = 1 day
 * - I(2) = 6 days
 * - I(n) = I(n-1) * EF
 */

function calculateSM2(
  quality: number, // 0-5
  oldEaseFactor: number,
  oldInterval: number,
  oldRepetitions: number
): { easeFactor: number; interval: number; repetitions: number } {
  // Calculate new ease factor
  let newEaseFactor = oldEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Clamp ease factor between 1.3 and 2.5
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  
  let newInterval: number;
  let newRepetitions: number;
  
  if (quality < 3) {
    // Failed review - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful review
    newRepetitions = oldRepetitions + 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(oldInterval * newEaseFactor);
    }
  }
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
  };
}

/**
 * Convert difficulty rating to SM-2 quality score
 */
function difficultyToQuality(difficulty: "again" | "hard" | "good" | "easy"): number {
  switch (difficulty) {
    case "again": return 0; // Complete failure
    case "hard": return 3;  // Correct with difficulty
    case "good": return 4;  // Correct after hesitation
    case "easy": return 5;  // Perfect recall
    default: return 3;
  }
}

/**
 * Update due status based on next review date
 */
function calculateDueStatus(nextReviewAt: Date): "not_due" | "due_soon" | "due_now" | "overdue" {
  const now = new Date();
  const hoursUntilDue = (nextReviewAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDue > 24) return "not_due";
  if (hoursUntilDue > 0) return "due_soon";
  if (hoursUntilDue > -24) return "due_now";
  return "overdue";
}

export const spacedRepetitionRouter = router({
  /**
   * Get all due reviews for a student
   */
  getDueReviews: protectedProcedure
    .input(z.object({
      includeNotDue: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      const now = new Date();
      
      const baseConditions = [eq(reviewSchedules.studentUserId, userId)];
      if (!input.includeNotDue) {
        baseConditions.push(lte(reviewSchedules.nextReviewAt, now));
      }
      
      const schedules = await db.select()
        .from(reviewSchedules)
        .where(and(...baseConditions))
        .orderBy(reviewSchedules.nextReviewAt);
      
      return {
        dueNow: schedules.filter(s => s.dueStatus === "due_now" || s.dueStatus === "overdue"),
        dueSoon: schedules.filter(s => s.dueStatus === "due_soon"),
        notDue: schedules.filter(s => s.dueStatus === "not_due"),
        total: schedules.length,
      };
    }),

  /**
   * Get review statistics
   */
  getReviewStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const userId = ctx.user.id;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get total schedules
    const [totalSchedules] = await db.select({ count: sql<number>`count(*)` })
      .from(reviewSchedules)
      .where(eq(reviewSchedules.studentUserId, userId));
    
    // Get due counts
    const [dueCount] = await db.select({ count: sql<number>`count(*)` })
      .from(reviewSchedules)
      .where(and(
        eq(reviewSchedules.studentUserId, userId),
        lte(reviewSchedules.nextReviewAt, now)
      ));
    
    // Get reviews this week
    const weekSessions = await db.select()
      .from(reviewSessions)
      .where(and(
        eq(reviewSessions.studentUserId, userId),
        gte(reviewSessions.reviewedAt, oneWeekAgo)
      ));
    
    const weeklyReviews = weekSessions.length;
    const weeklyAvgScore = weekSessions.length > 0
      ? weekSessions.reduce((sum, s) => sum + s.score, 0) / weekSessions.length
      : 0;
    
    return {
      totalSchedules: totalSchedules?.count || 0,
      dueCount: dueCount?.count || 0,
      weeklyReviews,
      weeklyAvgScore: Math.round(weeklyAvgScore),
    };
  }),

  /**
   * Add a new item to review schedule
   */
  addToSchedule: protectedProcedure
    .input(z.object({
      contentType: z.enum(["topic", "concept", "question"]),
      topicId: z.number().optional(),
      conceptId: z.number().optional(),
      questionId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      
      // Check if already scheduled
      const existing = await db.select()
        .from(reviewSchedules)
        .where(and(
          eq(reviewSchedules.studentUserId, userId),
          eq(reviewSchedules.contentType, input.contentType),
          input.topicId ? eq(reviewSchedules.topicId, input.topicId) : sql`1=1`,
          input.conceptId ? eq(reviewSchedules.conceptId, input.conceptId) : sql`1=1`,
          input.questionId ? eq(reviewSchedules.questionId, input.questionId) : sql`1=1`
        ))
        .limit(1);
      
      if (existing.length > 0) {
        return { success: false, message: "Already scheduled", scheduleId: existing[0].id };
      }
      
      // Create new schedule (first review in 1 day)
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + 1);
      
      const [result] = await db.insert(reviewSchedules).values({
        studentUserId: userId,
        contentType: input.contentType,
        topicId: input.topicId,
        conceptId: input.conceptId,
        questionId: input.questionId,
        easeFactor: "2.50",
        interval: 1,
        repetitions: 0,
        nextReviewAt,
        dueStatus: "not_due",
        totalReviews: 0,
        successfulReviews: 0,
      });
      
      return { success: true, scheduleId: result.insertId };
    }),

  /**
   * Record a review session and update schedule
   */
  recordReview: protectedProcedure
    .input(z.object({
      scheduleId: z.number(),
      score: z.number().min(0).max(100),
      difficulty: z.enum(["again", "hard", "good", "easy"]),
      timeSpentSeconds: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      
      // Get current schedule
      const [schedule] = await db.select()
        .from(reviewSchedules)
        .where(and(
          eq(reviewSchedules.id, input.scheduleId),
          eq(reviewSchedules.studentUserId, userId)
        ))
        .limit(1);
      
      if (!schedule) {
        throw new Error("Schedule not found");
      }
      
      // Convert difficulty to quality score
      const quality = difficultyToQuality(input.difficulty);
      
      // Calculate new SM-2 values
      const oldEaseFactor = parseFloat(schedule.easeFactor);
      const { easeFactor, interval, repetitions } = calculateSM2(
        quality,
        oldEaseFactor,
        schedule.interval,
        schedule.repetitions
      );
      
      // Calculate next review date
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);
      
      const dueStatus = calculateDueStatus(nextReviewAt);
      
      // Update schedule
      const newTotalReviews = (schedule.totalReviews || 0) + 1;
      const newSuccessfulReviews = (schedule.successfulReviews || 0) + (quality >= 3 ? 1 : 0);
      const newAvgScore = schedule.averageScore
        ? Math.round((schedule.averageScore * (schedule.totalReviews || 0) + input.score) / newTotalReviews)
        : input.score;
      
      await db.update(reviewSchedules)
        .set({
          easeFactor: easeFactor.toFixed(2),
          interval,
          repetitions,
          lastReviewedAt: new Date(),
          nextReviewAt,
          dueStatus,
          totalReviews: newTotalReviews,
          successfulReviews: newSuccessfulReviews,
          averageScore: newAvgScore,
        })
        .where(eq(reviewSchedules.id, input.scheduleId));
      
      // Record session
      await db.insert(reviewSessions).values({
        studentUserId: userId,
        scheduleId: input.scheduleId,
        score: input.score,
        timeSpentSeconds: input.timeSpentSeconds,
        difficulty: input.difficulty,
        oldInterval: schedule.interval,
        newInterval: interval,
        oldEaseFactor: oldEaseFactor.toFixed(2),
        newEaseFactor: easeFactor.toFixed(2),
      });
      
      return {
        success: true,
        nextReviewAt,
        interval,
        easeFactor,
        message: quality >= 3 ? "Great job! Review scheduled." : "Keep practicing! Review sooner.",
      };
    }),

  /**
   * Get review history
   */
  getReviewHistory: protectedProcedure
    .input(z.object({
      scheduleId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      
      const baseConditions = [eq(reviewSessions.studentUserId, userId)];
      if (input.scheduleId) {
        baseConditions.push(eq(reviewSessions.scheduleId, input.scheduleId));
      }
      
      const finalQuery2 = db.select()
        .from(reviewSessions)
        .where(and(...baseConditions));
      
      const sessions = await finalQuery2
        .orderBy(desc(reviewSessions.reviewedAt))
        .limit(input.limit);
      
      return sessions;
    }),

  /**
   * Remove from schedule
   */
  removeFromSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      
      await db.delete(reviewSchedules)
        .where(and(
          eq(reviewSchedules.id, input.scheduleId),
          eq(reviewSchedules.studentUserId, userId)
        ));
      
      return { success: true };
    }),
});
