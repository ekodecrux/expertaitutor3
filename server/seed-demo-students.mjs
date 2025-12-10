import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🎓 Creating demo student accounts...\n");

// Demo student credentials
const demoStudents = [
  {
    email: "demo.ucat@aiprofessor.com",
    name: "Ahmed Al-Rashid",
    targetExam: "UCAT",
    grade: "Grade 12",
    country: "Saudi Arabia",
    password: "Demo@2024", // In production, this would be hashed
  },
  {
    email: "demo.jee@aiprofessor.com",
    name: "Priya Sharma",
    targetExam: "JEE",
    grade: "Grade 12",
    country: "India",
    password: "Demo@2024",
  },
];

for (const student of demoStudents) {
  console.log(`\n📝 Creating ${student.name} (${student.targetExam})...`);

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, student.email))
    .limit(1);

  let userId;
  if (existingUser.length > 0) {
    console.log(`  ✓ User already exists, using existing account`);
    userId = existingUser[0].id;
  } else {
    // Create user account
    const [newUser] = await db.insert(schema.user).values({
      email: student.email,
      name: student.name,
      role: "user",
      createdAt: new Date(),
    });
    userId = newUser.insertId;
    console.log(`  ✓ User account created (ID: ${userId})`);
  }

  // Create/update student profile
  const existingProfile = await db
    .select()
    .from(schema.studentProfiles)
    .where(eq(schema.studentProfiles.userId, userId))
    .limit(1);

  let profileId;
  if (existingProfile.length > 0) {
    profileId = existingProfile[0].id;
    await db
      .update(schema.studentProfiles)
      .set({
        grade: student.grade,
        targetExams: student.targetExam,
        country: student.country,
      })
      .where(eq(schema.studentProfiles.id, profileId));
    console.log(`  ✓ Student profile updated`);
  } else {
    const [newProfile] = await db.insert(schema.studentProfiles).values({
      userId,
      grade: student.grade,
      targetExams: student.targetExam,
      country: student.country,
    });
    profileId = newProfile.insertId;
    console.log(`  ✓ Student profile created`);
  }

  // Create gamification stats
  const existingStats = await db
    .select()
    .from(schema.studentGameStats)
    .where(eq(schema.studentGameStats.userId, userId))
    .limit(1);

  if (existingStats.length === 0) {
    await db.insert(schema.studentGameStats).values({
      userId,
      points: student.targetExam === "JEE" ? 2500 : 1800,
      level: student.targetExam === "JEE" ? 8 : 6,
      currentStreak: student.targetExam === "JEE" ? 15 : 12,
      longestStreak: student.targetExam === "JEE" ? 22 : 18,
      lastLoginDate: new Date(),
    });
    console.log(`  ✓ Gamification stats created`);
  }

  // Create currency balance
  const existingCurrency = await db
    .select()
    .from(schema.studentCurrency)
    .where(eq(schema.studentCurrency.userId, userId))
    .limit(1);

  if (existingCurrency.length === 0) {
    await db.insert(schema.studentCurrency).values({
      userId,
      coins: student.targetExam === "JEE" ? 450 : 320,
      gems: student.targetExam === "JEE" ? 25 : 18,
      totalCoinsEarned: student.targetExam === "JEE" ? 850 : 620,
      totalGemsEarned: student.targetExam === "JEE" ? 35 : 28,
    });
    console.log(`  ✓ Currency balance created`);
  }

  // Get subjects for this exam
  const subjects = await db
    .select()
    .from(schema.subjects)
    .where(eq(schema.subjects.examType, student.targetExam));

  console.log(`  ✓ Found ${subjects.length} subjects for ${student.targetExam}`);

  // Create realistic progress data
  let lessonsCompleted = 0;
  let testsCompleted = 0;

  for (const subject of subjects) {
    // Get units for this subject
    const units = await db
      .select()
      .from(schema.units)
      .where(eq(schema.units.subjectId, subject.id))
      .limit(3); // First 3 units

    for (const unit of units) {
      // Get topics for this unit
      const topics = await db
        .select()
        .from(schema.topics)
        .where(eq(schema.topics.unitId, unit.id))
        .limit(5); // First 5 topics

      for (const topic of topics) {
        // Create lesson progress (70-95% completion rate)
        const completionRate = 0.7 + Math.random() * 0.25;
        const isCompleted = Math.random() < completionRate;

        if (isCompleted) {
          const existingProgress = await db
            .select()
            .from(schema.lessonProgress)
            .where(eq(schema.lessonProgress.userId, userId))
            .where(eq(schema.lessonProgress.topicId, topic.id))
            .limit(1);

          if (existingProgress.length === 0) {
            await db.insert(schema.lessonProgress).values({
              userId,
              topicId: topic.id,
              completed: true,
              score: 75 + Math.floor(Math.random() * 20), // 75-95%
              timeSpent: 300 + Math.floor(Math.random() * 600), // 5-15 minutes
              completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
            });
            lessonsCompleted++;
          }
        }

        // Create test attempts (50% of completed lessons)
        if (isCompleted && Math.random() < 0.5) {
          const existingTest = await db
            .select()
            .from(schema.testAttempts)
            .where(eq(schema.testAttempts.userId, userId))
            .where(eq(schema.testAttempts.topicId, topic.id))
            .limit(1);

          if (existingTest.length === 0) {
            await db.insert(schema.testAttempts).values({
              userId,
              topicId: topic.id,
              score: 70 + Math.floor(Math.random() * 25), // 70-95%
              totalQuestions: 10,
              correctAnswers: 7 + Math.floor(Math.random() * 3),
              timeSpent: 600 + Math.floor(Math.random() * 600), // 10-20 minutes
              completedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
            });
            testsCompleted++;
          }
        }
      }
    }
  }

  console.log(`  ✓ Created ${lessonsCompleted} lesson completions`);
  console.log(`  ✓ Created ${testsCompleted} test attempts`);

  // Create achievements
  const achievements = [
    {
      type: "first_lesson",
      title: "First Steps",
      description: "Completed your first lesson",
      icon: "🎯",
      rarity: "common",
    },
    {
      type: "7_day_streak",
      title: "Week Warrior",
      description: "Maintained a 7-day learning streak",
      icon: "🔥",
      rarity: "uncommon",
    },
    {
      type: "perfect_score",
      title: "Perfect Score",
      description: "Scored 100% on a test",
      icon: "💯",
      rarity: "rare",
    },
  ];

  for (const achievement of achievements) {
    const existing = await db
      .select()
      .from(schema.achievements)
      .where(eq(schema.achievements.userId, userId))
      .where(eq(schema.achievements.type, achievement.type))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.achievements).values({
        userId,
        ...achievement,
        earnedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
    }
  }

  console.log(`  ✓ Created ${achievements.length} achievements`);

  // Create activity logs
  const activities = [
    "Completed lesson: Introduction to Kinematics",
    "Scored 85% on Thermodynamics quiz",
    "Watched video: Organic Chemistry Basics",
    "Asked a doubt: How to solve quadratic equations?",
    "Earned achievement: Week Warrior",
  ];

  for (let i = 0; i < 10; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    await db.insert(schema.activityLogs).values({
      userId,
      activityType: "lesson_completed",
      description: activity,
      createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
    });
  }

  console.log(`  ✓ Created 10 activity logs`);

  console.log(`\n✅ ${student.name} account complete!`);
  console.log(`   Email: ${student.email}`);
  console.log(`   Password: ${student.password}`);
  console.log(`   Target Exam: ${student.targetExam}`);
  console.log(`   Progress: ${lessonsCompleted} lessons, ${testsCompleted} tests`);
}

console.log("\n\n🎉 Demo student accounts created successfully!");
console.log("\n📧 Login Credentials:");
console.log("━".repeat(60));
console.log("\n🇸🇦 UCAT Demo (Saudi Arabia):");
console.log("   Email: demo.ucat@aiprofessor.com");
console.log("   Password: Demo@2024");
console.log("   Student: Ahmed Al-Rashid");
console.log("\n🇮🇳 JEE Demo (India):");
console.log("   Email: demo.jee@aiprofessor.com");
console.log("   Password: Demo@2024");
console.log("   Student: Priya Sharma");
console.log("\n" + "━".repeat(60));

await connection.end();
process.exit(0);
