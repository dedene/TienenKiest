import { createTRPCRouter } from '../init';
import { questionsRouter } from './questions';
import { subscriptionsRouter } from './subscriptions';

export const appRouter = createTRPCRouter({
  questions: questionsRouter,
  subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;
