import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

export enum ActionType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  
  ASSISTANT_CREATED = 'ASSISTANT_CREATED',
  ASSISTANT_UPDATED = 'ASSISTANT_UPDATED',
  ASSISTANT_DELETED = 'ASSISTANT_DELETED',
  ASSISTANT_ACTIVATED = 'ASSISTANT_ACTIVATED',
  ASSISTANT_DEACTIVATED = 'ASSISTANT_DEACTIVATED',
  
  CALL_INITIATED = 'CALL_INITIATED',
  CALL_COMPLETED = 'CALL_COMPLETED',
  CALL_FAILED = 'CALL_FAILED',
  
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  
  ADMIN_ACTION = 'ADMIN_ACTION',
  SECURITY_EVENT = 'SECURITY_EVENT',
  DATA_ACCESS = 'DATA_ACCESS',
  
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  INTEGRATION_EVENT = 'INTEGRATION_EVENT',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// AUDIT LOG SCHEMA
const auditLogSchema = new mongoose.Schema(
  {
    // Action Details
    action: {
      type: String,
      enum: Object.values(ActionType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(Severity),
      default: Severity.LOW,
    },
    
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: String,
    userRole: String,
    
    // Target Information (what was acted upon)
    targetType: {
      type: String,
      enum: ['User', 'VapiAssistant', 'Call', 'Subscription', 'System'],
    },
    targetId: mongoose.Schema.Types.ObjectId,
    
    // Event Details
    details: {
      description: String,
      oldValues: mongoose.Schema.Types.Mixed,
      newValues: mongoose.Schema.Types.Mixed,
      metadata: mongoose.Schema.Types.Mixed,
    },
    
    // Request Information
    request: {
      ip: String,
      userAgent: String,
      method: String,
      url: String,
      headers: mongoose.Schema.Types.Mixed,
    },
    
    // Location and Context
    location: {
      country: String,
      region: String,
      city: String,
      timezone: String,
    },
    
    // Success/Failure
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
    
    // Additional Flags
    requiresReview: {
      type: Boolean,
      default: false,
    },
    isHipaaEvent: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for performance and queries
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ requiresReview: 1, createdAt: -1 });
auditLogSchema.index({ isHipaaEvent: 1, createdAt: -1 });
auditLogSchema.index({ 'request.ip': 1, createdAt: -1 });

// TTL index to automatically delete old logs (optional, set to 2 years)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Add plugin that converts mongoose to json
auditLogSchema.plugin(toJSON);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema, "av_audit_logs");
