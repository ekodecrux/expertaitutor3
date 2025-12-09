import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Starting database seeding...");

// ============= SEED USERS =============

console.log("📝 Creating demo users...");

const hashedPassword = await bcrypt.hash("demo123", 10);

// Create demo students
const studentEmails = [
  "student1@example.com",
  "student2@example.com",
  "student3@example.com",
  "student4@example.com",
  "student5@example.com",
];

for (const email of studentEmails) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'student', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`student-${email}`, `Student ${email.split('@')[0]}`, email, hashedPassword]
  );
}

// Create demo teachers
const teacherEmails = [
  "teacher1@example.com",
  "teacher2@example.com",
  "teacher3@example.com",
];

for (const email of teacherEmails) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'teacher', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`teacher-${email}`, `Teacher ${email.split('@')[0]}`, email, hashedPassword]
  );
}

// Create demo parents
const parentEmails = [
  "parent1@example.com",
  "parent2@example.com",
];

for (const email of parentEmails) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'parent', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`parent-${email}`, `Parent ${email.split('@')[0]}`, email, hashedPassword]
  );
}

// Create demo admin
await connection.execute(
  `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
   VALUES (?, ?, ?, 'admin', ?, NOW(), NOW(), NOW())
   ON DUPLICATE KEY UPDATE email = email`,
  ["admin-demo", "Demo Admin", "admin@example.com", hashedPassword]
);

console.log("✅ Users created");

// ============= SEED CURRICULA =============

console.log("📚 Creating curricula...");

const curricula = [
  { code: "CBSE", name: "Central Board of Secondary Education", country: "India" },
  { code: "ICSE", name: "Indian Certificate of Secondary Education", country: "India" },
  { code: "IB", name: "International Baccalaureate", country: "International" },
  { code: "JEE", name: "Joint Entrance Examination", country: "India" },
  { code: "NEET", name: "National Eligibility cum Entrance Test", country: "India" },
  { code: "SAT", name: "Scholastic Assessment Test", country: "USA" },
];

for (const curr of curricula) {
  await connection.execute(
    `INSERT INTO curricula (code, name, country, createdAt, updatedAt) 
     VALUES (?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [curr.code, curr.name, curr.country]
  );
}

console.log("✅ Curricula created");

// ============= SEED SUBJECTS =============

console.log("📖 Creating subjects...");

const subjects = [
  { name: "Mathematics", code: "MATH", category: "Science" },
  { name: "Physics", code: "PHY", category: "Science" },
  { name: "Chemistry", code: "CHEM", category: "Science" },
  { name: "Biology", code: "BIO", category: "Science" },
  { name: "English", code: "ENG", category: "Language" },
  { name: "Hindi", code: "HIN", category: "Language" },
  { name: "Computer Science", code: "CS", category: "Science" },
  { name: "History", code: "HIST", category: "Social Science" },
  { name: "Geography", code: "GEO", category: "Social Science" },
];

for (const subject of subjects) {
  await connection.execute(
    `INSERT INTO subjects (name, code, category, createdAt, updatedAt) 
     VALUES (?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [subject.name, subject.code, subject.category]
  );
}

console.log("✅ Subjects created");

// ============= SEED COURSES =============

console.log("🎓 Creating courses...");

const courses = [
  {
    title: "CBSE Class 10 Mathematics",
    description: "Complete Mathematics course for CBSE Class 10 students covering all chapters",
    curriculum: "CBSE",
    subject: "Mathematics",
    level: "Class 10",
  },
  {
    title: "CBSE Class 10 Science",
    description: "Comprehensive Science course covering Physics, Chemistry, and Biology",
    curriculum: "CBSE",
    subject: "Science",
    level: "Class 10",
  },
  {
    title: "JEE Main Physics",
    description: "Complete Physics preparation for JEE Main examination",
    curriculum: "JEE",
    subject: "Physics",
    level: "Advanced",
  },
  {
    title: "JEE Main Mathematics",
    description: "Comprehensive Mathematics course for JEE Main preparation",
    curriculum: "JEE",
    subject: "Mathematics",
    level: "Advanced",
  },
  {
    title: "NEET Biology",
    description: "Complete Biology course for NEET examination preparation",
    curriculum: "NEET",
    subject: "Biology",
    level: "Advanced",
  },
  {
    title: "ICSE Class 12 Chemistry",
    description: "Advanced Chemistry course for ICSE Class 12 students",
    curriculum: "ICSE",
    subject: "Chemistry",
    level: "Class 12",
  },
];

for (const course of courses) {
  await connection.execute(
    `INSERT INTO courses (title, description, curriculum, subject, level, status, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
    [course.title, course.description, course.curriculum, course.subject, course.level]
  );
}

console.log("✅ Courses created");

// ============= SEED TOPICS =============

console.log("📝 Creating topics...");

const topics = [
  // Mathematics topics
  { subjectCode: "MATH", name: "Algebra", description: "Algebraic expressions and equations" },
  { subjectCode: "MATH", name: "Geometry", description: "Shapes, angles, and spatial reasoning" },
  { subjectCode: "MATH", name: "Trigonometry", description: "Trigonometric ratios and identities" },
  { subjectCode: "MATH", name: "Calculus", description: "Differentiation and integration" },
  
  // Physics topics
  { subjectCode: "PHY", name: "Mechanics", description: "Motion, force, and energy" },
  { subjectCode: "PHY", name: "Electromagnetism", description: "Electric and magnetic phenomena" },
  { subjectCode: "PHY", name: "Optics", description: "Light and optical instruments" },
  { subjectCode: "PHY", name: "Thermodynamics", description: "Heat and temperature" },
  
  // Chemistry topics
  { subjectCode: "CHEM", name: "Organic Chemistry", description: "Carbon compounds and reactions" },
  { subjectCode: "CHEM", name: "Inorganic Chemistry", description: "Elements and compounds" },
  { subjectCode: "CHEM", name: "Physical Chemistry", description: "Chemical kinetics and equilibrium" },
  
  // Biology topics
  { subjectCode: "BIO", name: "Cell Biology", description: "Structure and function of cells" },
  { subjectCode: "BIO", name: "Genetics", description: "Heredity and variation" },
  { subjectCode: "BIO", name: "Ecology", description: "Organisms and their environment" },
  { subjectCode: "BIO", name: "Human Physiology", description: "Human body systems" },
];

for (const topic of topics) {
  await connection.execute(
    `INSERT INTO topics (subjectCode, name, description, createdAt, updatedAt) 
     VALUES (?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [topic.subjectCode, topic.name, topic.description]
  );
}

console.log("✅ Topics created");

// ============= SEED STUDENT PROFILES =============

console.log("👤 Creating student profiles...");

const [students] = await connection.execute(
  `SELECT id FROM users WHERE role = 'student' LIMIT 5`
);

const profileData = [
  { curriculum: "CBSE", grade: "Class 10", targetExams: JSON.stringify(["CBSE Board"]), country: "India" },
  { curriculum: "CBSE", grade: "Class 12", targetExams: JSON.stringify(["JEE Main", "JEE Advanced"]), country: "India" },
  { curriculum: "CBSE", grade: "Class 12", targetExams: JSON.stringify(["NEET"]), country: "India" },
  { curriculum: "ICSE", grade: "Class 10", targetExams: JSON.stringify(["ICSE Board"]), country: "India" },
  { curriculum: "IB", grade: "Grade 11", targetExams: JSON.stringify(["SAT", "IB Diploma"]), country: "India" },
];

for (let i = 0; i < Math.min(students.length, profileData.length); i++) {
  const student = students[i];
  const profile = profileData[i];
  
  await connection.execute(
    `INSERT INTO student_profiles (userId, country, curriculum, grade, targetExams, targetYear, targetMonth, studyHoursPerDay, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, 2025, 5, 4, NOW(), NOW())
     ON DUPLICATE KEY UPDATE curriculum = VALUES(curriculum)`,
    [student.id, profile.country, profile.curriculum, profile.grade, profile.targetExams]
  );
}

console.log("✅ Student profiles created");

// ============= SEED GAME STATS =============

console.log("🎮 Creating game stats...");

for (const student of students) {
  await connection.execute(
    `INSERT INTO game_stats (userId, points, level, streak, badges, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE points = VALUES(points)`,
    [student.id, Math.floor(Math.random() * 1000), Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 30), JSON.stringify(["first_lesson", "quiz_master"])]
  );
}

console.log("✅ Game stats created");

console.log("🎉 Database seeding completed successfully!");

await connection.end();
