import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// Parent-only procedure
const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'parent' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Parent access required' });
  }
  return next({ ctx });
});

export const parentRouter = router({
  // Get parent's children
  getChildren: parentProcedure.query(async ({ ctx }) => {
    return await db.getParentChildren(ctx.user.id);
  }),

  // Get child's progress
  getChildProgress: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getChildProgress(input.studentId);
    }),

  // Get child's attendance
  getChildAttendance: parentProcedure
    .input(z.object({
      studentId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getChildAttendance(input.studentId, input.startDate, input.endDate);
    }),

  // Get child's assessments
  getChildAssessments: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getChildAssessments(input.studentId);
    }),

  // Get parent-teacher meetings
  getMeetings: parentProcedure.query(async ({ ctx }) => {
    return await db.getParentMeetings(ctx.user.id);
  }),

  // Request meeting with teacher
  requestMeeting: parentProcedure
    .input(z.object({
      teacherId: z.number(),
      studentId: z.number(),
      preferredDate: z.string(),
      preferredTime: z.string(),
      purpose: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.scheduleParentMeeting({
        parentId: ctx.user.id,
        ...input,
      });
    }),
});
