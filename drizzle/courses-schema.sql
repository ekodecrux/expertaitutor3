-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  curriculum_id INT,
  subject_id INT,
  grade VARCHAR(50),
  thumbnail_url TEXT,
  instructor_name VARCHAR(255),
  duration_hours INT,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
  is_published BOOLEAN DEFAULT FALSE,
  enrollment_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curriculum_id) REFERENCES curricula(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_user_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_percentage INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  certificate_url TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (student_user_id) REFERENCES users(id)
);

-- Video lessons
CREATE TABLE IF NOT EXISTS video_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  topic_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  order_index INT DEFAULT 0,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Video progress tracking
CREATE TABLE IF NOT EXISTS video_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_lesson_id INT NOT NULL,
  student_user_id INT NOT NULL,
  watched_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_lesson_id) REFERENCES video_lessons(id),
  FOREIGN KEY (student_user_id) REFERENCES users(id)
);

-- Lesson plans
CREATE TABLE IF NOT EXISTS lesson_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_exam VARCHAR(100),
  start_date DATE,
  end_date DATE,
  daily_hours INT,
  weekly_goals TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_user_id) REFERENCES users(id)
);

-- Lesson plan activities
CREATE TABLE IF NOT EXISTS lesson_plan_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_plan_id INT NOT NULL,
  activity_date DATE NOT NULL,
  topic_id INT,
  activity_type ENUM('study', 'practice', 'test', 'revision'),
  duration_minutes INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
