USE learn_platform;

INSERT INTO users (name, email, password_hash, role) VALUES
('Prof. Ada', 'ada@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'professor');

INSERT INTO courses (title, description, professor_id, difficulty) VALUES
('Intro to SQL', 'Learn the basics of SQL.', 1, 'Beginner'),
('React Basics', 'React fundamentals and components.', 1, 'Beginner'),
('TypeScript Foundations', 'Strongly typed JavaScript.', 1, 'Beginner'),
('Web Accessibility', 'Accessible web design principles.', 1, 'Intermediate'),
('AI Fundamentals', 'Intro to machine learning and AI.', 1, 'Beginner'),
('Data Visualization', 'How to communicate with charts.', 1, 'Intermediate'),
('Cybersecurity Basics', 'Security essentials for beginners.', 1, 'Beginner'),
('Cloud Computing Intro', 'Cloud concepts and deployment.', 1, 'Beginner'),
('Git and GitHub', 'Version control and collaboration.', 1, 'Beginner'),
('Career Readiness for Tech', 'Build your career toolkit.', 1, 'Beginner');

INSERT INTO slides (course_id, slide_number, title, content)
SELECT c.id, n.slide_number,
CONCAT(c.title, ' - Slide ', n.slide_number),
CONCAT('This is the content for ', c.title, ', slide ', n.slide_number, '. Learn the key concept, review the example, and move to the next slide.')
FROM courses c
JOIN (
  SELECT 1 AS slide_number UNION ALL
  SELECT 2 UNION ALL
  SELECT 3 UNION ALL
  SELECT 4 UNION ALL
  SELECT 5 UNION ALL
  SELECT 6 UNION ALL
  SELECT 7 UNION ALL
  SELECT 8 UNION ALL
  SELECT 9 UNION ALL
  SELECT 10
) n;