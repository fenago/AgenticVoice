import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";
import { UserRole, IndustryType, AccountStatus } from "@/types/auth";

// Define the TypeScript interface for the User document
export interface IUser extends mongoose.Document {
  name?: string;
  email: string;
  image?: string;
  role: UserRole;
  industryType: IndustryType;
  accountStatus: AccountStatus;
  company?: {
    name?: string;
    size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
    website?: string;
  };
  phone?: string;
  timezone?: string;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  customerId?: string;
  priceId?: string;
  vapiUserId?: string;
  vapiAssistantId?: string;
  hubspotContactId?: string;
  hubspotDealId?: string;
  hasAccess: boolean;
  vapi?: {
    publicKey?: string;
    privateKey?: string;
    assistants?: mongoose.Schema.Types.ObjectId[];
    phoneNumbers?: string[];
    usage?: {
      monthlyMinutes?: number;
      totalCalls?: number;
      lastResetDate?: Date;
    };
  };
  lastLoginAt?: Date;
  loginCount?: number;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    // User role - determines access level and features available
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FREE,
    },
    // Industry type for specialized features and UI
    industryType: {
      type: String,
      enum: Object.values(IndustryType),
      default: IndustryType.OTHER,
    },
    // Account status for admin management
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },
    // Company/Organization details
    company: {
      name: String,
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'],
      },
      website: String,
    },
    // Contact information
    phone: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
    // Preferences
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // VAPI integration fields
    vapiUserId: {
      type: String,
      description: 'VAPI user ID for voice AI platform integration (legacy)',
    },
    vapiAssistantId: {
      type: String,
      description: 'VAPI assistant ID for voice AI platform integration',
    },
    // HubSpot integration field
    hubspotContactId: {
      type: String,
      description: 'HubSpot contact ID for CRM integration and tracking',
    },
    // HubSpot deal ID for tracking subscriptions as deals
    hubspotDealId: {
      type: String,
      description: 'HubSpot deal ID for tracking the user\'s subscription deal',
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Vapi.ai related configuration
    vapi: {
      publicKey: String,
      privateKey: String,
      assistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VapiAssistant' }],
      phoneNumbers: [String],
      usage: {
        monthlyMinutes: { type: Number, default: 0 },
        totalCalls: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
      },
    },
    // Admin and audit fields
    lastLoginAt: Date,
    loginCount: { type: Number, default: 0 },
    isEmailVerified: { type: Boolean, default: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
    notes: String, // Admin notes
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema, "av_users");
