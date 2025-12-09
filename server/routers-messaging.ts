import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  conversations, 
  conversationParticipants, 
  messages, 
  messageReadStatus,
  users 
} from "../drizzle/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export const messagingRouter = router({
  // Get all conversations for current user
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;
      
      // Get conversations where user is a participant
      
      const userConversations: any = await db
        .select({
          id: conversations.id,
          type: conversations.type,
          title: conversations.title,
          createdBy: conversations.createdBy,
          createdAt: conversations.createdAt,
          lastMessageAt: conversations.lastMessageAt,
          participantId: conversationParticipants.id,
          lastReadAt: conversationParticipants.lastReadAt,
        })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .where(
          and(
            eq(conversationParticipants.userId, userId),
            sql`${conversationParticipants.leftAt} IS NULL`
          )
        )
        .orderBy(desc(conversations.lastMessageAt));

      // Get unread counts for each conversation
      const conversationIds = userConversations.map((c: any) => c.id);
      
      if (conversationIds.length === 0) {
        return [];
      }

      const unreadCounts = await db
        .select({
          conversationId: messages.conversationId,
          count: sql<number>`COUNT(*)`,
        })
        .from(messages)
        .leftJoin(
          messageReadStatus,
          and(
            eq(messages.id, messageReadStatus.messageId),
            eq(messageReadStatus.userId, userId)
          )
        )
        .where(
          and(
            inArray(messages.conversationId, conversationIds),
            sql`${messageReadStatus.id} IS NULL`,
            sql`${messages.senderId} != ${userId}`
          )
        )
        .groupBy(messages.conversationId);

      const unreadMap = new Map(unreadCounts.map((u: any) => [u.conversationId, u.count]));

      // Get other participants for each conversation
      const allParticipants = await db
        .select({
          conversationId: conversationParticipants.conversationId,
          userId: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profilePhotoUrl: users.profilePhotoUrl,
        })
        .from(conversationParticipants)
        .innerJoin(users, eq(conversationParticipants.userId, users.id))
        .where(
          and(
            inArray(conversationParticipants.conversationId, conversationIds),
            sql`${conversationParticipants.leftAt} IS NULL`
          )
        );

      const participantsMap = new Map<number, any[]>();
      allParticipants.forEach((p: any) => {
        if (!participantsMap.has(p.conversationId)) {
          participantsMap.set(p.conversationId, []);
        }
        if (p.userId !== userId) {
          participantsMap.get(p.conversationId)!.push({
            id: p.userId,
            name: p.name,
            email: p.email,
            role: p.role,
            profilePhotoUrl: p.profilePhotoUrl,
          });
        }
      });

      return userConversations.map((conv: any) => ({
        ...conv,
        unreadCount: unreadMap.get(conv.id) || 0,
        participants: participantsMap.get(conv.id) || [],
      }));
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Verify user is participant
      const participant = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, userId),
            sql`${conversationParticipants.leftAt} IS NULL`
          )
        )
        .limit(1);

      if (participant.length === 0) {
        throw new TRPCError({ 
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation"
        });
      }

      const msgs = await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          content: messages.content,
          attachmentUrl: messages.attachmentUrl,
          attachmentType: messages.attachmentType,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderEmail: users.email,
          senderRole: users.role,
          senderPhoto: users.profilePhotoUrl,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            sql`${messages.deletedAt} IS NULL`
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return msgs.reverse();
    }),

  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({
      type: z.enum(["direct", "group"]),
      title: z.string().optional(),
      participantIds: z.array(z.number()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Create conversation
      const [conversation] = await db
        .insert(conversations)
        .values({
          type: input.type,
          title: input.title,
          createdBy: userId,
        })
        .$returningId();

      // Add participants (including creator)
      const allParticipantIds = [userId, ...input.participantIds];
      await db.insert(conversationParticipants).values(
        allParticipantIds.map(id => ({
          conversationId: conversation.id,
          userId: id,
        }))
      );

      return { conversationId: conversation.id };
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
      attachmentUrl: z.string().optional(),
      attachmentType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Verify user is participant
      const participant = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, userId),
            sql`${conversationParticipants.leftAt} IS NULL`
          )
        )
        .limit(1);

      if (participant.length === 0) {
        throw new TRPCError({ 
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation"
        });
      }

      // Insert message
      const [message] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: userId,
          content: input.content,
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
        })
        .$returningId();

      // Update conversation lastMessageAt
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return { messageId: message.id };
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Get all unread messages in this conversation
      const unreadMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .leftJoin(
          messageReadStatus,
          and(
            eq(messages.id, messageReadStatus.messageId),
            eq(messageReadStatus.userId, userId)
          )
        )
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            sql`${messageReadStatus.id} IS NULL`,
            sql`${messages.senderId} != ${userId}`
          )
        );

      if (unreadMessages.length > 0) {
        await db.insert(messageReadStatus).values(
          unreadMessages.map((msg: any) => ({
            messageId: msg.id,
            userId: userId,
          }))
        );

        // Update lastReadAt for participant
        await db
          .update(conversationParticipants)
          .set({ lastReadAt: new Date() })
          .where(
            and(
              eq(conversationParticipants.conversationId, input.conversationId),
              eq(conversationParticipants.userId, userId)
            )
          );
      }

      return { success: true };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Get conversations where user is a participant
      const userConversationIds = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .where(
          and(
            eq(conversationParticipants.userId, userId),
            sql`${conversationParticipants.leftAt} IS NULL`
          )
        );

      if (userConversationIds.length === 0) {
        return { count: 0 };
      }

      const conversationIds = userConversationIds.map((c: any) => c.id);

      const [result] = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(messages)
        .leftJoin(
          messageReadStatus,
          and(
            eq(messages.id, messageReadStatus.messageId),
            eq(messageReadStatus.userId, userId)
          )
        )
        .where(
          and(
            inArray(messages.conversationId, conversationIds),
            sql`${messageReadStatus.id} IS NULL`,
            sql`${messages.senderId} != ${userId}`
          )
        );

      return { count: result?.count || 0 };
    }),

  // Find or create direct conversation with another user
  findOrCreateDirectConversation: protectedProcedure
    .input(z.object({
      otherUserId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Find existing direct conversation between these two users
      const existing = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .where(
          and(
            eq(conversations.type, "direct"),
            eq(conversationParticipants.userId, userId)
          )
        )
        .groupBy(conversations.id)
        .having(
          sql`COUNT(DISTINCT ${conversationParticipants.userId}) = 2 
              AND SUM(CASE WHEN ${conversationParticipants.userId} = ${input.otherUserId} THEN 1 ELSE 0 END) = 1`
        )
        .limit(1);

      if (existing.length > 0) {
        return { conversationId: existing[0].id };
      }

      // Create new conversation
      const [conversation] = await db
        .insert(conversations)
        .values({
          type: "direct",
          createdBy: userId,
        })
        .$returningId();

      await db.insert(conversationParticipants).values([
        { conversationId: conversation.id, userId: userId },
        { conversationId: conversation.id, userId: input.otherUserId },
      ]);

      return { conversationId: conversation.id };
    }),
});
