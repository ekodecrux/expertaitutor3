import { eq, and, desc, asc, sql, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  studentProfiles,
  parentStudentLinks,
  institutions,
  subjects,
  units,
  topics,
  contentItems,
  questions,
  studyPlans,
  knowledgeProfiles,
  tests,
  testQuestions,
  testAttempts,
  tutorSessions,
  tutorMessages,
  doubts,
  achievements,
  studentAchievements,
  studentGameStats,
  activityLogs,
  subscriptionPlans,
  subscriptions,
  payments,
  notifications,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER MANAGEMENT =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ============= STUDENT PROFILES =============

export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStudentProfile(profile: typeof studentProfiles.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(studentProfiles).values(profile).onDuplicateKeyUpdate({
    set: profile,
  });
}

// ============= PARENT-STUDENT LINKS =============

export async function linkParentToStudent(parentUserId: number, studentUserId: number, relationship: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(parentStudentLinks).values({ parentUserId, studentUserId, relationship });
}

export async function getStudentsByParent(parentUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const links = await db.select().from(parentStudentLinks).where(eq(parentStudentLinks.parentUserId, parentUserId));
  const studentIds = links.map(l => l.studentUserId);
  if (studentIds.length === 0) return [];
  return await db.select().from(users).where(inArray(users.id, studentIds));
}

// ============= INSTITUTIONS =============

export async function createInstitution(institution: typeof institutions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(institutions).values(institution);
  return result;
}

export async function getInstitutionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(institutions).where(eq(institutions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllInstitutions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(institutions).orderBy(desc(institutions.createdAt));
}

// ============= CURRICULUM =============

export async function getSubjectsByCurriculum(curriculum: string, grade?: string) {
  const db = await getDb();
  if (!db) return [];
  if (grade) {
    return await db.select().from(subjects).where(and(eq(subjects.curriculum, curriculum), eq(subjects.grade, grade))).orderBy(asc(subjects.displayOrder));
  }
  return await db.select().from(subjects).where(eq(subjects.curriculum, curriculum)).orderBy(asc(subjects.displayOrder));
}

export async function getUnitsBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(units).where(eq(units.subjectId, subjectId)).orderBy(asc(units.displayOrder));
}

export async function getTopicsByUnit(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(topics).where(eq(topics.unitId, unitId)).orderBy(asc(topics.displayOrder));
}

export async function getTopicById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= CONTENT =============

export async function getContentByTopic(topicId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return await db.select().from(contentItems).where(and(eq(contentItems.topicId, topicId), eq(contentItems.status, status as any)));
  }
  return await db.select().from(contentItems).where(eq(contentItems.topicId, topicId));
}

export async function createContent(content: typeof contentItems.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(contentItems).values(content);
  return result;
}

// ============= QUESTIONS =============

export async function getQuestionsByTopic(topicId: number, difficulty?: string) {
  const db = await getDb();
  if (!db) return [];
  if (difficulty) {
    return await db.select().from(questions).where(and(eq(questions.topicId, topicId), eq(questions.difficulty, difficulty as any), eq(questions.status, "live")));
  }
  return await db.select().from(questions).where(and(eq(questions.topicId, topicId), eq(questions.status, "live")));
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuestion(question: typeof questions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(questions).values(question);
  return result;
}

// ============= STUDY PLANS =============

export async function getActiveStudyPlan(studentUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studyPlans).where(and(eq(studyPlans.studentUserId, studentUserId), eq(studyPlans.active, true))).orderBy(desc(studyPlans.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudyPlan(plan: typeof studyPlans.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(studyPlans).values(plan);
  return result;
}

export async function updateStudyPlan(id: number, updates: Partial<typeof studyPlans.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(studyPlans).set(updates).where(eq(studyPlans.id, id));
}

// ============= KNOWLEDGE PROFILES =============

export async function getKnowledgeProfile(studentUserId: number, topicId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(knowledgeProfiles).where(and(eq(knowledgeProfiles.studentUserId, studentUserId), eq(knowledgeProfiles.topicId, topicId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllKnowledgeProfiles(studentUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(knowledgeProfiles).where(eq(knowledgeProfiles.studentUserId, studentUserId));
}

export async function upsertKnowledgeProfile(profile: typeof knowledgeProfiles.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(knowledgeProfiles).values(profile).onDuplicateKeyUpdate({
    set: profile,
  });
}

// ============= TESTS =============

export async function getTestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTestsBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tests).where(and(eq(tests.subjectId, subjectId), eq(tests.status, "published"))).orderBy(desc(tests.createdAt));
}

export async function createTest(test: typeof tests.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(tests).values(test);
  return result;
}

export async function getTestQuestions(testId: number) {
  const db = await getDb();
  if (!db) return [];
  const tqs = await db.select().from(testQuestions).where(eq(testQuestions.testId, testId)).orderBy(asc(testQuestions.displayOrder));
  const questionIds = tqs.map(tq => tq.questionId);
  if (questionIds.length === 0) return [];
  const qs = await db.select().from(questions).where(inArray(questions.id, questionIds));
  return tqs.map(tq => ({
    ...tq,
    question: qs.find(q => q.id === tq.questionId),
  }));
}

export async function addQuestionToTest(testId: number, questionId: number, displayOrder: number, marks?: number, section?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(testQuestions).values({ testId, questionId, displayOrder, marks, section });
}

// ============= TEST ATTEMPTS =============

export async function createTestAttempt(attempt: typeof testAttempts.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(testAttempts).values(attempt);
  return result;
}

export async function getTestAttempt(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(testAttempts).where(eq(testAttempts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTestAttempt(id: number, updates: Partial<typeof testAttempts.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(testAttempts).set(updates).where(eq(testAttempts.id, id));
}

export async function getStudentTestAttempts(studentUserId: number, testId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (testId) {
    return await db.select().from(testAttempts).where(and(eq(testAttempts.studentUserId, studentUserId), eq(testAttempts.testId, testId))).orderBy(desc(testAttempts.createdAt));
  }
  return await db.select().from(testAttempts).where(eq(testAttempts.studentUserId, studentUserId)).orderBy(desc(testAttempts.createdAt));
}

// ============= TUTOR SESSIONS =============

export async function createTutorSession(session: typeof tutorSessions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(tutorSessions).values(session);
  return result;
}

export async function getTutorSession(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tutorSessions).where(eq(tutorSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveTutorSession(studentUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tutorSessions).where(and(eq(tutorSessions.studentUserId, studentUserId), eq(tutorSessions.active, true))).orderBy(desc(tutorSessions.startedAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTutorSession(id: number, updates: Partial<typeof tutorSessions.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tutorSessions).set(updates).where(eq(tutorSessions.id, id));
}

export async function addTutorMessage(message: typeof tutorMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(tutorMessages).values(message);
  
  // Update message count in session
  await db.update(tutorSessions).set({
    messageCount: sql`${tutorSessions.messageCount} + 1`,
  }).where(eq(tutorSessions.id, message.sessionId));
  
  return result;
}

export async function getTutorMessages(sessionId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  if (limit) {
    return await db.select().from(tutorMessages).where(eq(tutorMessages.sessionId, sessionId)).orderBy(desc(tutorMessages.createdAt)).limit(limit);
  }
  return await db.select().from(tutorMessages).where(eq(tutorMessages.sessionId, sessionId)).orderBy(asc(tutorMessages.createdAt));
}

// ============= DOUBTS =============

export async function createDoubt(doubt: typeof doubts.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(doubts).values(doubt);
  return result;
}

export async function getDoubtById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doubts).where(eq(doubts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentDoubts(studentUserId: number, resolved?: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (resolved !== undefined) {
    return await db.select().from(doubts).where(and(eq(doubts.studentUserId, studentUserId), eq(doubts.resolved, resolved))).orderBy(desc(doubts.createdAt));
  }
  return await db.select().from(doubts).where(eq(doubts.studentUserId, studentUserId)).orderBy(desc(doubts.createdAt));
}

export async function updateDoubt(id: number, updates: Partial<typeof doubts.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(doubts).set(updates).where(eq(doubts.id, id));
}

// ============= GAMIFICATION =============

export async function getStudentGameStats(studentUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentGameStats).where(eq(studentGameStats.studentUserId, studentUserId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStudentGameStats(stats: typeof studentGameStats.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(studentGameStats).values(stats).onDuplicateKeyUpdate({
    set: stats,
  });
}

export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(achievements);
}

export async function getStudentAchievements(studentUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const sa = await db.select().from(studentAchievements).where(eq(studentAchievements.studentUserId, studentUserId));
  const achievementIds = sa.map(a => a.achievementId);
  if (achievementIds.length === 0) return [];
  const achs = await db.select().from(achievements).where(inArray(achievements.id, achievementIds));
  return sa.map(s => ({
    ...s,
    achievement: achs.find(a => a.id === s.achievementId),
  }));
}

export async function awardAchievement(studentUserId: number, achievementId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(studentAchievements).values({ studentUserId, achievementId });
}

// ============= ACTIVITY LOGS =============

export async function logActivity(log: typeof activityLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(log);
}

export async function getActivityLogs(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [eq(activityLogs.userId, userId)];
  if (startDate) conditions.push(gte(activityLogs.createdAt, startDate));
  if (endDate) conditions.push(lte(activityLogs.createdAt, endDate));
  return await db.select().from(activityLogs).where(and(...conditions)).orderBy(desc(activityLogs.createdAt));
}

// ============= SUBSCRIPTIONS =============

export async function getAllSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true));
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).orderBy(desc(subscriptions.startDate)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(subscription: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(subscriptions).values(subscription);
  return result;
}

// ============= PAYMENTS =============

export async function createPayment(payment: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
}

// ============= NOTIFICATIONS =============

export async function createNotification(notification: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getUserNotifications(userId: number, unreadOnly?: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (unreadOnly) {
    return await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false))).orderBy(desc(notifications.createdAt));
  }
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}


// ============= TEACHER FUNCTIONS =============

export async function getTeacherClasses(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data for now - will be replaced with actual database query when classes table is ready
  return [
    { id: 1, name: "Class 10-A", section: "Mathematics", subject: "Mathematics", studentCount: 42, schedule: "Mon, Wed, Fri - 10:00 AM" },
    { id: 2, name: "Class 10-B", section: "Mathematics", subject: "Mathematics", studentCount: 38, schedule: "Tue, Thu - 11:00 AM" },
    { id: 3, name: "Class 9-A", section: "Mathematics", subject: "Mathematics", studentCount: 45, schedule: "Mon, Wed, Fri - 2:00 PM" },
    { id: 4, name: "Class 9-B", section: "Mathematics", subject: "Mathematics", studentCount: 31, schedule: "Tue, Thu - 3:00 PM" },
  ];
}

export async function getTeacherStudents(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data - will be replaced with actual query
  return await db.select().from(users).where(eq(users.role, 'student')).limit(50);
}

export async function markAttendance(data: { classId: number; studentId: number; date: string; status: string }) {
  const db = await getDb();
  if (!db) return;
  // Will implement when attendance table is added to schema
  return { success: true, ...data };
}

export async function getAttendanceRecords(params: { classId: number; startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return [];
  // Mock data - will be replaced
  return [];
}

export async function createLessonPlan(data: any) {
  const db = await getDb();
  if (!db) return;
  // Will implement when lesson_plans table is added
  return { id: Date.now(), ...data };
}

export async function getTeacherLessonPlans(teacherId: number, classId?: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data
  return [];
}

export async function createAssignment(data: any) {
  const db = await getDb();
  if (!db) return;
  // Will implement when assignments table is added
  return { id: Date.now(), ...data };
}

export async function getTeacherAssignments(teacherId: number, classId?: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data
  return [];
}

export async function gradeAssignmentSubmission(data: { submissionId: number; marks: number; feedback?: string }) {
  const db = await getDb();
  if (!db) return;
  // Will implement when assignment_submissions table is added
  return { success: true, ...data };
}

export async function getAssignmentSubmissions(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data
  return [];
}

export async function createAssessment(data: any) {
  const db = await getDb();
  if (!db) return;
  // Will implement when assessments table is added to schema
  return { id: Date.now(), ...data };
}

export async function getTeacherAssessments(teacherId: number, classId?: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data
  return [];
}

export async function getClassAnalytics(classId: number) {
  const db = await getDb();
  if (!db) return {};
  // Mock analytics data
  return {
    averageScore: 75,
    attendanceRate: 92,
    assignmentCompletionRate: 85,
    topPerformers: [],
    strugglingStudents: [],
  };
}

export async function scheduleParentMeeting(data: any) {
  const db = await getDb();
  if (!db) return;
  // Will implement when meetings table is added
  return { id: Date.now(), ...data };
}

export async function getTeacherMeetings(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock data
  return [];
}

// ============= PARENT FUNCTIONS =============

export async function getParentChildren(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await getStudentsByParent(parentId);
}

export async function getChildProgress(studentId: number) {
  const db = await getDb();
  if (!db) return {};
  // Mock progress data
  return {
    overallScore: 85,
    attendanceRate: 96,
    recentAssessments: [],
    upcomingTests: [],
  };
}

export async function getChildAttendance(studentId: number, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  // Mock attendance data
  return [];
}

export async function getChildAssessments(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock assessment data
  return [];
}

export async function getParentMeetings(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock meetings data
  return [];
}

// ============= ADMIN FUNCTIONS =============

export async function getInstitutionStudents(institutionId?: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.role, 'student')).limit(100);
}

export async function getInstitutionTeachers(institutionId?: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.role, 'teacher')).limit(100);
}

export async function getInstitutionParents(institutionId?: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.role, 'parent')).limit(100);
}

export async function getInstitutionClasses(institutionId?: number) {
  const db = await getDb();
  if (!db) return [];
  // Mock classes data
  return [];
}

export async function getInstitutionReports(institutionId: number) {
  const db = await getDb();
  if (!db) return {};
  // Mock reports data
  return {
    totalStudents: 1245,
    totalTeachers: 87,
    totalParents: 890,
    averageAttendance: 94,
    averagePerformance: 78,
  };
}

export async function getInstitutionAnalytics(institutionId: number) {
  const db = await getDb();
  if (!db) return {};
  // Mock analytics data
  return {
    enrollmentTrend: [],
    performanceTrend: [],
    attendanceTrend: [],
  };
}

// ============= SUPER ADMIN FUNCTIONS =============

export async function getAllOrganizations() {
  const db = await getDb();
  if (!db) return [];
  return await getAllInstitutions();
}

export async function getPlatformUsers() {
  const db = await getDb();
  if (!db) return [];
  return await getAllUsers();
}

export async function getPlatformSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

export async function getPlatformAnalytics() {
  const db = await getDb();
  if (!db) return {};
  // Mock platform-wide analytics
  return {
    totalOrganizations: 24,
    totalUsers: 12458,
    monthlyRevenue: 45230,
    activeSubscriptions: 18,
  };
}

export async function getRevenueReports(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  // Mock revenue data
  return [];
}
