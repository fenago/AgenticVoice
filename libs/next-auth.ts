import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/libs/mongo";
import connectMongo from "@/libs/mongoose";
import config from "@/config";
import User from "@/models/User";
import { UserRole, IndustryType, AccountStatus } from "@/types/auth";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter: any;
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: config.resend.fromNoReply,
    }),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Accounts: "av_accounts",
      Sessions: "av_sessions", 
      Users: "av_users",
      VerificationTokens: "av_verification_tokens"
    }
  }),

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Ensure mongoose connection is established
        await connectMongo();
        
        // Update user login tracking
        await User.findOneAndUpdate(
          { email: user.email },
          { 
            lastLoginAt: new Date(),
            $inc: { loginCount: 1 }
          }
        );
      } catch (error) {
        console.error('Error updating user login info:', error);
      }
      return true;
    },
    
    async session({ session, token, user }) {
      if (session?.user) {
        try {
          // Ensure mongoose connection is established
          await connectMongo();
          
          // Fetch full user data from database
          const dbUser = await User.findOne({ email: session.user.email }).lean();
          
          if (dbUser) {
            session.user = {
              ...session.user,
              id: (dbUser as any)._id.toString(),
              role: (dbUser as any).role || UserRole.FREE,
              industryType: (dbUser as any).industryType || IndustryType.OTHER,
              accountStatus: (dbUser as any).accountStatus || AccountStatus.ACTIVE,
              hasAccess: (dbUser as any).hasAccess || false,
              customerId: (dbUser as any).customerId,
              priceId: (dbUser as any).priceId,
              company: (dbUser as any).company,
              preferences: (dbUser as any).preferences,
              isEmailVerified: (dbUser as any).isEmailVerified || false,
              isTwoFactorEnabled: (dbUser as any).isTwoFactorEnabled || false,
            };
          }
        } catch (error) {
          console.error('Error fetching user session data:', error);
        }
      } else if (session?.user) {
        // Fallback for when no database connection
        session.user.id = token.sub;
      }
      
      return session;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        try {
          // Import the cross-platform sync service
          const { UserSyncService } = await import('@/app/admin/services/userSyncService');
          
          // Set default industry type based on email domain heuristics
          let industryType = IndustryType.OTHER;
          const emailDomain = user.email?.split('@')[1]?.toLowerCase();
          
          if (emailDomain?.includes('medical') || emailDomain?.includes('hospital') || emailDomain?.includes('clinic')) {
            industryType = IndustryType.MEDICAL;
          } else if (emailDomain?.includes('law') || emailDomain?.includes('legal') || emailDomain?.includes('attorney')) {
            industryType = IndustryType.LEGAL;
          } else if (emailDomain?.includes('sales') || emailDomain?.includes('marketing')) {
            industryType = IndustryType.SALES;
          }
          
          // 🚀 ENHANCED: Cross-platform user registration
          const registrationResult = await UserSyncService.registerUserAcrossPlatforms({
            email: user.email!,
            name: user.name || '',
            image: user.image,
            provider: account?.provider || 'unknown',
            role: UserRole.FREE, // Default all new users to FREE role
            industryType,
          });

          if (!registrationResult.success) {
            console.error('Cross-platform user registration had errors:', registrationResult.errors);
            // Still allow sign-in even if some platforms failed
          } else {
            console.log('✅ User successfully registered across platforms:', {
              mongoUserId: registrationResult.mongoUserId,
              customerId: registrationResult.customerId,
            });
          }
        } catch (error) {
          console.error('❌ Error in cross-platform user registration:', error);
          // Fallback to basic MongoDB registration if sync service fails
          try {
            await connectMongo();
            await User.findOneAndUpdate(
              { email: user.email },
              {
                role: UserRole.FREE,
                industryType: IndustryType.OTHER,
                accountStatus: AccountStatus.ACTIVE,
                isEmailVerified: account?.provider === 'google',
                loginCount: 1,
                lastLoginAt: new Date(),
                hasAccess: false,
                subscriptionTier: 'FREE',
              },
              { upsert: true }
            );
          } catch (fallbackError) {
            console.error('❌ Fallback user registration also failed:', fallbackError);
          }
        }
      }
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `/icon.png`, // Using the icon from the app root
  },
};

export default NextAuth(authOptions);
