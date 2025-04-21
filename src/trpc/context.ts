import { db } from '@/lib/db';
import { Session } from 'next-auth';

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export const createContext = async () => {
  // For API routes, we use getServerSession directly in the route handler
  // This is primarily for client-side context creation
  return {
    session: undefined as Session | null | undefined,
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
