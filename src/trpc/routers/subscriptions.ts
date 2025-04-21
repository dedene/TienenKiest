import { publicProcedure, createTRPCRouter } from '../init';
import { questions } from '@/lib/db/schema';
import {
  onCounterUpdate,
  offCounterUpdate,
  onActiveQuestion,
  offActiveQuestion,
  onStatusUpdate,
  offStatusUpdate,
  getListenerCount,
} from '@/lib/global-event-bus';
import { eq } from 'drizzle-orm';

export const subscriptionsRouter = createTRPCRouter({
  // Subscribe to counter updates
  counterUpdates: publicProcedure.subscription(async function* (opts) {
    console.log('Setting up counterUpdates subscription on global event bus');
    console.log('Current listener counts:', getListenerCount());

    // Set up event handler with access to the resolve function
    let resolvePromise: ((data: { answerId: string; count: number }) => void) | null = null;

    const onCounterUpdateHandler = (data: { answerId: string; count: number }) => {
      console.log('Subscription received counterUpdate event:', data);
      if (resolvePromise) {
        resolvePromise(data);
        resolvePromise = null;
      }
    };

    // Listen for counter updates using the global event bus
    onCounterUpdate(onCounterUpdateHandler);
    console.log('Subscription registered, current counts:', getListenerCount());

    // Make sure to clean up listener on abort
    if (opts.signal) {
      opts.signal.addEventListener('abort', () => {
        console.log('Aborting counterUpdates subscription');
        offCounterUpdate(onCounterUpdateHandler);
        resolvePromise = null;
      });
    }

    try {
      // Keep subscription alive and yield updates when they come
      while (opts.signal && !opts.signal.aborted) {
        // Wait for next event using a promise
        const data = await new Promise<{ answerId: string; count: number }>((resolve) => {
          resolvePromise = resolve;
        });

        // Emit the update to the client
        console.log('Yielding counter update to client:', data);
        yield data;
      }
    } finally {
      // Cleanup when subscription ends
      console.log('Cleaning up counterUpdates subscription');
      offCounterUpdate(onCounterUpdateHandler);
    }
  }),

  // Subscribe to status updates
  statusUpdates: publicProcedure.subscription(async function* (opts) {
    console.log('Setting up statusUpdates subscription on global event bus');
    console.log('Current listener counts:', getListenerCount());

    // Set up event handler with access to the resolve function
    let resolvePromise: ((data: { answerId: string; status: number }) => void) | null = null;

    const onStatusUpdateHandler = (data: { answerId: string; status: number }) => {
      console.log('Subscription received statusUpdate event:', data);
      if (resolvePromise) {
        resolvePromise(data);
        resolvePromise = null;
      }
    };

    // Listen for status updates using the global event bus
    onStatusUpdate(onStatusUpdateHandler);
    console.log('Status subscription registered, current counts:', getListenerCount());

    // Make sure to clean up listener on abort
    if (opts.signal) {
      opts.signal.addEventListener('abort', () => {
        console.log('Aborting statusUpdates subscription');
        offStatusUpdate(onStatusUpdateHandler);
        resolvePromise = null;
      });
    }

    try {
      // Keep subscription alive and yield updates when they come
      while (opts.signal && !opts.signal.aborted) {
        // Wait for next event using a promise
        const data = await new Promise<{ answerId: string; status: number }>((resolve) => {
          resolvePromise = resolve;
        });

        // Emit the update to the client
        console.log('Yielding status update to client:', data);
        yield data;
      }
    } finally {
      // Cleanup when subscription ends
      console.log('Cleaning up statusUpdates subscription');
      offStatusUpdate(onStatusUpdateHandler);
    }
  }),

  // Subscribe to active question updates
  activeQuestion: publicProcedure.subscription(async function* (opts) {
    console.log('Setting up activeQuestion subscription with global event bus');
    console.log('Current listener counts:', getListenerCount());

    // Set up event handler with access to the resolve function
    let resolvePromise:
      | ((
          data: {
            id: string;
            question: string;
            answer1Text: string;
            answer2Text: string;
            answer1Count: number;
            answer2Count: number;
            answer1Color: string;
            answer2Color: string;
          } | null
        ) => void)
      | null = null;

    const activeQuestionHandler = async (data: { questionId: string }) => {
      console.log('Subscription received activeQuestion event:', data);

      // Get the question data from the database
      const question = await opts.ctx.db.query.questions.findFirst({
        where: eq(questions.id, data.questionId),
      });

      if (question && resolvePromise) {
        console.log('Found question, emitting update:', question);
        resolvePromise({
          id: question.id,
          question: question.text,
          answer1Text: question.answer1Text,
          answer2Text: question.answer2Text,
          answer1Count: question.answer1Count,
          answer2Count: question.answer2Count,
          answer1Color: question.answer1Color,
          answer2Color: question.answer2Color,
        });
        resolvePromise = null;
      } else {
        console.log('No question found for ID:', data.questionId);
        if (resolvePromise) {
          resolvePromise(null);
          resolvePromise = null;
        }
      }
    };

    // Register the handler with the global event bus
    onActiveQuestion(activeQuestionHandler);

    // Cleanup if aborted
    if (opts.signal) {
      opts.signal.addEventListener('abort', () => {
        console.log('Aborting activeQuestion subscription');
        offActiveQuestion(activeQuestionHandler);
        resolvePromise = null;
      });
    }

    try {
      while (opts.signal && !opts.signal.aborted) {
        // Wait for the next active question update
        const questionData = await new Promise<{
          id: string;
          question: string;
          answer1Text: string;
          answer2Text: string;
          answer1Count: number;
          answer2Count: number;
          answer1Color: string;
          answer2Color: string;
        } | null>((resolve) => {
          resolvePromise = resolve;
        });

        // Only yield if we got valid data
        if (questionData) {
          console.log('Yielding active question update to client:', questionData);
          yield questionData;
        }
      }
    } finally {
      console.log('Cleaning up activeQuestion subscription');
      offActiveQuestion(activeQuestionHandler);
    }
  }),
});
