import { publicProcedure, createTRPCRouter } from '../init';
import { observableServer } from '../observable-server';
import { observable } from '@trpc/server/observable';

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
});
