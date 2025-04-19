import { publicProcedure, createTRPCRouter } from '../init';
import { observableServer } from '../observable-server';
import { questions } from '@/lib/db/schema';
import { observable } from '@trpc/server/observable';
import { eq } from 'drizzle-orm';

export const subscriptionsRouter = createTRPCRouter({
  // Subscribe to counter updates
  counterUpdates: publicProcedure.subscription(() => {
    return observable<{
      answerId: string;
      count: number;
    }>((emit) => {
      const onCounterUpdate = (data: { answerId: string; count: number }) => {
        emit.next(data);
      };

      // Subscribe to counter updates
      observableServer.counterUpdate.on('counterUpdate', onCounterUpdate);

      // Cleanup when unsubscribed
      return () => {
        observableServer.counterUpdate.off('counterUpdate', onCounterUpdate);
      };
    });
  }),

  // Subscribe to active question updates
  activeQuestion: publicProcedure.subscription(({ ctx }) => {
    // Return an observable that emits the active question
    return observable<{
      id: string;
      text: string;
      answer1Text: string;
      answer1Count: number;
      answer2Text: string;
      answer2Count: number;
    }>((emit) => {
      // Track the current question to avoid duplicate emits
      let currentQuestionId: string | null = null;

      // Fetch and emit function - needs to be defined before it's used
      const fetchAndEmitQuestion = async () => {
        try {
          console.log('[DEBUG] Fetching active question');
          const activeQuestions = await ctx.db
            .select()
            .from(questions)
            .where(eq(questions.isActive, true));

          if (activeQuestions && activeQuestions.length > 0) {
            const question = activeQuestions[0];

            // Only emit if the question is different or it's the first one
            if (question.id !== currentQuestionId || currentQuestionId === null) {
              console.log('[DEBUG] Emitting question data for:', question.id);
              currentQuestionId = question.id;

              emit.next({
                id: question.id,
                text: question.text,
                answer1Text: question.answer1Text,
                answer1Count: question.answer1Count,
                answer2Text: question.answer2Text,
                answer2Count: question.answer2Count,
              });
            } else {
              console.log('[DEBUG] Question unchanged, not emitting');
            }
          } else {
            console.log('[DEBUG] No active question found');
          }
        } catch (error) {
          console.error('Error fetching active question:', error);
        }
      };

      // Execute initial fetch immediately
      fetchAndEmitQuestion();

      // Listen for active question changes
      const onActiveQuestionChange = async (data: { questionId: string }) => {
        console.log('[DEBUG] Active question change event received:', data.questionId);
        console.log('[DEBUG] Current stack:', new Error().stack);
        console.log('[DEBUG] Current question ID in memory:', currentQuestionId);

        try {
          // Always fetch on question change events
          await fetchAndEmitQuestion();
        } catch (error) {
          console.error('Error in fetchAndEmitQuestion after active question change:', error);
        }
      };

      // Listen for counter updates - this might change the counts
      const onCounterUpdate = async (data: { answerId: string; count: number }) => {
        if (!currentQuestionId) {
          // No active question yet, fetch one
          try {
            await fetchAndEmitQuestion();
          } catch (error) {
            console.error('Error fetching question during counter update:', error);
          }
          return;
        }

        // Check if this counter update is for our question
        if (data.answerId.startsWith(currentQuestionId)) {
          console.log('[DEBUG] Counter update for current question:', data);

          try {
            // Get the current question data
            const activeQuestion = await ctx.db
              .select()
              .from(questions)
              .where(eq(questions.id, currentQuestionId));

            if (activeQuestion && activeQuestion.length > 0) {
              const question = activeQuestion[0];

              emit.next({
                id: question.id,
                text: question.text,
                answer1Text: question.answer1Text,
                answer1Count: question.answer1Count,
                answer2Text: question.answer2Text,
                answer2Count: question.answer2Count,
              });
            }
          } catch (error) {
            console.error('Error processing counter update for question:', error);
          }
        }
      };

      // Set up listeners
      console.log('[DEBUG] Setting up subscription listeners');

      // Simplify the handlers
      const counterHandler = (data: { answerId: string; count: number }) => {
        onCounterUpdate(data).catch((err) =>
          console.error('Error in counter update handler:', err)
        );
      };

      const questionChangeHandler = (data: { questionId: string }) => {
        console.log(
          '[DEBUG] Active question change event received through direct handler:',
          data.questionId
        );
        onActiveQuestionChange(data).catch((err) =>
          console.error('Error in active question handler:', err)
        );
      };

      // Register with simple functions
      observableServer.counterUpdate.on('counterUpdate', counterHandler);
      observableServer.activeQuestionChange.on('activeQuestionChange', questionChangeHandler);

      // Test direct call
      console.log('[DEBUG] Testing direct handler call');
      questionChangeHandler({ questionId: 'test-direct-call' });

      // Cleanup when unsubscribed
      return () => {
        console.log('[DEBUG] Removing subscription listeners');
        observableServer.counterUpdate.off('counterUpdate', counterHandler);
        observableServer.activeQuestionChange.off('activeQuestionChange', questionChangeHandler);
      };
    });
  }),
});
