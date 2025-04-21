'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect if already on login page
  const shouldRedirect = status === 'unauthenticated' && pathname !== '/admin/login';

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/admin/login');
    }
  }, [shouldRedirect, router]);

  // While loading, show a loading spinner
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated or on the login page, render children
  if (status === 'authenticated' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Return null while redirecting or in an invalid state
  return null;
}
