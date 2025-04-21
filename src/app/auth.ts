// This is a placeholder file to ensure NextAuth doesn't have initialization issues
// You can expand this with actual authentication logic if needed later
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Check if environment variables are set
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
          throw new Error('Admin credentials not configured in environment variables');
        }

        // Check the credentials against environment variables
        if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
          // Return a user object if credentials match
          return {
            id: '1',
            name: 'Administrator',
            email: 'admin@tienenkiest.local',
          };
        }

        // Return null if credentials don't match
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user as User;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user as User;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
