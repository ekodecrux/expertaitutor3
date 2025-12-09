import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log("🌱 Starting database seeding...");

// ============= SEED USERS =============

console.log("📝 Creating demo users...");

const hashedPassword = await bcrypt.hash("demo123", 10);

// Create demo students
const students = [
  { email: "student1@acesaiprofessor.com", name: "Rahul Sharma" },
  { email: "student2@acesaiprofessor.com", name: "Priya Patel" },
  { email: "student3@acesaiprofessor.com", name: "Amit Kumar" },
  { email: "student4@acesaiprofessor.com", name: "Sneha Reddy" },
  { email: "student5@acesaiprofessor.com", name: "Arjun Singh" },
];

for (const student of students) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'student', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`student-${student.email}`, student.name, student.email, hashedPassword]
  );
}

// Create demo teachers
const teachers = [
  { email: "teacher1@acesaiprofessor.com", name: "Dr. Rajesh Verma" },
  { email: "teacher2@acesaiprofessor.com", name: "Prof. Meena Iyer" },
  { email: "teacher3@acesaiprofessor.com", name: "Mr. Suresh Nair" },
];

for (const teacher of teachers) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'teacher', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`teacher-${teacher.email}`, teacher.name, teacher.email, hashedPassword]
  );
}

// Create demo parents
const parents = [
  { email: "parent1@acesaiprofessor.com", name: "Mr. Ramesh Gupta" },
  { email: "parent2@acesaiprofessor.com", name: "Mrs. Lakshmi Menon" },
];

for (const parent of parents) {
  await connection.execute(
    `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'parent', ?, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = email`,
    [`parent-${parent.email}`, parent.name, parent.email, hashedPassword]
  );
}

// Create demo admin
await connection.execute(
  `INSERT INTO users (openId, name, email, role, passwordHash, createdAt, updatedAt, lastSignedIn) 
   VALUES (?, ?, ?, 'admin', ?, NOW(), NOW(), NOW())
   ON DUPLICATE KEY UPDATE email = email`,
  ["admin-demo", "Demo Admin", "admin@acesaiprofessor.com", hashedPassword]
);

console.log("✅ Users created (Login: student1@acesaiprofessor.com / Password: demo123)");

// ============= SEED STUDENT PROFILES =============

console.log("👤 Creating student profiles...");

const [studentUsers] = await connection.execute(
  `SELECT id FROM users WHERE role = 'student' LIMIT 5`
);

const profileData = [
  { curriculum: "CBSE", grade: "Class 10", targetExams: JSON.stringify(["CBSE Board Exam 2025"]), country: "India" },
  { curriculum: "CBSE", grade: "Class 12", targetExams: JSON.stringify(["JEE Main 2025", "JEE Advanced 2025"]), country: "India" },
  { curriculum: "CBSE", grade: "Class 12", targetExams: JSON.stringify(["NEET 2025"]), country: "India" },
  { curriculum: "ICSE", grade: "Class 10", targetExams: JSON.stringify(["ICSE Board Exam 2025"]), country: "India" },
  { curriculum: "IB", grade: "Grade 11", targetExams: JSON.stringify(["SAT 2025", "IB Diploma"]), country: "India" },
];

for (let i = 0; i < Math.min(studentUsers.length, profileData.length); i++) {
  const student = studentUsers[i];
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

for (const student of studentUsers) {
  const points = Math.floor(Math.random() * 1000) + 500;
  const level = Math.floor(Math.random() * 10) + 1;
  const streak = Math.floor(Math.random() * 30) + 1;
  const badges = JSON.stringify(["first_lesson", "quiz_master", "week_warrior"]);
  
  await connection.execute(
    `INSERT INTO game_stats (userId, points, level, streak, badges, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE points = VALUES(points)`,
    [student.id, points, level, streak, badges]
  );
}

console.log("✅ Game stats created");

// ============= SEED KNOWLEDGE PROFILES =============

console.log("🧠 Creating knowledge profiles...");

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
const topics = {
  "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Calculus"],
  "Physics": ["Mechanics", "Electromagnetism", "Optics", "Thermodynamics"],
  "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
  "Biology": ["Cell Biology", "Genetics", "Ecology", "Human Physiology"],
  "English": ["Grammar", "Literature", "Writing", "Comprehension"],
};

for (const student of studentUsers) {
  for (const subject of subjects) {
    const subjectTopics = topics[subject];
    for (const topic of subjectTopics) {
      const mastery = Math.floor(Math.random() * 100);
      const attemptsCount = Math.floor(Math.random() * 50) + 10;
      const correctCount = Math.floor(attemptsCount * (mastery / 100));
      
      await connection.execute(
        `INSERT INTO knowledge_profiles (userId, subject, topic, masteryScore, attemptsCount, correctCount, lastPracticed, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE masteryScore = VALUES(masteryScore)`,
        [student.id, subject, topic, mastery, attemptsCount, correctCount]
      );
    }
  }
}

console.log("✅ Knowledge profiles created");

// ============= SEED ACTIVITY LOGS =============

console.log("📊 Creating activity logs...");

const activities = [
  "Completed lesson on Algebra",
  "Scored 85% in Physics quiz",
  "Practiced 20 Chemistry problems",
  "Watched video on Cell Biology",
  "Completed assessment on Trigonometry",
];

for (const student of studentUsers) {
  for (let i = 0; i < 10; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    
    await connection.execute(
      `INSERT INTO activity_logs (userId, activityType, description, metadata, timestamp, createdAt) 
       VALUES (?, 'lesson', ?, '{}', DATE_SUB(NOW(), INTERVAL ? DAY), NOW())`,
      [student.id, activity, daysAgo]
    );
  }
}

console.log("✅ Activity logs created");

console.log("\n🎉 Database seeding completed successfully!");
console.log("\n📧 Demo Login Credentials:");
console.log("   Email: student1@acesaiprofessor.com");
console.log("   Password: demo123");
console.log("\n   Other students: student2@acesaiprofessor.com, student3@acesaiprofessor.com, etc.");
console.log("   Teachers: teacher1@acesaiprofessor.com");
console.log("   Parents: parent1@acesaiprofessor.com");
console.log("   Admin: admin@acesaiprofessor.com");
console.log("   All passwords: demo123\n");

await connection.end();
