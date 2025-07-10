import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

export enum CallStatus {
  INITIATED = 'INITIATED',
  CONNECTED = 'CONNECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  NO_ANSWER = 'NO_ANSWER',
  BUSY = 'BUSY'
}

export enum CallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum CallType {
  PHONE = 'PHONE',
  WEB = 'WEB'
}

// CALL RECORD SCHEMA
const callRecordSchema = new mongoose.Schema(
  {
    // Basic Call Information
    vapiCallId: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Assistant and User References
    assistantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VapiAssistant',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Call Details
    direction: {
      type: String,
      enum: Object.values(CallDirection),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(CallType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CallStatus),
      default: CallStatus.INITIATED,
    },
    
    // Phone Numbers
    fromNumber: String,
    toNumber: String,
    
    // Timing
    startedAt: Date,
    answeredAt: Date,
    endedAt: Date,
    duration: { // in seconds
      type: Number,
      default: 0,
    },
    
    // Call Quality and Performance
    quality: {
      audioQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      latency: Number, // in milliseconds
      packetsLost: Number,
      jitter: Number,
    },
    
    // Transcription and Analysis
    transcription: {
      text: String,
      confidence: Number,
      language: String,
      segments: [{
        speaker: { type: String, enum: ['user', 'assistant'] },
        text: String,
        startTime: Number,
        endTime: Number,
        confidence: Number,
      }],
    },
    
    // Analysis Results
    analysis: {
      sentiment: {
        overall: { type: String, enum: ['positive', 'negative', 'neutral'] },
        score: Number, // -1 to 1
      },
      keywords: [String],
      intent: String,
      outcome: {
        type: String,
        enum: ['successful', 'partial', 'failed', 'transferred'],
      },
      customMetrics: mongoose.Schema.Types.Mixed,
    },
    
    // Integration Data
    integration: {
      n8nWorkflowExecuted: Boolean,
      webhooksCalled: [String],
      externalSystemUpdated: Boolean,
      metadata: mongoose.Schema.Types.Mixed,
    },
    
    // Compliance and Privacy
    compliance: {
      isHipaaCall: { type: Boolean, default: false },
      consentGiven: Boolean,
      recordingEnabled: { type: Boolean, default: true },
      dataRetentionDate: Date,
      anonymized: { type: Boolean, default: false },
    },
    
    // Cost and Billing
    cost: {
      voiceMinutes: Number,
      llmTokens: Number,
      transcriptionMinutes: Number,
      totalCost: Number, // in cents
      currency: { type: String, default: 'USD' },
    },
    
    // File References
    files: {
      recording: String, // URL or file path
      transcriptionFile: String,
      summaryFile: String,
    },
    
    // Error Information
    error: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
    },
    
    // Additional Context
    customerInfo: {
      name: String,
      email: String,
      phone: String,
      metadata: mongoose.Schema.Types.Mixed,
    },
    
    // Tags and Notes
    tags: [String],
    notes: String,
    
    // Review and Follow-up
    requiresReview: { type: Boolean, default: false },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    followUpRequired: Boolean,
    followUpDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for call duration in minutes
callRecordSchema.virtual('durationMinutes').get(function() {
  return this.duration ? Math.round(this.duration / 60 * 100) / 100 : 0;
});

// Indexes for performance
callRecordSchema.index({ vapiCallId: 1 });
callRecordSchema.index({ userId: 1, createdAt: -1 });
callRecordSchema.index({ assistantId: 1, createdAt: -1 });
callRecordSchema.index({ status: 1, createdAt: -1 });
callRecordSchema.index({ direction: 1, type: 1 });
callRecordSchema.index({ 'compliance.isHipaaCall': 1 });
callRecordSchema.index({ requiresReview: 1 });
callRecordSchema.index({ followUpRequired: 1, followUpDate: 1 });

// TTL index for data retention compliance
callRecordSchema.index({ 'compliance.dataRetentionDate': 1 }, { expireAfterSeconds: 0 });

// Add plugin that converts mongoose to json
callRecordSchema.plugin(toJSON);

export default mongoose.models.CallRecord || mongoose.model("CallRecord", callRecordSchema, "av_call_records");
