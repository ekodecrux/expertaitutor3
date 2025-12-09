// Content management router - for content library and approval workflow
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  contentSources, 
  contentApprovalQueue, 
  scrapingLogs,
  contentItems,
  contentFavorites,
} from "../drizzle/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { runScraper, runScraperV2 } from "./content-scraper";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const contentRouter = router({
  // ============= FAVORITES/BOOKMARKS =============
  
  addFavorite: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.insert(contentFavorites).values({
        userId: ctx.user.id,
        contentId: input.contentId,
      }).onDuplicateKeyUpdate({ set: { userId: ctx.user.id } });

      return { success: true };
    }),

  removeFavorite: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(contentFavorites)
        .where(and(
          eq(contentFavorites.userId, ctx.user.id),
          eq(contentFavorites.contentId, input.contentId)
        ));

      return { success: true };
    }),

  getFavorites: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const favorites = await db.select()
        .from(contentFavorites)
        .where(eq(contentFavorites.userId, ctx.user.id))
        .orderBy(desc(contentFavorites.createdAt))
        .limit(input?.limit || 100);

      // Get content details for each favorite
      const contentIds = favorites.map(f => f.contentId);
      if (contentIds.length === 0) return [];

      const content = await db.select()
        .from(contentItems)
        .where(inArray(contentItems.id, contentIds));

      return content;
    }),

  isFavorite: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;

      const [favorite] = await db.select()
        .from(contentFavorites)
        .where(and(
          eq(contentFavorites.userId, ctx.user.id),
          eq(contentFavorites.contentId, input.contentId)
        ))
        .limit(1);

      return !!favorite;
    }),

  getFavoritesCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;

      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(contentFavorites)
        .where(eq(contentFavorites.userId, ctx.user.id));

      return result?.count || 0;
    }),

  getRecommendations: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Get user's favorited content
      const favorites = await db.select()
        .from(contentFavorites)
        .where(eq(contentFavorites.userId, ctx.user.id))
        .limit(50);

      if (favorites.length === 0) {
        // No favorites yet, return popular content
        return await db.select()
          .from(contentItems)
          .where(eq(contentItems.status, "live"))
          .orderBy(desc(contentItems.createdAt))
          .limit(input?.limit || 10);
      }

      // Get details of favorited content
      const favoritedIds = favorites.map(f => f.contentId);
      const favoritedContent = await db.select()
        .from(contentItems)
        .where(inArray(contentItems.id, favoritedIds));

      // Extract common attributes from favorites
      const topicIds = Array.from(new Set(favoritedContent.map(c => c.topicId)));
      const difficulties = Array.from(new Set(favoritedContent.map(c => c.difficulty).filter(Boolean)));
      const types = Array.from(new Set(favoritedContent.map(c => c.type)));

      // Find similar content (same topics, similar difficulty, not already favorited)
      const recommendations = await db.select()
        .from(contentItems)
        .where(and(
          eq(contentItems.status, "live"),
          sql`${contentItems.id} NOT IN (${favoritedIds.join(',')})`
        ))
        .limit(100);

      // Score and rank recommendations
      const scored = recommendations.map(item => {
        let score = 0;
        
        // Topic match (highest weight)
        if (topicIds.includes(item.topicId)) score += 10;
        
        // Difficulty match
        if (item.difficulty && difficulties.includes(item.difficulty)) score += 5;
        
        // Type match
        if (types.includes(item.type)) score += 3;
        
        // Exam tags overlap
        if (item.examTags && Array.isArray(item.examTags)) {
          const favoritedExamTags = favoritedContent
            .flatMap(c => (c.examTags as string[]) || [])
            .filter(Boolean);
          const overlap = (item.examTags as string[]).filter(tag => 
            favoritedExamTags.includes(tag)
          ).length;
          score += overlap * 2;
        }

        return { ...item, score };
      });

      // Sort by score and return top recommendations
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, input?.limit || 10);
    }),


  // ============= CONTENT SOURCES MANAGEMENT =============
  
  getSources: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(contentSources).orderBy(desc(contentSources.createdAt));
    }),

  createSource: adminProcedure
    .input(z.object({
      name: z.string(),
      sourceType: z.enum(["website", "pdf", "video", "api"]),
      baseUrl: z.string().optional(),
      curriculum: z.string().optional(),
      subjects: z.array(z.string()).optional(),
      scrapingConfig: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(contentSources).values({
        name: input.name,
        sourceType: input.sourceType,
        baseUrl: input.baseUrl,
        curriculum: input.curriculum,
        subjects: input.subjects,
        scrapingConfig: input.scrapingConfig,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, sourceId: result[0].insertId };
    }),

  updateSource: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["active", "paused", "error"]).optional(),
      scrapingConfig: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      await db.update(contentSources)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(contentSources.id, id));

      return { success: true };
    }),

  deleteSource: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(contentSources).where(eq(contentSources.id, input.id));
      return { success: true };
    }),

  // ============= SCRAPING OPERATIONS =============

  runScraper: adminProcedure
    .input(z.object({ sourceId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await runScraperV2(input.sourceId);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  getScrapingLogs: adminProcedure
    .input(z.object({
      sourceId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(scrapingLogs);
      
      if (input.sourceId) {
        query = query.where(eq(scrapingLogs.sourceId, input.sourceId)) as any;
      }

      return await query.orderBy(desc(scrapingLogs.createdAt)).limit(input.limit);
    }),

  // ============= APPROVAL QUEUE MANAGEMENT =============

  getApprovalQueue: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "needs_review"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(contentApprovalQueue);

      if (input.status) {
        query = query.where(eq(contentApprovalQueue.status, input.status)) as any;
      }

      return await query.orderBy(desc(contentApprovalQueue.createdAt)).limit(input.limit);
    }),

  approveContent: adminProcedure
    .input(z.object({
      queueId: z.number(),
      topicId: z.number(),
      difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
      bloomLevel: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get queue item
      const [queueItem] = await db.select()
        .from(contentApprovalQueue)
        .where(eq(contentApprovalQueue.id, input.queueId))
        .limit(1);

      if (!queueItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Queue item not found" });
      }

      // Create content item
      const result = await db.insert(contentItems).values({
        topicId: input.topicId,
        type: queueItem.contentType,
        title: queueItem.title,
        description: queueItem.description,
        content: queueItem.content,
        url: queueItem.url,
        fileKey: queueItem.fileKey,
        difficulty: input.difficulty || (queueItem.metadata as any)?.difficulty,
        examTags: (queueItem.metadata as any)?.examTags,
        bloomLevel: input.bloomLevel,
        status: "approved",
        authorId: ctx.user.id,
        reviewerId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update queue item
      await db.update(contentApprovalQueue)
        .set({
          status: "approved",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          approvedContentItemId: result[0].insertId,
          updatedAt: new Date(),
        })
        .where(eq(contentApprovalQueue.id, input.queueId));

      return { success: true, contentItemId: result[0].insertId };
    }),

  rejectContent: adminProcedure
    .input(z.object({
      queueId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(contentApprovalQueue)
        .set({
          status: "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          rejectionReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(contentApprovalQueue.id, input.queueId));

      return { success: true };
    }),

  markNeedsReview: adminProcedure
    .input(z.object({
      queueId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(contentApprovalQueue)
        .set({
          status: "needs_review",
          updatedAt: new Date(),
        })
        .where(eq(contentApprovalQueue.id, input.queueId));

      return { success: true };
    }),

  // ============= CONTENT LIBRARY BROWSING =============

  getContent: protectedProcedure
    .input(z.object({
      topicId: z.number().optional(),
      type: z.enum(["note", "video", "slide", "simulation", "question", "past_paper"]).optional(),
      difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(contentItems.status, "live")];

      if (input.topicId) {
        conditions.push(eq(contentItems.topicId, input.topicId));
      }

      if (input.type) {
        conditions.push(eq(contentItems.type, input.type));
      }

      if (input.difficulty) {
        conditions.push(eq(contentItems.difficulty, input.difficulty));
      }

      return await db.select()
        .from(contentItems)
        .where(and(...conditions))
        .orderBy(desc(contentItems.createdAt))
        .limit(input.limit);
    }),

  getContentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [content] = await db.select()
        .from(contentItems)
        .where(eq(contentItems.id, input.id))
        .limit(1);

      return content || null;
    }),

  // ============= STATISTICS =============

  getContentStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return {
        totalSources: 0,
        activeSources: 0,
        pendingApproval: 0,
        approvedContent: 0,
        totalScrapingRuns: 0,
      };

      const sources = await db.select().from(contentSources);
      const activeSources = sources.filter((s: any) => s.status === "active");
      
      const queueItems = await db.select().from(contentApprovalQueue);
      const pendingItems = queueItems.filter((q: any) => q.status === "pending");
      
      const contentItemsList = await db.select().from(contentItems);
      const approvedItems = contentItemsList.filter((c: any) => c.status === "approved" || c.status === "live");
      
      const logs = await db.select().from(scrapingLogs);

      return {
        totalSources: sources.length,
        activeSources: activeSources.length,
        pendingApproval: pendingItems.length,
        approvedContent: approvedItems.length,
        totalScrapingRuns: logs.length,
      };
    }),
});
