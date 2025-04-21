/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v11/router
 * @see https://trpc.io/docs/v11/procedures
 */

import type { Context } from './context';
import { db } from '@/lib/db';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/v11/data-transformers
   */
  transformer: superjson,
  /**
   * @see https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {
    session: null,
    db,
  };
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure that requires the user to be authenticated as admin
 * This middleware checks if the user is authenticated via NextAuth
 * and throws an error if they are not
 */
export const authedProcedure = t.procedure.use(function isAuthed(opts) {
  // Get the user from the session
  const session = opts.ctx.session;

  // Verify the session exists and has a user
  if (!session || !session.user || !session.user.name) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in as an admin to access this resource',
    });
  }

  // Continue with the authenticated user in context
  return opts.next({
    ctx: {
      // Add the verified user to the context
      user: session.user,
      // Keep the original session
      session,
    },
  });
});
