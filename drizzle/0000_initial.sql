CREATE TABLE IF NOT EXISTS `questions` (
  `id` text PRIMARY KEY NOT NULL,
  `text` text NOT NULL,
  `is_active` integer DEFAULT 0 NOT NULL,
  `answer1_text` text NOT NULL,
  `answer1_count` integer DEFAULT 0 NOT NULL,
  `answer2_text` text NOT NULL,
  `answer2_count` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
); 
