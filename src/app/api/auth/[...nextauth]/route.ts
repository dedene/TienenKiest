import { authOptions } from '@/app/auth';
import NextAuth from 'next-auth';

// This is a minimal implementation to avoid 404 errors
// You can expand this with proper authentication if needed
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
