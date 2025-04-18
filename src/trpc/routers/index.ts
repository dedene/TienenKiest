import { createTRPCRouter } from '../init';
import { questionsRouter } from './questions';

export const appRouter = createTRPCRouter({
  questions: questionsRouter,
});

export type AppRouter = typeof appRouter;
