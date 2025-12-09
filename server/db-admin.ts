// Admin-specific database operations
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  classes,
  sections,
  studentEnrollments,
  users,
  InsertClass,
  InsertSection,
  InsertStudentEnrollment,
} from "../drizzle/schema";

// ============= CLASS MANAGEMENT =============

export async function getAllClasses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(classes);
}

export async function createClass(data: Omit<InsertClass, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(classes).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function updateClass(id: number, data: Partial<Omit<InsertClass, "id">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(classes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classes.id, id));
}

export async function deleteClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(classes).where(eq(classes.id, id));
}

// ============= SECTION MANAGEMENT =============

export async function getSectionsByClass(classId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (classId) {
    return await db.select().from(sections).where(eq(sections.classId, classId));
  }
  return await db.select().from(sections);
}

export async function createSection(data: Omit<InsertSection, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sections).values({
    ...data,
    createdAt: new Date(),
  });
  return result;
}

export async function updateSection(id: number, data: Partial<Omit<InsertSection, "id">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sections)
    .set(data)
    .where(eq(sections.id, id));
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sections).where(eq(sections.id, id));
}

// ============= STUDENT MANAGEMENT =============

export async function getStudentsByFilter(filters: { classId?: number; sectionId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const students = await db.select()
    .from(users)
    .where(eq(users.role, "student"));
  
  if (!filters.classId && !filters.sectionId) {
    return students;
  }
  
  // Get enrollments matching filters
  let enrollmentsQuery = db.select().from(studentEnrollments);
  
  if (filters.classId) {
    enrollmentsQuery = enrollmentsQuery.where(eq(studentEnrollments.classId, filters.classId)) as any;
  }
  if (filters.sectionId) {
    enrollmentsQuery = enrollmentsQuery.where(eq(studentEnrollments.sectionId, filters.sectionId)) as any;
  }
  
  const enrollments = await enrollmentsQuery;
  const enrolledStudentIds = enrollments.map((e: any) => e.studentUserId);
  
  return students.filter(s => enrolledStudentIds.includes(s.id));
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "teacher" | "parent";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    openId: `${data.role}-${data.email}`,
    name: data.name,
    email: data.email,
    role: data.role,
    passwordHash: data.passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });
  
  return result;
}

export async function updateUser(id: number, data: { name?: string; email?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}

export async function getTeachers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.role, "teacher"));
}

// ============= ENROLLMENT MANAGEMENT =============

export async function enrollStudent(data: Omit<InsertStudentEnrollment, "id" | "enrollmentDate" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(studentEnrollments).values({
    ...data,
    enrollmentDate: new Date(),
    createdAt: new Date(),
  });
  
  return result;
}

// ============= BULK IMPORT =============

export async function bulkCreateUsers(
  usersData: Array<{
    name: string;
    email: string;
    passwordHash: string;
    role: "student" | "teacher";
    classId?: number;
    sectionId?: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  for (const userData of usersData) {
    try {
      const [newUser] = await db.insert(users).values({
        openId: `${userData.role}-${userData.email}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        passwordHash: userData.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });
      
      // If student with class/section, enroll them
      if (userData.role === "student" && userData.classId && userData.sectionId) {
        await db.insert(studentEnrollments).values({
          studentUserId: newUser.insertId,
          classId: userData.classId,
          sectionId: userData.sectionId,
          enrollmentDate: new Date(),
          status: "active",
          createdAt: new Date(),
        });
      }
      
      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${userData.email}: ${error.message}`);
    }
  }
  
  return results;
}
