import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Starting database seeding...\n');

// Seed Curricula
console.log('📚 Seeding curricula...');
const curricula = [
  { name: 'CBSE', description: 'Central Board of Secondary Education', country: 'India' },
  { name: 'ICSE', description: 'Indian Certificate of Secondary Education', country: 'India' },
  { name: 'IB', description: 'International Baccalaureate', country: 'International' },
  { name: 'A-Levels', description: 'Advanced Level', country: 'UK' },
];

const curriculaIds = [];
for (const curr of curricula) {
  const [result] = await db.insert(schema.curricula).values(curr);
  curriculaIds.push(result.insertId);
  console.log(`  ✓ Added ${curr.name}`);
}

// Seed Subjects for CBSE
console.log('\n📖 Seeding subjects...');
const subjects = [
  { curriculumId: curriculaIds[0], name: 'Mathematics', description: 'Core mathematics curriculum', grade: '10' },
  { curriculumId: curriculaIds[0], name: 'Physics', description: 'Fundamental physics concepts', grade: '10' },
  { curriculumId: curriculaIds[0], name: 'Chemistry', description: 'Chemical principles and reactions', grade: '10' },
  { curriculumId: curriculaIds[0], name: 'Biology', description: 'Life sciences and biology', grade: '10' },
  { curriculumId: curriculaIds[0], name: 'English', description: 'English language and literature', grade: '10' },
];

const subjectIds = [];
for (const subject of subjects) {
  const [result] = await db.insert(schema.subjects).values(subject);
  subjectIds.push(result.insertId);
  console.log(`  ✓ Added ${subject.name}`);
}

// Seed Units for Mathematics
console.log('\n📑 Seeding units...');
const units = [
  { subjectId: subjectIds[0], name: 'Algebra', description: 'Algebraic expressions and equations', orderIndex: 1 },
  { subjectId: subjectIds[0], name: 'Geometry', description: 'Geometric shapes and theorems', orderIndex: 2 },
  { subjectId: subjectIds[0], name: 'Trigonometry', description: 'Trigonometric ratios and identities', orderIndex: 3 },
  { subjectId: subjectIds[1], name: 'Mechanics', description: 'Motion, force, and energy', orderIndex: 1 },
  { subjectId: subjectIds[1], name: 'Electricity', description: 'Electric circuits and current', orderIndex: 2 },
];

const unitIds = [];
for (const unit of units) {
  const [result] = await db.insert(schema.units).values(unit);
  unitIds.push(result.insertId);
  console.log(`  ✓ Added ${unit.name}`);
}

// Seed Topics
console.log('\n📝 Seeding topics...');
const topics = [
  { unitId: unitIds[0], name: 'Quadratic Equations', description: 'Solving quadratic equations', orderIndex: 1, difficultyLevel: 'medium' },
  { unitId: unitIds[0], name: 'Linear Equations', description: 'Solving linear equations', orderIndex: 2, difficultyLevel: 'easy' },
  { unitId: unitIds[1], name: 'Triangles', description: 'Properties of triangles', orderIndex: 1, difficultyLevel: 'medium' },
  { unitId: unitIds[1], name: 'Circles', description: 'Circle theorems and properties', orderIndex: 2, difficultyLevel: 'medium' },
  { unitId: unitIds[2], name: 'Trigonometric Ratios', description: 'Sin, cos, tan ratios', orderIndex: 1, difficultyLevel: 'medium' },
  { unitId: unitIds[3], name: 'Newton\'s Laws', description: 'Laws of motion', orderIndex: 1, difficultyLevel: 'hard' },
  { unitId: unitIds[4], name: 'Ohm\'s Law', description: 'Voltage, current, and resistance', orderIndex: 1, difficultyLevel: 'easy' },
];

const topicIds = [];
for (const topic of topics) {
  const [result] = await db.insert(schema.topics).values(topic);
  topicIds.push(result.insertId);
  console.log(`  ✓ Added ${topic.name}`);
}

// Seed Questions
console.log('\n❓ Seeding questions...');
const questions = [
  {
    topicId: topicIds[0],
    questionText: 'Solve the quadratic equation: x² - 5x + 6 = 0',
    type: 'mcq',
    difficultyLevel: 'medium',
    marks: 2,
    correctAnswer: 'x = 2, 3',
    explanation: 'Factor the equation: (x-2)(x-3) = 0, therefore x = 2 or x = 3',
    options: [
      { text: 'x = 2, 3', isCorrect: true },
      { text: 'x = 1, 6', isCorrect: false },
      { text: 'x = -2, -3', isCorrect: false },
      { text: 'x = 0, 5', isCorrect: false },
    ],
  },
  {
    topicId: topicIds[0],
    questionText: 'What is the discriminant of the equation 2x² + 3x - 5 = 0?',
    type: 'numeric',
    difficultyLevel: 'medium',
    marks: 2,
    correctAnswer: '49',
    explanation: 'Discriminant = b² - 4ac = 3² - 4(2)(-5) = 9 + 40 = 49',
  },
  {
    topicId: topicIds[1],
    questionText: 'Solve for x: 2x + 5 = 15',
    type: 'mcq',
    difficultyLevel: 'easy',
    marks: 1,
    correctAnswer: 'x = 5',
    explanation: '2x = 15 - 5 = 10, therefore x = 5',
    options: [
      { text: 'x = 5', isCorrect: true },
      { text: 'x = 10', isCorrect: false },
      { text: 'x = 7.5', isCorrect: false },
      { text: 'x = 2.5', isCorrect: false },
    ],
  },
  {
    topicId: topicIds[2],
    questionText: 'In a right triangle, if one angle is 30° and the hypotenuse is 10 cm, what is the length of the side opposite to the 30° angle?',
    type: 'mcq',
    difficultyLevel: 'medium',
    marks: 3,
    correctAnswer: '5 cm',
    explanation: 'Using sin(30°) = opposite/hypotenuse = opposite/10. Since sin(30°) = 0.5, opposite = 5 cm',
    options: [
      { text: '5 cm', isCorrect: true },
      { text: '8.66 cm', isCorrect: false },
      { text: '10 cm', isCorrect: false },
      { text: '7.5 cm', isCorrect: false },
    ],
  },
  {
    topicId: topicIds[4],
    questionText: 'What is the value of sin(45°)?',
    type: 'mcq',
    difficultyLevel: 'easy',
    marks: 1,
    correctAnswer: '1/√2',
    explanation: 'sin(45°) = 1/√2 ≈ 0.707',
    options: [
      { text: '1/√2', isCorrect: true },
      { text: '1/2', isCorrect: false },
      { text: '√3/2', isCorrect: false },
      { text: '1', isCorrect: false },
    ],
  },
  {
    topicId: topicIds[5],
    questionText: 'State Newton\'s Second Law of Motion and explain with an example.',
    type: 'long_answer',
    difficultyLevel: 'hard',
    marks: 5,
    correctAnswer: 'Newton\'s Second Law states that Force = Mass × Acceleration (F = ma). Example: When you push a shopping cart, the force you apply causes it to accelerate. A heavier cart (more mass) requires more force to achieve the same acceleration.',
    explanation: 'This is a conceptual question requiring understanding of the relationship between force, mass, and acceleration.',
  },
  {
    topicId: topicIds[6],
    questionText: 'If a resistor has a voltage of 12V across it and a current of 3A flowing through it, what is its resistance?',
    type: 'numeric',
    difficultyLevel: 'easy',
    marks: 2,
    correctAnswer: '4',
    explanation: 'Using Ohm\'s Law: V = IR, therefore R = V/I = 12/3 = 4 Ω',
  },
];

const questionIds = [];
for (const question of questions) {
  const [result] = await db.insert(schema.questions).values(question);
  questionIds.push(result.insertId);
  console.log(`  ✓ Added question for ${topics.find(t => t.orderIndex === question.topicId)?.name || 'topic'}`);
}

// Seed Tests
console.log('\n📋 Seeding tests...');
const tests = [
  {
    subjectId: subjectIds[0],
    name: 'Algebra Chapter Test',
    description: 'Comprehensive test on algebraic concepts',
    type: 'chapter_test',
    durationMinutes: 60,
    totalMarks: 20,
    passingMarks: 12,
    negativeMarking: false,
  },
  {
    subjectId: subjectIds[0],
    name: 'Mathematics Mock Exam',
    description: 'Full-length mathematics mock examination',
    type: 'mock_exam',
    durationMinutes: 180,
    totalMarks: 100,
    passingMarks: 33,
    negativeMarking: true,
    negativeMarkingValue: 0.25,
  },
  {
    subjectId: subjectIds[1],
    name: 'Physics Quick Quiz',
    description: 'Short quiz on basic physics concepts',
    type: 'practice',
    durationMinutes: 30,
    totalMarks: 10,
    passingMarks: 5,
    negativeMarking: false,
  },
];

const testIds = [];
for (const test of tests) {
  const [result] = await db.insert(schema.tests).values(test);
  testIds.push(result.insertId);
  console.log(`  ✓ Added ${test.name}`);
}

// Link Questions to Tests
console.log('\n🔗 Linking questions to tests...');
const testQuestions = [
  { testId: testIds[0], questionId: questionIds[0], orderIndex: 1, marks: 2 },
  { testId: testIds[0], questionId: questionIds[1], orderIndex: 2, marks: 2 },
  { testId: testIds[0], questionId: questionIds[2], orderIndex: 3, marks: 1 },
  { testId: testIds[1], questionId: questionIds[0], orderIndex: 1, marks: 3 },
  { testId: testIds[1], questionId: questionIds[1], orderIndex: 2, marks: 3 },
  { testId: testIds[1], questionId: questionIds[2], orderIndex: 3, marks: 2 },
  { testId: testIds[1], questionId: questionIds[3], orderIndex: 4, marks: 4 },
  { testId: testIds[2], questionId: questionIds[5], orderIndex: 1, marks: 5 },
  { testId: testIds[2], questionId: questionIds[6], orderIndex: 2, marks: 2 },
];

for (const tq of testQuestions) {
  await db.insert(schema.testQuestions).values(tq);
}
console.log(`  ✓ Linked ${testQuestions.length} questions to tests`);

// Seed Achievements
console.log('\n🏆 Seeding achievements...');
const achievements = [
  {
    name: 'First Steps',
    description: 'Complete your first learning session',
    badgeIcon: '🎯',
    pointsRequired: 10,
    category: 'milestone',
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    badgeIcon: '🔥',
    pointsRequired: 100,
    category: 'streak',
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on any test',
    badgeIcon: '⭐',
    pointsRequired: 200,
    category: 'performance',
  },
  {
    name: 'Knowledge Seeker',
    description: 'Ask 10 doubts',
    badgeIcon: '💡',
    pointsRequired: 50,
    category: 'engagement',
  },
  {
    name: 'Test Master',
    description: 'Complete 10 practice tests',
    badgeIcon: '📝',
    pointsRequired: 150,
    category: 'practice',
  },
];

for (const achievement of achievements) {
  await db.insert(schema.achievements).values(achievement);
  console.log(`  ✓ Added ${achievement.name}`);
}

console.log('\n✅ Database seeding completed successfully!');
console.log('\n📊 Summary:');
console.log(`  - ${curricula.length} curricula`);
console.log(`  - ${subjects.length} subjects`);
console.log(`  - ${units.length} units`);
console.log(`  - ${topics.length} topics`);
console.log(`  - ${questions.length} questions`);
console.log(`  - ${tests.length} tests`);
console.log(`  - ${achievements.length} achievements`);

await connection.end();
process.exit(0);
