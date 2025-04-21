'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isAuthenticated = status === 'authenticated';

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/admin/login',
      redirect: true,
    });
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <Link href="/admin">Tienen Kiest</Link>
        </h1>

        <div className="flex items-center gap-4">
          {isAuthenticated && !isLoginPage && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Ingelogd als {session.user?.name || 'Administrator'}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Uitloggen
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
