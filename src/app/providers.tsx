'use client';

import { TRPCProvider } from '@/trpc/client';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <TRPCProvider>{children}</TRPCProvider>
    </SessionProvider>
  );
}
