'use client';

// ^-- to make sure we can mount the Provider from a server component
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();
let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {
  if (typeof window === 'undefined') {
    // SSR should use relative url
    return '/api/trpc';
  }
  // browser should use relative url
  return '/api/trpc';
}

function getWebSocketUrl() {
  // On the client, always connect to the local WebSocket server
  return 'ws://localhost:3001';
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => {
    // Don't create a WebSocket connection on the server
    if (typeof window === 'undefined') {
      return trpc.createClient({
        links: [
          httpBatchLink({
            transformer: superjson,
            url: getUrl(),
          }),
        ],
      });
    }

    // Create WebSocket client
    const wsClient = createWSClient({
      url: getWebSocketUrl(),
    });

    return trpc.createClient({
      links: [
        // Use splitLink to route requests - subscriptions over WebSocket, all else over HTTP
        splitLink({
          condition(op) {
            // Check if the operation is a subscription
            return op.type === 'subscription';
          },
          // When condition is true, use WebSocket
          true: wsLink({
            client: wsClient,
            transformer: superjson,
          }),
          // When condition is false, use HTTP
          false: httpBatchLink({
            transformer: superjson,
            url: getUrl(),
          }),
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </trpc.Provider>
  );
}
