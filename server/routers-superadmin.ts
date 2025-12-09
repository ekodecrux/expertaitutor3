import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// Super admin-only procedure
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
  }
  return next({ ctx });
});

export const superAdminRouter = router({
  // Get all organizations
  getOrganizations: superAdminProcedure.query(async () => {
    return await db.getAllOrganizations();
  }),

  // Create organization
  createOrganization: superAdminProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['university', 'school', 'coaching_center', 'other']),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createInstitution(input);
    }),

  // Get all platform users
  getAllUsers: superAdminProcedure.query(async () => {
    return await db.getPlatformUsers();
  }),

  // Get all subscriptions
  getSubscriptions: superAdminProcedure.query(async () => {
    return await db.getPlatformSubscriptions();
  }),

  // Get platform analytics
  getPlatformAnalytics: superAdminProcedure.query(async () => {
    return await db.getPlatformAnalytics();
  }),

  // Get revenue reports
  getRevenueReports: superAdminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getRevenueReports(input.startDate, input.endDate);
    }),

  // Update organization status
  updateOrganizationStatus: superAdminProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.enum(['active', 'suspended', 'inactive']),
    }))
    .mutation(async ({ input }) => {
      // Will implement when status field is added to institutions table
      return { success: true, ...input };
    }),
});
