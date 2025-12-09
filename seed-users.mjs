import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log("🌱 Starting database seeding...");
console.log("📋 Checking existing tables...");

// Check which tables exist
const [tables] = await connection.execute("SHOW TABLES");
const tableNames = tables.map(t => Object.values(t)[0]);
console.log("✅ Found tables:", tableNames.join(", "));

// ============= SEED USERS =============

console.log("\n📝 Creating demo users...");

const hashedPassword = await bcrypt.hash("demo123", 10);

// Create demo students
const students = [
  { email: "student1@expertaitutor.com", name: "Rahul Sharma" },
  { email: "student2@expertaitutor.com", name: "Priya Patel" },
  { email: "student3@expertaitutor.com", name: "Amit Kumar" },
  { email: "student4@expertaitutor.com", name: "Sneha Reddy" },
  { email: "student5@expertaitutor.com", name: "Arjun Singh" },
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
  { email: "teacher1@expertaitutor.com", name: "Dr. Rajesh Verma" },
  { email: "teacher2@expertaitutor.com", name: "Prof. Meena Iyer" },
  { email: "teacher3@expertaitutor.com", name: "Mr. Suresh Nair" },
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
  { email: "parent1@expertaitutor.com", name: "Mr. Ramesh Gupta" },
  { email: "parent2@expertaitutor.com", name: "Mrs. Lakshmi Menon" },
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
  ["admin-demo", "Demo Admin", "admin@expertaitutor.com", hashedPassword]
);

console.log("✅ Users created");

// ============= SEED STUDENT PROFILES (if table exists) =============

if (tableNames.includes("student_profiles")) {
  console.log("\n👤 Creating student profiles...");

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
}

console.log("\n🎉 Database seeding completed successfully!");
console.log("\n📧 Demo Login Credentials:");
console.log("   Email: student1@expertaitutor.com");
console.log("   Password: demo123");
console.log("\n   Other accounts:");
console.log("   - Students: student2@expertaitutor.com, student3@expertaitutor.com, etc.");
console.log("   - Teachers: teacher1@expertaitutor.com, teacher2@expertaitutor.com, etc.");
console.log("   - Parents: parent1@expertaitutor.com, parent2@expertaitutor.com");
console.log("   - Admin: admin@expertaitutor.com");
console.log("   - All passwords: demo123\n");

await connection.end();
