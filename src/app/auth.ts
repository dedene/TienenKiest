// This is a placeholder file to ensure NextAuth doesn't have initialization issues
// You can expand this with actual authentication logic if needed later
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      authorize() {
        return null;
      },
    }),
  ],
  pages: {
    error: '/',
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
