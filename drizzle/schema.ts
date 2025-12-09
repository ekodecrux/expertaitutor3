import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table with multi-role support
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["student", "parent", "teacher", "admin", "institution_admin", "branch_admin", "super_admin"]).default("student").notNull(),
  institutionId: int("institutionId"),
  organizationId: int("organizationId"),
  branchId: int("branchId"),
  // Authentication fields
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false),
  otpCode: varchar("otpCode", { length: 6 }),
  otpExpiry: timestamp("otpExpiry"),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  failedLoginAttempts: int("failedLoginAttempts").default(0),
  lockedUntil: timestamp("lockedUntil"),
  googleId: varchar("googleId", { length: 255 }),
  facebookId: varchar("facebookId", { length: 255 }),
  gdprConsent: boolean("gdprConsent").default(false),
  gdprConsentDate: timestamp("gdprConsentDate"),
  dataResidency: varchar("dataResidency", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index("institution_idx").on(table.institutionId),
  organizationIdx: index("organization_idx").on(table.organizationId),
  branchIdx: index("branch_idx").on(table.branchId),
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Student profiles with learning goals and preferences
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  country: varchar("country", { length: 100 }),
  curriculum: varchar("curriculum", { length: 100 }), // CBSE, ICSE, IB, A-Levels, AP, etc.
  grade: varchar("grade", { length: 50 }),
  targetExams: json("targetExams").$type<string[]>(), // Array of exam names
  targetYear: int("targetYear"),
  targetMonth: int("targetMonth"),
  preferredLanguages: json("preferredLanguages").$type<string[]>(),
  preferredSubjects: json("preferredSubjects").$type<string[]>(),
  diagnosticCompleted: boolean("diagnosticCompleted").default(false),
  currentLevel: varchar("currentLevel", { length: 50 }),
  studyHoursPerDay: int("studyHoursPerDay"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type StudentProfile = typeof studentProfiles.$inferSelect;

/**
 * Parent-student relationships
 */
export const parentStudentLinks = mysqlTable("parent_student_links", {
  id: int("id").autoincrement().primaryKey(),
  parentUserId: int("parentUserId").notNull(),
  studentUserId: int("studentUserId").notNull(),
  relationship: varchar("relationship", { length: 50 }), // mother, father, guardian
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  parentIdx: index("parent_idx").on(table.parentUserId),
  studentIdx: index("student_idx").on(table.studentUserId),
}));

/**
 * Institutions (schools, coaching centers)
 */
export const institutions = mysqlTable("institutions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["school", "coaching_center", "university", "other"]),
  country: varchar("country", { length: 100 }),
  address: text("address"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  logoUrl: text("logoUrl"),
  brandColor: varchar("brandColor", { length: 20 }),
  ssoEnabled: boolean("ssoEnabled").default(false),
  ssoProvider: varchar("ssoProvider", { length: 50 }),
  ssoConfig: json("ssoConfig"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Institution = typeof institutions.$inferSelect;

/**
 * Curriculum structure: subjects
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  curriculum: varchar("curriculum", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 50 }),
  description: text("description"),
  iconUrl: text("iconUrl"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  curriculumIdx: index("curriculum_idx").on(table.curriculum, table.grade),
}));

export type Subject = typeof subjects.$inferSelect;

/**
 * Curriculum structure: units within subjects
 */
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  subjectIdx: index("subject_idx").on(table.subjectId),
}));

export type Unit = typeof units.$inferSelect;

/**
 * Curriculum structure: topics within units
 */
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  prerequisites: json("prerequisites").$type<number[]>(), // Array of topic IDs
  learningOutcomes: json("learningOutcomes").$type<string[]>(),
  estimatedMinutes: int("estimatedMinutes"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  unitIdx: index("unit_idx").on(table.unitId),
}));

export type Topic = typeof topics.$inferSelect;

/**
 * Learning content items
 */
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  type: mysqlEnum("type", ["note", "video", "slide", "simulation", "question", "past_paper"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // For notes, HTML content
  url: text("url"), // For videos, slides, external resources
  fileKey: text("fileKey"), // S3 file key
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "expert"]),
  examTags: json("examTags").$type<string[]>(),
  bloomLevel: varchar("bloomLevel", { length: 50 }), // remember, understand, apply, analyze, evaluate, create
  languages: json("languages").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "review", "approved", "live"]).default("draft"),
  authorId: int("authorId"),
  reviewerId: int("reviewerId"),
  version: int("version").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  topicIdx: index("topic_idx").on(table.topicId),
  statusIdx: index("status_idx").on(table.status),
}));

export type ContentItem = typeof contentItems.$inferSelect;

/**
 * Questions for assessments
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  type: mysqlEnum("type", ["mcq", "msq", "numeric", "short_answer", "long_answer", "essay", "drag_drop", "match_pairs", "fill_blank"]).notNull(),
  questionText: text("questionText").notNull(),
  questionImageUrl: text("questionImageUrl"),
  options: json("options").$type<{text: string, imageUrl?: string, isCorrect?: boolean}[]>(),
  correctAnswer: text("correctAnswer"),
  solution: text("solution"),
  hints: json("hints").$type<string[]>(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "expert"]).notNull(),
  examTags: json("examTags").$type<string[]>(),
  bloomLevel: varchar("bloomLevel", { length: 50 }),
  marks: int("marks").default(1),
  negativeMarks: int("negativeMarks").default(0),
  timeEstimateSeconds: int("timeEstimateSeconds"),
  aiGenerated: boolean("aiGenerated").default(false),
  status: mysqlEnum("status", ["draft", "review", "approved", "live"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  topicIdx: index("topic_idx").on(table.topicId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Question = typeof questions.$inferSelect;

/**
 * Study plans for students
 */
export const studyPlans = mysqlTable("study_plans", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  targetExam: varchar("targetExam", { length: 100 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  dailyTargetMinutes: int("dailyTargetMinutes"),
  weeklyTargetMinutes: int("weeklyTargetMinutes"),
  topics: json("topics").$type<{topicId: number, scheduledDate: string, completed: boolean}[]>(),
  aiGenerated: boolean("aiGenerated").default(true),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdx: index("student_idx").on(table.studentUserId),
}));

export type StudyPlan = typeof studyPlans.$inferSelect;

/**
 * Knowledge profile: tracks student mastery per topic
 */
export const knowledgeProfiles = mysqlTable("knowledge_profiles", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  topicId: int("topicId").notNull(),
  masteryScore: int("masteryScore").default(0), // 0-100
  confidenceScore: int("confidenceScore").default(0), // 0-100
  attemptsCount: int("attemptsCount").default(0),
  correctCount: int("correctCount").default(0),
  averageTimeSeconds: int("averageTimeSeconds"),
  lastPracticedAt: timestamp("lastPracticedAt"),
  nextRevisionAt: timestamp("nextRevisionAt"),
  misconceptions: json("misconceptions").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentTopicIdx: index("student_topic_idx").on(table.studentUserId, table.topicId),
}));

export type KnowledgeProfile = typeof knowledgeProfiles.$inferSelect;

/**
 * Tests and assessments
 */
export const tests = mysqlTable("tests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["chapter", "unit", "mock_exam", "custom", "diagnostic", "placement"]).notNull(),
  subjectId: int("subjectId"),
  curriculum: varchar("curriculum", { length: 100 }),
  grade: varchar("grade", { length: 50 }),
  durationMinutes: int("durationMinutes"),
  totalMarks: int("totalMarks"),
  passingMarks: int("passingMarks"),
  negativeMarkingEnabled: boolean("negativeMarkingEnabled").default(false),
  randomizeQuestions: boolean("randomizeQuestions").default(false),
  randomizeOptions: boolean("randomizeOptions").default(false),
  showSolutionsAfter: boolean("showSolutionsAfter").default(true),
  proctoringEnabled: boolean("proctoringEnabled").default(false),
  createdBy: int("createdBy").notNull(),
  institutionId: int("institutionId"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  subjectIdx: index("subject_idx").on(table.subjectId),
  institutionIdx: index("institution_idx").on(table.institutionId),
}));

export type Test = typeof tests.$inferSelect;

/**
 * Test-question relationships
 */
export const testQuestions = mysqlTable("test_questions", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  questionId: int("questionId").notNull(),
  displayOrder: int("displayOrder").default(0),
  marks: int("marks"),
  section: varchar("section", { length: 100 }),
}, (table) => ({
  testIdx: index("test_idx").on(table.testId),
}));

/**
 * Test attempts by students
 */
export const testAttempts = mysqlTable("test_attempts", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  studentUserId: int("studentUserId").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  submittedAt: timestamp("submittedAt"),
  timeSpentSeconds: int("timeSpentSeconds"),
  score: int("score"),
  maxScore: int("maxScore"),
  percentile: int("percentile"),
  accuracy: int("accuracy"), // percentage
  status: mysqlEnum("status", ["in_progress", "submitted", "evaluated", "abandoned"]).default("in_progress"),
  answers: json("answers").$type<{questionId: number, answer: string, timeSpent: number, isCorrect?: boolean}[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  testStudentIdx: index("test_student_idx").on(table.testId, table.studentUserId),
}));

export type TestAttempt = typeof testAttempts.$inferSelect;

/**
 * AI tutor conversation sessions
 */
export const tutorSessions = mysqlTable("tutor_sessions", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  mode: mysqlEnum("mode", ["teaching", "practice", "exam", "revision"]).default("teaching"),
  topicId: int("topicId"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  messageCount: int("messageCount").default(0),
  active: boolean("active").default(true),
}, (table) => ({
  studentIdx: index("student_idx").on(table.studentUserId),
}));

export type TutorSession = typeof tutorSessions.$inferSelect;

/**
 * Messages within tutor sessions
 */
export const tutorMessages = mysqlTable("tutor_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  audioUrl: text("audioUrl"),
  metadata: json("metadata").$type<{hints?: string[], misconceptions?: string[], relatedTopics?: number[]}>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("session_idx").on(table.sessionId),
}));

export type TutorMessage = typeof tutorMessages.$inferSelect;

/**
 * Doubts posted by students
 */
export const doubts = mysqlTable("doubts", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  topicId: int("topicId"),
  subjectId: int("subjectId"),
  questionText: text("questionText").notNull(),
  questionImageUrl: text("questionImageUrl"),
  questionAudioUrl: text("questionAudioUrl"),
  aiSolution: text("aiSolution"),
  alternativeMethods: json("alternativeMethods").$type<string[]>(),
  commonMistakes: json("commonMistakes").$type<string[]>(),
  resolved: boolean("resolved").default(false),
  escalatedToHuman: boolean("escalatedToHuman").default(false),
  assignedTeacherId: int("assignedTeacherId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
}, (table) => ({
  studentIdx: index("student_idx").on(table.studentUserId),
  topicIdx: index("topic_idx").on(table.topicId),
}));

export type Doubt = typeof doubts.$inferSelect;

/**
 * Gamification: achievements and badges
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  category: varchar("category", { length: 100 }), // streak, mastery, practice, test
  criteria: json("criteria").$type<{type: string, threshold: number}>(),
  points: int("points").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;

/**
 * Student achievements
 */
export const studentAchievements = mysqlTable("student_achievements", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  achievementId: int("achievementId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => ({
  studentIdx: index("student_idx").on(table.studentUserId),
}));

/**
 * Gamification: student points and levels
 */
export const studentGameStats = mysqlTable("student_game_stats", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull().unique(),
  totalPoints: int("totalPoints").default(0),
  level: int("level").default(1),
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentGameStats = typeof studentGameStats.$inferSelect;

/**
 * Learning activity logs
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(), // study, practice, test, tutor_chat
  topicId: int("topicId"),
  subjectId: int("subjectId"),
  durationSeconds: int("durationSeconds"),
  pointsEarned: int("pointsEarned").default(0),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type ActivityLog = typeof activityLogs.$inferSelect;

/**
 * Subscription plans
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["freemium", "monthly", "annual", "exam_pack", "institutional"]).notNull(),
  priceAmount: int("priceAmount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("USD"),
  features: json("features").$type<string[]>(),
  maxStudents: int("maxStudents"),
  examAccess: json("examAccess").$type<string[]>(),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

/**
 * User subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trial"]).default("active"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  autoRenew: boolean("autoRenew").default(true),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Subscription = typeof subscriptions.$inferSelect;

/**
 * Payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  transactionId: varchar("transactionId", { length: 255 }),
  invoiceUrl: text("invoiceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Payment = typeof payments.$inferSelect;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "alert"]).default("info"),
  read: boolean("read").default(false),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Notification = typeof notifications.$inferSelect;


/**
 * Classes for organizing students by grade/curriculum
 */
export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  branchId: int("branchId"),
  name: varchar("name", { length: 100 }).notNull(),
  curriculum: varchar("curriculum", { length: 100 }),
  board: varchar("board", { length: 100 }),
  academicYear: varchar("academicYear", { length: 20 }),
  maxStudents: int("maxStudents").default(40),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("org_class_idx").on(table.organizationId),
  branchIdx: index("branch_class_idx").on(table.branchId),
}));

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

/**
 * Sections within classes
 */
export const sections = mysqlTable("sections", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  name: varchar("name", { length: 10 }).notNull(),
  maxStudents: int("maxStudents").default(40),
  currentStudents: int("currentStudents").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("section_class_idx").on(table.classId),
}));

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

/**
 * Subject-teacher assignments
 */
export const classSubjects = mysqlTable("class_subjects", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  subjectId: int("subjectId").notNull(),
  teacherUserId: int("teacherUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("cs_class_idx").on(table.classId),
  teacherIdx: index("cs_teacher_idx").on(table.teacherUserId),
}));

export type ClassSubject = typeof classSubjects.$inferSelect;
export type InsertClassSubject = typeof classSubjects.$inferInsert;

/**
 * Student enrollments
 */
export const studentEnrollments = mysqlTable("student_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentUserId: int("studentUserId").notNull(),
  classId: int("classId").notNull(),
  sectionId: int("sectionId"),
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "inactive", "graduated", "transferred"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  studentIdx: index("enroll_student_idx").on(table.studentUserId),
  classIdx: index("enroll_class_idx").on(table.classId),
  sectionIdx: index("enroll_section_idx").on(table.sectionId),
}));

export type StudentEnrollment = typeof studentEnrollments.$inferSelect;
export type InsertStudentEnrollment = typeof studentEnrollments.$inferInsert;

/**
 * Organization subscriptions (enhanced)
 */
export const organizationSubscriptions = mysqlTable("organization_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled", "expired"]).default("trial").notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("org_sub_idx").on(table.organizationId),
  planIdx: index("plan_sub_idx").on(table.planId),
}));

export type OrganizationSubscription = typeof organizationSubscriptions.$inferSelect;
export type InsertOrganizationSubscription = typeof organizationSubscriptions.$inferInsert;

/**
 * Subscription usage tracking
 */
export const subscriptionUsage = mysqlTable("subscription_usage", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  metricName: varchar("metricName", { length: 50 }).notNull(),
  currentValue: int("currentValue").default(0),
  limitValue: int("limitValue").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("usage_org_idx").on(table.organizationId),
  metricIdx: index("usage_metric_idx").on(table.metricName),
}));

export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect;
export type InsertSubscriptionUsage = typeof subscriptionUsage.$inferInsert;
