import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// Teacher-only procedure
const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'teacher' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher access required' });
  }
  return next({ ctx });
});

export const teacherRouter = router({
  // Get teacher's assigned classes
  getMyClasses: teacherProcedure.query(async ({ ctx }) => {
    const classes = await db.getTeacherClasses(ctx.user.id);
    return classes;
  }),

  // Get students in teacher's classes
  getMyStudents: teacherProcedure.query(async ({ ctx }) => {
    const students = await db.getTeacherStudents(ctx.user.id);
    return students;
  }),

  // Mark attendance
  markAttendance: teacherProcedure
    .input(z.object({
      classId: z.number(),
      studentId: z.number(),
      date: z.string(),
      status: z.enum(['present', 'absent', 'late', 'excused']),
    }))
    .mutation(async ({ input }) => {
      return await db.markAttendance(input);
    }),

  // Get attendance records
  getAttendance: teacherProcedure
    .input(z.object({
      classId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAttendanceRecords(input);
    }),

  // Create lesson plan
  createLessonPlan: teacherProcedure
    .input(z.object({
      classId: z.number(),
      title: z.string(),
      description: z.string(),
      date: z.string(),
      objectives: z.string(),
      materials: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createLessonPlan({ ...input, teacherId: ctx.user.id });
    }),

  // Get lesson plans
  getLessonPlans: teacherProcedure
    .input(z.object({
      classId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await db.getTeacherLessonPlans(ctx.user.id, input.classId);
    }),

  // Create assignment
  createAssignment: teacherProcedure
    .input(z.object({
      classId: z.number(),
      title: z.string(),
      description: z.string(),
      dueDate: z.string(),
      totalMarks: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createAssignment({ ...input, teacherId: ctx.user.id });
    }),

  // Get assignments
  getAssignments: teacherProcedure
    .input(z.object({
      classId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await db.getTeacherAssignments(ctx.user.id, input.classId);
    }),

  // Grade assignment submission
  gradeAssignment: teacherProcedure
    .input(z.object({
      submissionId: z.number(),
      marks: z.number(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.gradeAssignmentSubmission(input);
    }),

  // Get submissions for grading
  getSubmissions: teacherProcedure
    .input(z.object({
      assignmentId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getAssignmentSubmissions(input.assignmentId);
    }),

  // Create assessment
  createAssessment: teacherProcedure
    .input(z.object({
      classId: z.number(),
      title: z.string(),
      description: z.string(),
      date: z.string(),
      duration: z.number(),
      totalMarks: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createAssessment({ ...input, teacherId: ctx.user.id });
    }),

  // Get assessments
  getAssessments: teacherProcedure
    .input(z.object({
      classId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await db.getTeacherAssessments(ctx.user.id, input.classId);
    }),

  // Get class analytics
  getClassAnalytics: teacherProcedure
    .input(z.object({
      classId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getClassAnalytics(input.classId);
    }),

  // Schedule parent meeting
  scheduleParentMeeting: teacherProcedure
    .input(z.object({
      parentId: z.number(),
      studentId: z.number(),
      date: z.string(),
      time: z.string(),
      purpose: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.scheduleParentMeeting({ ...input, teacherId: ctx.user.id });
    }),

  // Get scheduled meetings
  getMeetings: teacherProcedure.query(async ({ ctx }) => {
    return await db.getTeacherMeetings(ctx.user.id);
  }),
});
