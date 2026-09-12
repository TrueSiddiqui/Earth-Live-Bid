import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isVerified } from '@/lib/verification';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).trim().toLowerCase() },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          tier: user.tier,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tier = (user as any).tier;
        token.status = (user as any).status;
      }
      // Refresh user data on each token refresh
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, include: { application: true } });
          if (dbUser) {
            token.role = dbUser.role;
            token.tier = dbUser.tier;
            token.status = dbUser.status === 'approved' && !isVerified(dbUser.application) ? 'pending' : dbUser.status;
            token.name = dbUser.fullName;
          } else {
            token.role = 'member'; token.status = 'pending'; token.id = '';
          }
        } catch (error) {
          console.error('Membership refresh failed', error);
          token.role = 'member'; token.status = 'pending';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tier = token.tier;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
});
