import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Something went wrong', error);
      }
    },
  });
};

export { handler as GET, handler as POST };
