import { authOptions } from '@/app/auth';
import { db } from '@/lib/db';
import { appRouter } from '@/trpc/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { getServerSession } from 'next-auth';

const handler = async (req: Request) => {
  // Get the session directly here
  const session = await getServerSession(authOptions);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({ session, db }),
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Something went wrong', error);
      }
    },
  });
};

export { handler as GET, handler as POST };
