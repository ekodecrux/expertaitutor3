// Admin router - extracted for clarity
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as adminDb from "./db-admin";
import bcrypt from "bcrypt";

export const adminRouter = router({
  // ============= CLASS MANAGEMENT =============
  
  getClasses: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await adminDb.getAllClasses();
    }),

  createClass: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      branchId: z.number().optional(),
      name: z.string(),
      curriculum: z.string().optional(),
      board: z.string().optional(),
      academicYear: z.string().optional(),
      maxStudents: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const result = await adminDb.createClass(input);
      return { success: true, classId: result[0].insertId };
    }),

  updateClass: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      curriculum: z.string().optional(),
      board: z.string().optional(),
      academicYear: z.string().optional(),
      maxStudents: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...updates } = input;
      await adminDb.updateClass(id, updates);
      return { success: true };
    }),

  deleteClass: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await adminDb.deleteClass(input.id);
      return { success: true };
    }),

  // ============= SECTION MANAGEMENT =============
  
  getSections: protectedProcedure
    .input(z.object({ classId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await adminDb.getSectionsByClass(input.classId);
    }),

  createSection: protectedProcedure
    .input(z.object({
      classId: z.number(),
      name: z.string(),
      maxStudents: z.number().optional(),
      currentStudents: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const result = await adminDb.createSection(input);
      return { success: true, sectionId: result[0].insertId };
    }),

  updateSection: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      maxStudents: z.number().optional(),
      currentStudents: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...updates } = input;
      await adminDb.updateSection(id, updates);
      return { success: true };
    }),

  deleteSection: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await adminDb.deleteSection(input.id);
      return { success: true };
    }),

  // ============= STUDENT MANAGEMENT =============
  
  getStudents: protectedProcedure
    .input(z.object({
      classId: z.number().optional(),
      sectionId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await adminDb.getStudentsByFilter(input);
    }),

  createStudent: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const result = await adminDb.createUser({
        name: input.name,
        email: input.email,
        passwordHash: hashedPassword,
        role: "student",
      });
      
      return { success: true, userId: result[0].insertId };
    }),

  updateStudent: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...updates } = input;
      await adminDb.updateUser(id, updates);
      return { success: true };
    }),

  deleteStudent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await adminDb.deleteUser(input.id);
      return { success: true };
    }),

  // ============= TEACHER MANAGEMENT =============
  
  getTeachers: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await adminDb.getTeachers();
    }),

  createTeacher: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const result = await adminDb.createUser({
        name: input.name,
        email: input.email,
        passwordHash: hashedPassword,
        role: "teacher",
      });
      
      return { success: true, userId: result[0].insertId };
    }),

  updateTeacher: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...updates } = input;
      await adminDb.updateUser(id, updates);
      return { success: true };
    }),

  deleteTeacher: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await adminDb.deleteUser(input.id);
      return { success: true };
    }),

  // ============= ENROLLMENT MANAGEMENT =============
  
  enrollStudent: protectedProcedure
    .input(z.object({
      studentUserId: z.number(),
      classId: z.number(),
      sectionId: z.number(),
      status: z.enum(["active", "inactive", "graduated", "transferred"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      
      const result = await adminDb.enrollStudent({
        studentUserId: input.studentUserId,
        classId: input.classId,
        sectionId: input.sectionId,
        status: input.status || "active",
      });
      
      return { success: true, enrollmentId: result[0].insertId };
    }),

  // ============= CSV BULK IMPORT =============
  
  bulkImportCSV: protectedProcedure
    .input(z.object({
      type: z.enum(["students", "teachers"]),
      data: z.array(z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().optional(),
        classId: z.number().optional(),
        sectionId: z.number().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      
      // Hash passwords for all users
      const usersData = await Promise.all(
        input.data.map(async (row) => {
          const password = row.password || "demo123";
          const hashedPassword = await bcrypt.hash(password, 10);
          
          return {
            name: row.name,
            email: row.email,
            passwordHash: hashedPassword,
            role: input.type === "students" ? "student" as const : "teacher" as const,
            classId: row.classId,
            sectionId: row.sectionId,
          };
        })
      );
      
      return await adminDb.bulkCreateUsers(usersData);
    }),

  // ============= PARENT MANAGEMENT =============
  
  getParents: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await import("./db");
      return await db.getInstitutionParents();
    }),
});
