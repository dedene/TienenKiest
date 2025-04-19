'use client';

import { TRPCProviders } from '@/trpc/client';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <TRPCProviders>{children}</TRPCProviders>
    </SessionProvider>
  );
}
