import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Questions table with embedded answers
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),

  // First answer (position 0)
  answer1Text: text('answer1_text').notNull(),
  answer1Count: integer('answer1_count').notNull().default(0),
  answer1Color: text('answer1_color').notNull().default('#0D9900'),

  // Second answer (position 1)
  answer2Text: text('answer2_text').notNull(),
  answer2Count: integer('answer2_count').notNull().default(0),
  answer2Color: text('answer2_color').notNull().default('#D10000'),

  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Define types based on schema
export type Question = typeof questions.$inferSelect;

// Define insert types
export type NewQuestion = typeof questions.$inferInsert;
