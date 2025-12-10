import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { 
  studentGameStats, 
  streakFreezes, 
  studentCurrency, 
  currencyTransactions,
  leaderboards,
  milestones,
  achievements,
  studentAchievements
} from "../../drizzle/schema.js";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export const gamificationRouter = router({
  /**
   * Get student's gamification stats (points, level, streak, currency)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const userId = ctx.user.id;

    // Get game stats (points, level, streak)
    let [gameStats] = await db.select()
      .from(studentGameStats)
      .where(eq(studentGameStats.studentUserId, userId))
      .limit(1);

    // Create if doesn't exist
    if (!gameStats) {
      await db.insert(studentGameStats).values({
        studentUserId: userId,
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      });
      const [newStats] = await db.select()
        .from(studentGameStats)
        .where(eq(studentGameStats.studentUserId, userId))
        .limit(1);
      if (newStats) gameStats = newStats;
    }

    // Get currency
    let [currency] = await db.select()
      .from(studentCurrency)
      .where(eq(studentCurrency.studentUserId, userId))
      .limit(1);

    // Create if doesn't exist
    if (!currency) {
      await db.insert(studentCurrency).values({
        studentUserId: userId,
        coins: 0,
        gems: 0,
        totalEarned: 0,
        totalSpent: 0,
      });
      const [newCurrency] = await db.select()
        .from(studentCurrency)
        .where(eq(studentCurrency.studentUserId, userId))
        .limit(1);
      if (newCurrency) currency = newCurrency;
    }

    // Check if student has streak freeze available (1 per week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentFreezes = await db.select()
      .from(streakFreezes)
      .where(and(
        eq(streakFreezes.studentUserId, userId),
        gte(streakFreezes.usedAt, oneWeekAgo)
      ));

    const hasStreakFreezeAvailable = recentFreezes.length === 0;

    return {
      ...gameStats,
      coins: currency?.coins || 0,
      gems: currency?.gems || 0,
      hasStreakFreezeAvailable,
    };
  }),

  /**
   * Update streak (called daily when student logs in)
   */
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [gameStats] = await db.select()
      .from(studentGameStats)
      .where(eq(studentGameStats.studentUserId, userId))
      .limit(1);

    if (!gameStats) {
      // Create new stats
      await db.insert(studentGameStats).values({
        studentUserId: userId,
        totalPoints: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      });
      return { currentStreak: 1, isNewStreak: true };
    }

    const lastActivity = new Date(gameStats.lastActivityDate!);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Already logged in today
      return { currentStreak: gameStats.currentStreak || 0, isNewStreak: false };
    } else if (daysDiff === 1) {
      // Consecutive day - increase streak
      const newStreak = (gameStats.currentStreak || 0) + 1;
      const newLongest = Math.max(newStreak, gameStats.longestStreak || 0);
      
      await db.update(studentGameStats)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
        })
        .where(eq(studentGameStats.studentUserId, userId));

      // Award coins for streak milestones
      if (newStreak % 7 === 0) {
        await awardCurrency(userId, 50, "coins", `${newStreak}-day streak milestone!`);
      }

      return { currentStreak: newStreak, isNewStreak: true };
    } else {
      // Streak broken - reset to 1
      await db.update(studentGameStats)
        .set({
          currentStreak: 1,
          lastActivityDate: today,
        })
        .where(eq(studentGameStats.studentUserId, userId));

      return { currentStreak: 1, isNewStreak: true, streakBroken: true };
    }
  }),

  /**
   * Use streak freeze to protect streak
   */
  useStreakFreeze: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      // Check if freeze is available
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentFreezes = await db.select()
        .from(streakFreezes)
        .where(and(
          eq(streakFreezes.studentUserId, userId),
          gte(streakFreezes.usedAt, oneWeekAgo)
        ));

      if (recentFreezes.length > 0) {
        throw new Error("Streak freeze already used this week");
      }

      // Record freeze usage
      await db.insert(streakFreezes).values({
        studentUserId: userId,
        usedAt: new Date(),
        reason: input.reason,
      });

      // Update last activity date to today to maintain streak
      await db.update(studentGameStats)
        .set({ lastActivityDate: new Date() })
        .where(eq(studentGameStats.studentUserId, userId));

      return { success: true, message: "Streak freeze activated!" };
    }),

  /**
   * Award points and update level
   */
  awardPoints: protectedProcedure
    .input(z.object({
      points: z.number().positive(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      const [gameStats] = await db.select()
        .from(studentGameStats)
        .where(eq(studentGameStats.studentUserId, userId))
        .limit(1);

      if (!gameStats) {
        await db.insert(studentGameStats).values({
          studentUserId: userId,
          totalPoints: input.points,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
        });
        return { totalPoints: input.points, level: 1, levelUp: false };
      }

      const newPoints = (gameStats.totalPoints || 0) + input.points;
      const oldLevel = gameStats.level || 1;
      const newLevel = calculateLevel(newPoints);

      await db.update(studentGameStats)
        .set({
          totalPoints: newPoints,
          level: newLevel,
        })
        .where(eq(studentGameStats.studentUserId, userId));

      // Award bonus coins on level up
      if (newLevel > oldLevel) {
        await awardCurrency(userId, newLevel * 10, "coins", `Level ${newLevel} bonus!`);
      }

      return {
        totalPoints: newPoints,
        level: newLevel,
        levelUp: newLevel > oldLevel,
        pointsAwarded: input.points,
      };
    }),

  /**
   * Get currency balance
   */
  getCurrency: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const userId = ctx.user.id;

    const [currency] = await db.select()
      .from(studentCurrency)
      .where(eq(studentCurrency.studentUserId, userId))
      .limit(1);

    if (!currency) {
      await db.insert(studentCurrency).values({
        studentUserId: userId,
        coins: 0,
        gems: 0,
        totalEarned: 0,
        totalSpent: 0,
      });
      return { coins: 0, gems: 0, totalEarned: 0, totalSpent: 0 };
    }

    return currency;
  }),

  /**
   * Get currency transaction history
   */
  getTransactions: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      const transactions = await db.select()
        .from(currencyTransactions)
        .where(eq(currencyTransactions.studentUserId, userId))
        .orderBy(desc(currencyTransactions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return transactions;
    }),

  /**
   * Award currency (coins or gems)
   */
  awardCurrency: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      currencyType: z.enum(["coins", "gems"]),
      reason: z.string(),
      relatedId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await awardCurrency(userId, input.amount, input.currencyType, input.reason, input.relatedId);
    }),

  /**
   * Spend currency
   */
  spendCurrency: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      currencyType: z.enum(["coins", "gems"]),
      reason: z.string(),
      relatedId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      const [currency] = await db.select()
        .from(studentCurrency)
        .where(eq(studentCurrency.studentUserId, userId))
        .limit(1);

      if (!currency) {
        throw new Error("Currency account not found");
      }

      const currentBalance = input.currencyType === "coins" ? (currency.coins || 0) : (currency.gems || 0);
      
      if (currentBalance < input.amount) {
        throw new Error(`Insufficient ${input.currencyType}. You have ${currentBalance}, need ${input.amount}`);
      }

      // Deduct currency
      const updates = input.currencyType === "coins"
        ? { coins: (currency.coins || 0) - input.amount, totalSpent: (currency.totalSpent || 0) + input.amount }
        : { gems: (currency.gems || 0) - input.amount, totalSpent: (currency.totalSpent || 0) + input.amount };

      await db.update(studentCurrency)
        .set(updates)
        .where(eq(studentCurrency.studentUserId, userId));

      // Log transaction
      await db.insert(currencyTransactions).values({
        studentUserId: userId,
        type: "spend",
        currencyType: input.currencyType,
        amount: input.amount,
        reason: input.reason,
        relatedId: input.relatedId,
      });

      return { success: true, newBalance: currentBalance - input.amount };
    }),

  /**
   * Get leaderboard (class, school, or global)
   */
  getLeaderboard: protectedProcedure
    .input(z.object({
      scope: z.enum(["class", "school", "global"]),
      period: z.enum(["daily", "weekly", "monthly", "all_time"]),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      // Get current period dates
      const { periodStart, periodEnd } = getPeriodDates(input.period);

      // For class/school scope, we need to get the user's class/school
      let scopeId: number | null = null;
      if (input.scope === "class") {
        // TODO: Get user's class ID from enrollments
        scopeId = 1; // Placeholder
      } else if (input.scope === "school") {
        // TODO: Get user's institution ID
        scopeId = 1; // Placeholder
      }

      // Get leaderboard entries
      const entries = await db.select()
        .from(leaderboards)
        .where(and(
          eq(leaderboards.scope, input.scope),
          input.scope !== "global" ? eq(leaderboards.scopeId, scopeId!) : sql`1=1`,
          eq(leaderboards.period, input.period),
          gte(leaderboards.periodStart, periodStart),
          lte(leaderboards.periodEnd, periodEnd)
        ))
        .orderBy(leaderboards.rank)
        .limit(input.limit);

      // Get user's rank
      const userEntry = entries.find((e: any) => e.studentUserId === userId);

      return {
        entries,
        userRank: userEntry?.rank || null,
        userPoints: userEntry?.points || 0,
      };
    }),

  /**
   * Get milestones
   */
  getMilestones: protectedProcedure
    .input(z.object({
      uncelebratedOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;

      const conditions = [eq(milestones.studentUserId, userId)];
      if (input.uncelebratedOnly) {
        conditions.push(eq(milestones.celebrated, false));
      }

      const userMilestones = await db.select()
        .from(milestones)
        .where(and(...conditions))
        .orderBy(desc(milestones.achievedAt));

      return userMilestones;
    }),

  /**
   * Mark milestone as celebrated
   */
  celebrateMilestone: protectedProcedure
    .input(z.object({ milestoneId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(milestones)
        .set({ celebrated: true })
        .where(eq(milestones.id, input.milestoneId));

      return { success: true };
    }),

  /**
   * Get achievements
   */
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const userId = ctx.user.id;

    // Get all achievements
    const allAchievements = await db.select().from(achievements);

    // Get user's earned achievements
    const earnedAchievements = await db.select()
      .from(studentAchievements)
      .where(eq(studentAchievements.studentUserId, userId));

    const earnedIds = new Set(earnedAchievements.map((a: any) => a.achievementId));

    return {
      all: allAchievements,
      earned: earnedAchievements,
      earnedIds: Array.from(earnedIds),
    };
  }),
});

// Helper functions

async function awardCurrency(
  userId: number,
  amount: number,
  currencyType: "coins" | "gems",
  reason: string,
  relatedId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [currency] = await db.select()
    .from(studentCurrency)
    .where(eq(studentCurrency.studentUserId, userId))
    .limit(1);

  if (!currency) {
    await db.insert(studentCurrency).values({
      studentUserId: userId,
      coins: currencyType === "coins" ? amount : 0,
      gems: currencyType === "gems" ? amount : 0,
      totalEarned: amount,
      totalSpent: 0,
    });
  } else {
    const updates = currencyType === "coins"
      ? { coins: (currency.coins || 0) + amount, totalEarned: (currency.totalEarned || 0) + amount }
      : { gems: (currency.gems || 0) + amount, totalEarned: (currency.totalEarned || 0) + amount };

    await db.update(studentCurrency)
      .set(updates)
      .where(eq(studentCurrency.studentUserId, userId));
  }

  // Log transaction
  await db.insert(currencyTransactions).values({
    studentUserId: userId,
    type: "earn",
    currencyType,
    amount,
    reason,
    relatedId,
  });

  return { success: true, amount, currencyType };
}

function calculateLevel(points: number): number {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  // Level 1: 0-99 points
  // Level 2: 100-399 points
  // Level 3: 400-899 points
  // Level 4: 900-1599 points
  // etc.
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

function getPeriodDates(period: "daily" | "weekly" | "monthly" | "all_time") {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date = now;

  switch (period) {
    case "daily":
      periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      periodStart.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "all_time":
      periodStart = new Date(2020, 0, 1); // Arbitrary start date
      break;
  }

  return { periodStart, periodEnd };
}
