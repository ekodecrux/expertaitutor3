import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import * as db from "./db";
import * as auth from "./auth";
import { adminRouter } from "./routers-admin";
import { contentRouter } from "./routers-content";
import { stripeRouter } from "./routers-stripe";

// ============= RBAC MIDDLEWARE =============

const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'student' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Student access required' });
  }
  return next({ ctx });
});

const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'parent' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Parent access required' });
  }
  return next({ ctx });
});

const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'teacher' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher access required' });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'institution_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// ============= ROUTERS =============

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        role: z.enum(["student", "teacher", "parent"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await auth.registerUser(input);
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.loginUser(input.email, input.password);
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, result.token, cookieOptions);
        return result;
      }),
    requestOTP: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        return await auth.requestOTP(input.email);
      }),
    verifyOTP: publicProcedure
      .input(z.object({
        email: z.string().email(),
        otp: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.verifyOTP(input.email, input.otp);
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, result.token, cookieOptions);
        return result;
      }),
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await auth.generateResetToken(input.email);
        // TODO: Send email with reset link
        // For now, return success (in production, send email)
        return { success: result.success };
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await auth.resetPasswordWithToken(input.token, input.newPassword);
      }),
    validateResetToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return await auth.getResetTokenInfo(input.token);
      }),
  }),

  // ============= STUDENT PROFILE =============
  
  profile: router({
    get: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentProfile(ctx.user.id);
    }),
    
    update: studentProcedure
      .input(z.object({
        country: z.string().optional(),
        curriculum: z.string().optional(),
        grade: z.string().optional(),
        targetExams: z.array(z.string()).optional(),
        targetYear: z.number().optional(),
        targetMonth: z.number().optional(),
        preferredLanguages: z.array(z.string()).optional(),
        preferredSubjects: z.array(z.string()).optional(),
        studyHoursPerDay: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertStudentProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    generateStudyPlan: studentProcedure
      .input(z.object({
        targetExam: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        dailyTargetMinutes: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getStudentProfile(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
        }

        // Use LLM to generate personalized study plan
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert educational planner. Generate a structured study plan based on student profile and goals.",
            },
            {
              role: "user",
              content: `Create a study plan for:
- Curriculum: ${profile.curriculum}
- Grade: ${profile.grade}
- Target Exam: ${input.targetExam}
- Duration: ${input.startDate} to ${input.endDate}
- Daily study time: ${input.dailyTargetMinutes} minutes
- Preferred subjects: ${profile.preferredSubjects?.join(', ')}

Provide a week-by-week breakdown with topics to cover.`,
            },
          ],
        });

        const planContent = response.choices[0]?.message?.content || '';

        await db.createStudyPlan({
          studentUserId: ctx.user.id,
          name: `${input.targetExam} Study Plan`,
          targetExam: input.targetExam,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          dailyTargetMinutes: input.dailyTargetMinutes,
          weeklyTargetMinutes: input.dailyTargetMinutes * 7,
          topics: [],
          aiGenerated: true,
          active: true,
        });

        return { success: true, plan: planContent };
      }),
  }),

  // ============= CURRICULUM =============
  
  curriculum: router({
    getSubjects: protectedProcedure
      .input(z.object({
        curriculum: z.string(),
        grade: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSubjectsByCurriculum(input.curriculum, input.grade);
      }),
    
    getUnits: protectedProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUnitsBySubject(input.subjectId);
      }),
    
    getTopics: protectedProcedure
      .input(z.object({ unitId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTopicsByUnit(input.unitId);
      }),
    
    getContent: protectedProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContentByTopic(input.topicId, 'live');
      }),
  }),

  // ============= AI TUTOR =============
  
  tutor: router({
    startSession: studentProcedure
      .input(z.object({
        mode: z.enum(['teaching', 'practice', 'exam', 'revision']),
        topicId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // End any active sessions
        const activeSession = await db.getActiveTutorSession(ctx.user.id);
        if (activeSession) {
          await db.updateTutorSession(activeSession.id, { active: false, endedAt: new Date() });
        }

        await db.createTutorSession({
          studentUserId: ctx.user.id,
          mode: input.mode,
          topicId: input.topicId,
          active: true,
        });

        const newSession = await db.getActiveTutorSession(ctx.user.id);
        return newSession;
      }),
    
    sendMessage: studentProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string(),
        imageUrl: z.string().optional(),
        audioUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getTutorSession(input.sessionId);
        if (!session || session.studentUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }

        // Add user message
        await db.addTutorMessage({
          sessionId: input.sessionId,
          role: 'user',
          content: input.content,
          imageUrl: input.imageUrl,
          audioUrl: input.audioUrl,
        });

        // Get conversation history
        const messages = await db.getTutorMessages(input.sessionId, 20);
        const conversationHistory = messages.reverse().map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));

        // Get student's knowledge profile for context
        let contextInfo = '';
        if (session.topicId) {
          const knowledge = await db.getKnowledgeProfile(ctx.user.id, session.topicId);
          if (knowledge) {
            contextInfo = `Student mastery: ${knowledge.masteryScore}/100, Confidence: ${knowledge.confidenceScore}/100`;
          }
        }

        // Generate AI response
        const systemPrompt = `You are an expert AI tutor in ${session.mode} mode. ${contextInfo}
- Explain concepts step-by-step
- Ask probing questions to check understanding
- Provide hints before full solutions
- Encourage academic integrity
- Adapt to the student's level`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
        });

        const aiContentRaw = response.choices[0]?.message?.content;
        const aiContent = typeof aiContentRaw === 'string' ? aiContentRaw : 'I apologize, but I encountered an error. Please try again.';

        // Add AI response
        await db.addTutorMessage({
          sessionId: input.sessionId,
          role: 'assistant',
          content: aiContent,
        });

        return { content: aiContent };
      }),
    
    getSession: studentProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getTutorSession(input.sessionId);
        if (!session || session.studentUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const messages = await db.getTutorMessages(input.sessionId);
        return { session, messages };
      }),
    
    getActiveSession: studentProcedure.query(async ({ ctx }) => {
      return await db.getActiveTutorSession(ctx.user.id);
    }),
    
    transcribeAudio: studentProcedure
      .input(z.object({
        audioUrl: z.string(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language,
        });
        if ('error' in result) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: result.error });
        }
        return { text: result.text };
      }),
  }),

  // ============= ASSESSMENTS =============
  
  tests: router({
    getBySubject: studentProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTestsBySubject(input.subjectId);
      }),
    
    getById: studentProcedure
      .input(z.object({ testId: z.number() }))
      .query(async ({ input }) => {
        const test = await db.getTestById(input.testId);
        if (!test) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Test not found' });
        }
        const questions = await db.getTestQuestions(input.testId);
        return { test, questions };
      }),
    
    startAttempt: studentProcedure
      .input(z.object({ testId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const test = await db.getTestById(input.testId);
        if (!test) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Test not found' });
        }

        await db.createTestAttempt({
          testId: input.testId,
          studentUserId: ctx.user.id,
          startedAt: new Date(),
          status: 'in_progress',
          answers: [],
        });

        const attempts = await db.getStudentTestAttempts(ctx.user.id, input.testId);
        return attempts[0];
      }),
    
    submitAnswer: studentProcedure
      .input(z.object({
        attemptId: z.number(),
        questionId: z.number(),
        answer: z.string(),
        timeSpent: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const attempt = await db.getTestAttempt(input.attemptId);
        if (!attempt || attempt.studentUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Attempt not found' });
        }

        const answers = attempt.answers || [];
        answers.push({
          questionId: input.questionId,
          answer: input.answer,
          timeSpent: input.timeSpent,
        });

        await db.updateTestAttempt(input.attemptId, { answers });
        return { success: true };
      }),
    
    submitTest: studentProcedure
      .input(z.object({ attemptId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const attempt = await db.getTestAttempt(input.attemptId);
        if (!attempt || attempt.studentUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Attempt not found' });
        }

        // Evaluate answers
        const questions = await db.getTestQuestions(attempt.testId);
        let score = 0;
        let maxScore = 0;
        let correctCount = 0;

        const evaluatedAnswers = await Promise.all((attempt.answers || []).map(async (ans) => {
          const tq = questions.find(q => q.questionId === ans.questionId);
          if (!tq || !tq.question) return { ...ans, isCorrect: false };

          maxScore += tq.marks || tq.question.marks || 0;
          
          // Auto-evaluate objective questions
          if (tq.question.type === 'mcq' || tq.question.type === 'msq') {
            const isCorrect = ans.answer === tq.question.correctAnswer;
            if (isCorrect) {
              score += tq.marks || tq.question.marks || 0;
              correctCount++;
            }
            return { ...ans, isCorrect };
          }

          // For subjective questions, use AI scoring
          if (tq.question.type === 'short_answer' || tq.question.type === 'long_answer' || tq.question.type === 'essay') {
            const scoringResponse = await invokeLLM({
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert evaluator. Score the answer objectively based on correctness, completeness, and clarity. Return only a number between 0 and the max marks.',
                },
                {
                  role: 'user',
                  content: `Question: ${tq.question.questionText}\n\nCorrect Answer: ${tq.question.correctAnswer}\n\nStudent Answer: ${ans.answer}\n\nMax Marks: ${tq.marks || tq.question.marks}\n\nProvide score:`,
                },
              ],
            });

            const contentStr = typeof scoringResponse.choices[0]?.message?.content === 'string' 
              ? scoringResponse.choices[0].message.content 
              : '0';
            const aiScore = parseInt(contentStr);
            score += aiScore;
            const isCorrect = aiScore >= (tq.marks || tq.question.marks || 0) * 0.7;
            if (isCorrect) correctCount++;
            return { ...ans, isCorrect };
          }

          return { ...ans, isCorrect: false };
        }));

        const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const timeSpent = (attempt.answers || []).reduce((sum, ans) => sum + ans.timeSpent, 0);

        await db.updateTestAttempt(input.attemptId, {
          submittedAt: new Date(),
          timeSpentSeconds: timeSpent,
          score,
          maxScore,
          accuracy,
          status: 'evaluated',
          answers: evaluatedAnswers,
        });

        // Update knowledge profiles based on performance
        for (const tq of questions) {
          if (tq.question?.topicId) {
            const existing = await db.getKnowledgeProfile(ctx.user.id, tq.question.topicId);
            const answerData = evaluatedAnswers.find(a => a.questionId === tq.questionId);
            
            const newAttempts = (existing?.attemptsCount || 0) + 1;
            const newCorrect = (existing?.correctCount || 0) + (answerData?.isCorrect ? 1 : 0);
            const newMastery = Math.round((newCorrect / newAttempts) * 100);

            await db.upsertKnowledgeProfile({
              studentUserId: ctx.user.id,
              topicId: tq.question.topicId,
              masteryScore: newMastery,
              confidenceScore: newMastery,
              attemptsCount: newAttempts,
              correctCount: newCorrect,
              lastPracticedAt: new Date(),
            });
          }
        }

        return { score, maxScore, accuracy };
      }),
    
    getAttempts: studentProcedure
      .input(z.object({ testId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getStudentTestAttempts(ctx.user.id, input.testId);
      }),
  }),

  // ============= DOUBTS =============
  
  doubts: router({
    create: studentProcedure
      .input(z.object({
        questionText: z.string(),
        questionImageUrl: z.string().optional(),
        questionAudioUrl: z.string().optional(),
        topicId: z.number().optional(),
        subjectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate AI solution
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert tutor. Provide a detailed step-by-step solution, alternative methods, and common mistakes for this question.',
            },
            {
              role: 'user',
              content: input.questionText,
            },
          ],
        });

        const contentResult = response.choices[0]?.message?.content;
        const aiSolution = typeof contentResult === 'string' ? contentResult : '';

        await db.createDoubt({
          studentUserId: ctx.user.id,
          questionText: input.questionText,
          questionImageUrl: input.questionImageUrl,
          questionAudioUrl: input.questionAudioUrl,
          topicId: input.topicId,
          subjectId: input.subjectId,
          aiSolution,
          alternativeMethods: [],
          commonMistakes: [],
        });

        return { success: true, solution: aiSolution };
      }),
    
    getAll: studentProcedure
      .input(z.object({ resolved: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getStudentDoubts(ctx.user.id, input.resolved);
      }),
    
    resolve: studentProcedure
      .input(z.object({ doubtId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const doubt = await db.getDoubtById(input.doubtId);
        if (!doubt || doubt.studentUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Doubt not found' });
        }

        await db.updateDoubt(input.doubtId, {
          resolved: true,
          resolvedAt: new Date(),
        });

        return { success: true };
      }),
  }),

  // ============= PROGRESS & ANALYTICS =============
  
  progress: router({
    getKnowledgeProfile: studentProcedure.query(async ({ ctx }) => {
      return await db.getAllKnowledgeProfiles(ctx.user.id);
    }),
    
    getActivityLogs: studentProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getActivityLogs(ctx.user.id, start, end);
      }),
    
    getGameStats: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentGameStats(ctx.user.id);
    }),
    
    getAchievements: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentAchievements(ctx.user.id);
    }),
  }),

  // ============= PARENT FEATURES =============
  
  parent: router({
    getLinkedStudents: parentProcedure.query(async ({ ctx }) => {
      return await db.getStudentsByParent(ctx.user.id);
    }),
    
    getStudentProgress: parentProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getStudentProfile(input.studentId);
        const knowledge = await db.getAllKnowledgeProfiles(input.studentId);
        const gameStats = await db.getStudentGameStats(input.studentId);
        const recentActivity = await db.getActivityLogs(input.studentId);
        
        return { profile, knowledge, gameStats, recentActivity };
      }),
  }),



  // ============= NOTIFICATIONS =============
  
  notifications: router({
    getAll: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.unreadOnly);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  // ============= ADMIN MANAGEMENT =============
  
  admin: adminRouter,

  // ============= CONTENT LIBRARY =============
  
  content: contentRouter,

  // ============= STRIPE PAYMENTS =============
  
  stripe: stripeRouter,

  // ============= FILE UPLOAD =============
  
  upload: router({
    getUploadUrl: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fileKey = `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`;
        // Return the key for client to upload to
        return { fileKey, uploadUrl: `/api/upload/${fileKey}` };
      }),
  }),

});

export type AppRouter = typeof appRouter;
