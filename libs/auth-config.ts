import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/libs/mongo';
import { UserRole, AccountStatus } from '@/types/auth';
import { Adapter } from 'next-auth/adapters';
import User from '@/models/User';
import connectMongo from '@/libs/mongoose';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
        async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accountStatus = token.accountStatus as AccountStatus;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          // Ensure mongoose is connected before querying
          await connectMongo();
          
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role as UserRole;
            token.accountStatus = dbUser.accountStatus as AccountStatus;
          } else {
            // Handle case where user is not in DB, assign default role
            token.role = UserRole.FREE;
            token.accountStatus = AccountStatus.ACTIVE;
          }
        } catch (error) {
          console.error('Error in JWT callback:', error);
          // Fallback to default values if database query fails
          token.role = UserRole.FREE;
          token.accountStatus = AccountStatus.ACTIVE;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAuthSession = () => getServerSession(authOptions);
