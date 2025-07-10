import { DefaultSession } from "next-auth";
import { UserRole, IndustryType, AccountStatus } from "./auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      industryType: IndustryType;
      accountStatus: AccountStatus;
      hasAccess: boolean;
      customerId?: string;
      priceId?: string;
      company?: {
        name: string;
        website?: string;
        size?: string;
        industry?: string;
      };
      preferences?: {
        theme: string;
        language: string;
        timezone: string;
        notifications: {
          email: boolean;
          sms: boolean;
          inApp: boolean;
        };
        privacy: {
          shareUsageData: boolean;
          allowMarketing: boolean;
        };
      };
      isEmailVerified: boolean;
      isTwoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    industryType: IndustryType;
    accountStatus: AccountStatus;
    hasAccess: boolean;
    customerId?: string;
    priceId?: string;
    company?: {
      name: string;
      website?: string;
      size?: string;
      industry?: string;
    };
    preferences?: {
      theme: string;
      language: string;
      timezone: string;
      notifications: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
      };
      privacy: {
        shareUsageData: boolean;
        allowMarketing: boolean;
      };
    };
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
  }
}
