import { publicProcedure, createTRPCRouter } from '../init';
import { questions, NewQuestion } from '@/lib/db/schema';
import { emitActiveQuestion } from '@/lib/global-event-bus';
import { resetCounters } from '@/lib/mqtt';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export const questionsRouter = createTRPCRouter({
  // Get all questions or active questions only
  getAll: publicProcedure
    .input(
      z
        .object({
          activeOnly: z.boolean().optional().default(false),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const questionData = await ctx.db.select().from(questions);
        const activeOnly = input?.activeOnly ?? false;

        if (activeOnly) {
          return await ctx.db.select().from(questions).where(eq(questions.isActive, true));
        } else {
          return questionData;
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    }),

  // Create a new question
  create: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1, { message: 'Question text is required' }),
        isActive: z.boolean().optional().default(false),
        answer1Text: z.string().min(1, { message: 'Answer 1 text is required' }),
        answer2Text: z.string().min(1, { message: 'Answer 2 text is required' }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if this is the first question
      const existingQuestions = await ctx.db.select().from(questions);
      const isFirstQuestion = existingQuestions.length === 0;

      // If it's the first question, set it as active
      const newQuestion: NewQuestion = {
        id: input.id || uuidv4(),
        text: input.text,
        isActive: isFirstQuestion ? true : input.isActive || false,
        answer1Text: input.answer1Text,
        answer1Count: 0,
        answer2Text: input.answer2Text,
        answer2Count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const insertedQuestion = await ctx.db.insert(questions).values(newQuestion).returning();

      // Emit event if the new question is set as active
      if (newQuestion.isActive) {
        console.log('Emitting activeQuestion event for new question:', newQuestion.id);
        emitActiveQuestion({
          questionId: newQuestion.id,
        });
      }

      return insertedQuestion[0];
    }),

  // Update a question
  update: publicProcedure
    .input(
      z.object({
        id: z.string({ required_error: 'Question ID is required' }),
        text: z.string({ required_error: 'Question text is required' }),
        isActive: z.boolean().optional(),
        answer1Text: z.string().optional(),
        answer2Text: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<NewQuestion> = {
        text: input.text,
        updatedAt: new Date().toISOString(),
      };

      if (input.isActive !== undefined) {
        updateData.isActive = input.isActive;
      }

      if (input.answer1Text) {
        updateData.answer1Text = input.answer1Text;
      }

      if (input.answer2Text) {
        updateData.answer2Text = input.answer2Text;
      }

      const updatedQuestion = await ctx.db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, input.id))
        .returning();

      if (!updatedQuestion || updatedQuestion.length === 0) {
        throw new Error('Question not found');
      }

      // Emit event if:
      // 1. The question was set to active, or
      // 2. The question was updated and it's already active (to update text/options)
      if (input.isActive === true || updatedQuestion[0].isActive) {
        console.log('Emitting activeQuestion event after update for question:', input.id);
        emitActiveQuestion({
          questionId: input.id,
        });
      }

      return updatedQuestion[0];
    }),

  // Delete a question
  delete: publicProcedure
    .input(
      z.object({
        id: z.string({ required_error: 'Question ID is required' }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedQuestion = await ctx.db
        .delete(questions)
        .where(eq(questions.id, input.id))
        .returning();

      if (!deletedQuestion || deletedQuestion.length === 0) {
        throw new Error('Question not found');
      }

      return { message: 'Question deleted successfully' };
    }),

  // Toggle question active status
  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.string({ required_error: 'Question ID is required' }),
        action: z.enum(['activate', 'deactivate'], {
          required_error: 'Action must be "activate" or "deactivate"',
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isActive = input.action === 'activate';

      // If we're activating a question, first deactivate all questions
      if (isActive) {
        await ctx.db.update(questions).set({ isActive: false }).where(eq(questions.isActive, true));
      }

      const updateData: Partial<NewQuestion> = {
        isActive,
        updatedAt: new Date().toISOString(),
      };

      const updatedQuestion = await ctx.db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, input.id))
        .returning();

      if (!updatedQuestion || updatedQuestion.length === 0) {
        throw new Error('Question not found');
      }

      // Emit event for active question change if we're activating
      if (isActive) {
        console.log('Emitting activeQuestion event after toggle for question:', input.id);
        emitActiveQuestion({
          questionId: input.id,
        });
      }

      return updatedQuestion[0];
    }),

  // Reset counters for the active question
  resetCounters: publicProcedure.mutation(async () => {
    const result = await resetCounters();

    if (!result) {
      throw new Error('Failed to reset counters or no active question found');
    }

    return { success: true };
  }),

  // Debug endpoint to test activeQuestion event
  testActiveQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const testId = input.questionId || `test-${Date.now()}`;
      console.log(`[TEST] Manually triggering activeQuestion event for: ${testId}`);

      try {
        emitActiveQuestion({
          questionId: testId,
        });
        console.log(`[TEST] Manual activeQuestion event emitted successfully`);
        return { success: true, questionId: testId };
      } catch (error) {
        console.error('[TEST] Error emitting test event:', error);
        throw new Error('Failed to emit test event');
      }
    }),
});
