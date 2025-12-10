import { getDb } from "./db.js";
import { users, parentStudentLinks, studentGameStats, testAttempts, activityLogs } from "../drizzle/schema.js";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm.js";

/**
 * Parent Engagement System
 * Sends weekly progress emails, tips, milestone celebrations, and warning alerts
 */

interface WeeklyProgressData {
  studentName: string;
  weeklyStats: {
    lessonsCompleted: number;
    testsCompleted: number;
    averageScore: number;
    timeSpent: number; // in minutes
    streak: number;
    level: number;
    pointsEarned: number;
  };
  strengths: string[];
  improvements: string[];
  upcomingMilestones: string[];
}

interface ParentTip {
  title: string;
  description: string;
  actionable: string;
  conversationStarter: string;
}

/**
 * Generate weekly progress report for a student
 */
export async function generateWeeklyProgressReport(studentId: number): Promise<WeeklyProgressData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get student info
  const [student] = await db.select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (!student) throw new Error("Student not found");

  // Get date range (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get activity logs for the week
  const activities = await db.select()
    .from(activityLogs)
    .where(and(
      eq(activityLogs.userId, studentId),
      gte(activityLogs.createdAt, oneWeekAgo)
    ));

  // Get test attempts for the week
  const tests = await db.select()
    .from(testAttempts)
    .where(and(
      eq(testAttempts.studentUserId, studentId),
      gte(testAttempts.startedAt, oneWeekAgo)
    ));

  // Get game stats
  const [gameStats] = await db.select()
    .from(studentGameStats)
    .where(eq(studentGameStats.studentUserId, studentId))
    .limit(1);

  // Calculate weekly stats
  const lessonsCompleted = activities.filter(a => a.activityType === 'study').length;
  const testsCompleted = tests.length;
  const averageScore = tests.length > 0
    ? tests.reduce((sum, t) => sum + (t.score || 0), 0) / tests.length
    : 0;
  const timeSpent = activities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 60; // Convert to minutes

  // Analyze strengths and improvements using AI
  const analysisPrompt = `Analyze this student's weekly performance and provide:
1. Top 3 strengths (subjects/topics they excelled in)
2. Top 3 areas for improvement
3. Upcoming milestones they're close to achieving

Data:
- Lessons completed: ${lessonsCompleted}
- Tests completed: ${testsCompleted}
- Average score: ${averageScore.toFixed(1)}%
- Time spent: ${timeSpent} minutes
- Current streak: ${gameStats?.currentStreak || 0} days
- Level: ${gameStats?.level || 1}

Format as JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "upcomingMilestones": ["milestone1", "milestone2"]
}`;

  const aiResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are an educational analyst. Provide concise, actionable insights." },
      { role: "user", content: analysisPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "weekly_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 strengths"
            },
            improvements: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 areas for improvement"
            },
            upcomingMilestones: {
              type: "array",
              items: { type: "string" },
              description: "Upcoming milestones"
            }
          },
          required: ["strengths", "improvements", "upcomingMilestones"],
          additionalProperties: false
        }
      }
    }
  });

  const content = aiResponse.choices[0].message.content;
  const analysis = JSON.parse(typeof content === 'string' ? content : "{}");

  return {
    studentName: student.name || "Student",
    weeklyStats: {
      lessonsCompleted,
      testsCompleted,
      averageScore: Math.round(averageScore),
      timeSpent,
      streak: gameStats?.currentStreak || 0,
      level: gameStats?.level || 1,
      pointsEarned: gameStats?.totalPoints || 0,
    },
    strengths: analysis.strengths || [],
    improvements: analysis.improvements || [],
    upcomingMilestones: analysis.upcomingMilestones || [],
  };
}

/**
 * Generate personalized parent tips based on student's performance
 */
export async function generateParentTips(studentId: number): Promise<ParentTip[]> {
  const progressData = await generateWeeklyProgressReport(studentId);

  const tipPrompt = `Generate 3 personalized tips for parents based on their child's performance:

Student Stats:
- Lessons completed: ${progressData.weeklyStats.lessonsCompleted}
- Average score: ${progressData.weeklyStats.averageScore}%
- Time spent: ${progressData.weeklyStats.timeSpent} minutes
- Streak: ${progressData.weeklyStats.streak} days
- Improvements needed: ${progressData.improvements.join(", ")}

For each tip, provide:
1. Title (short, actionable)
2. Description (why this matters)
3. Actionable step (specific action parent can take)
4. Conversation starter (question to ask their child)

Format as JSON array.`;

  const aiResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are a parenting coach specializing in education. Provide practical, empathetic advice." },
      { role: "user", content: tipPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "parent_tips",
        strict: true,
        schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  actionable: { type: "string" },
                  conversationStarter: { type: "string" }
                },
                required: ["title", "description", "actionable", "conversationStarter"],
                additionalProperties: false
              }
            }
          },
          required: ["tips"],
          additionalProperties: false
        }
      }
    }
  });

  const content2 = aiResponse.choices[0].message.content;
  const result = JSON.parse(typeof content2 === 'string' ? content2 : '{"tips":[]}');
  return result.tips || [];
}

/**
 * Generate HTML email for weekly progress report
 */
export function generateWeeklyEmailHTML(progressData: WeeklyProgressData, tips: ParentTip[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Progress Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f7fafc; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #718096; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 15px; }
    .list-item { background: #f7fafc; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #667eea; }
    .tip-card { background: #fff; border: 2px solid #e2e8f0; padding: 20px; margin: 15px 0; border-radius: 10px; }
    .tip-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
    .conversation { background: #fef5e7; padding: 15px; border-radius: 8px; margin-top: 10px; }
    .footer { text-align: center; color: #718096; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Weekly Progress Report</h1>
    <p>Your child's learning journey this week</p>
  </div>

  <div class="section">
    <h2 class="section-title">📈 This Week's Stats</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${progressData.weeklyStats.lessonsCompleted}</div>
        <div class="stat-label">Lessons Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progressData.weeklyStats.testsCompleted}</div>
        <div class="stat-label">Tests Taken</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progressData.weeklyStats.averageScore}%</div>
        <div class="stat-label">Average Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progressData.weeklyStats.streak} 🔥</div>
        <div class="stat-label">Day Streak</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">💪 Strengths</h2>
    ${progressData.strengths.map(s => `<div class="list-item">✅ ${s}</div>`).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">🎯 Areas for Growth</h2>
    ${progressData.improvements.map(i => `<div class="list-item">📌 ${i}</div>`).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">💡 Tips for Parents</h2>
    ${tips.map(tip => `
      <div class="tip-card">
        <div class="tip-title">${tip.title}</div>
        <p>${tip.description}</p>
        <p><strong>Action:</strong> ${tip.actionable}</p>
        <div class="conversation">
          <strong>💬 Ask your child:</strong><br>
          "${tip.conversationStarter}"
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">🎉 Upcoming Milestones</h2>
    ${progressData.upcomingMilestones.map(m => `<div class="list-item">🎯 ${m}</div>`).join('')}
  </div>

  <div class="footer">
    <p>This is an automated weekly report from ExpertAitutor</p>
    <p>Keep encouraging your child's learning journey! 🌟</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate milestone celebration email
 */
export function generateMilestoneEmailHTML(studentName: string, milestoneTitle: string, milestoneDescription: string, rewardCoins: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Milestone Achieved!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; border-radius: 10px; text-align: center; }
    .celebration { font-size: 60px; margin: 20px 0; }
    .content { padding: 30px 20px; text-align: center; }
    .milestone-title { font-size: 28px; font-weight: bold; color: #2d3748; margin: 20px 0; }
    .reward-box { background: #fef5e7; border: 2px dashed #f39c12; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .reward-value { font-size: 36px; font-weight: bold; color: #f39c12; }
    .cta { background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #718096; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="celebration">🎉 🎊 🎉</div>
    <h1>Milestone Achieved!</h1>
    <p>${studentName} reached a new milestone!</p>
  </div>

  <div class="content">
    <div class="milestone-title">${milestoneTitle}</div>
    <p>${milestoneDescription}</p>

    <div class="reward-box">
      <p><strong>Reward Earned:</strong></p>
      <div class="reward-value">+${rewardCoins} Coins 🪙</div>
    </div>

    <p>Celebrate this achievement with your child! Their dedication and hard work are paying off.</p>
    
    <a href="#" class="cta">View Full Progress Report</a>
  </div>

  <div class="footer">
    <p>Keep up the great work! 🌟</p>
    <p>ExpertAitutor - Your child's learning companion</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate warning alert email (student hasn't logged in for 3+ days)
 */
export function generateWarningEmailHTML(studentName: string, daysSinceLastLogin: number, currentStreak: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activity Alert</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .alert-icon { font-size: 50px; margin: 10px 0; }
    .content { padding: 30px 20px; }
    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 6px; }
    .streak-info { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
    .streak-value { font-size: 32px; font-weight: bold; color: #f39c12; }
    .tips { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta { background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #718096; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="alert-icon">⚠️</div>
    <h1>Activity Alert</h1>
    <p>We miss ${studentName}!</p>
  </div>

  <div class="content">
    <div class="warning-box">
      <p><strong>It's been ${daysSinceLastLogin} days since ${studentName}'s last login.</strong></p>
      <p>Regular practice is key to maintaining progress and building strong learning habits.</p>
    </div>

    ${currentStreak > 0 ? `
      <div class="streak-info">
        <p><strong>Current Streak at Risk:</strong></p>
        <div class="streak-value">${currentStreak} days 🔥</div>
        <p>Log in today to keep the streak alive!</p>
      </div>
    ` : ''}

    <div class="tips">
      <h3>💡 Tips to Re-engage:</h3>
      <ul>
        <li>Set a specific time each day for learning (e.g., after dinner)</li>
        <li>Start with a short 10-minute session to rebuild the habit</li>
        <li>Celebrate small wins to rebuild motivation</li>
        <li>Ask what's blocking them - offer support if needed</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="#" class="cta">Resume Learning</a>
    </p>
  </div>

  <div class="footer">
    <p>We're here to support ${studentName}'s learning journey! 🌟</p>
    <p>ExpertAitutor - Your child's learning companion</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Check if student needs warning email (hasn't logged in for 3+ days)
 */
export async function checkInactiveStudents(): Promise<{ studentId: number; daysSinceLastLogin: number }[]> {
  const db = await getDb();
  if (!db) return [];

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Find students who haven't logged in for 3+ days
  const inactiveStudents = await db.select({
    id: users.id,
    lastSignedIn: users.lastSignedIn,
  })
    .from(users)
    .where(and(
      eq(users.role, "student"),
      sql`${users.lastSignedIn} < ${threeDaysAgo}`
    ));

  return inactiveStudents.map(student => ({
    studentId: student.id,
    daysSinceLastLogin: Math.floor((Date.now() - new Date(student.lastSignedIn!).getTime()) / (1000 * 60 * 60 * 24)),
  }));
}
