import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

export enum AssistantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

export enum AssistantType {
  MEDICAL_SCHEDULER = 'MEDICAL_SCHEDULER',
  LEGAL_INTAKE = 'LEGAL_INTAKE', 
  SALES_OUTREACH = 'SALES_OUTREACH',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  CUSTOM = 'CUSTOM'
}

// VAPI ASSISTANT SCHEMA
const vapiAssistantSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AssistantType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AssistantStatus),
      default: AssistantStatus.DRAFT,
    },
    
    // Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Vapi.ai Configuration
    vapiId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    
    // Assistant Configuration
    config: {
      // Voice Settings
      voice: {
        provider: String,
        voiceId: String,
        speed: { type: Number, default: 1.0 },
        pitch: { type: Number, default: 1.0 },
      },
      
      // LLM Settings
      llm: {
        provider: String,
        model: String,
        temperature: { type: Number, default: 0.7 },
        maxTokens: { type: Number, default: 150 },
        systemPrompt: String,
      },
      
      // Transcription Settings
      transcriber: {
        provider: String,
        model: String,
        language: { type: String, default: 'en' },
      },
      
      // Phone Settings
      phoneNumberId: String,
      
      // Workflow Integration
      n8nWorkflowId: String,
      webhookUrl: String,
      
      // Industry-specific settings
      industryConfig: {
        hipaaCompliant: { type: Boolean, default: false },
        recordingEnabled: { type: Boolean, default: true },
        transcriptionEnabled: { type: Boolean, default: true },
        customFields: mongoose.Schema.Types.Mixed,
      },
    },
    
    // Performance Metrics
    metrics: {
      totalCalls: { type: Number, default: 0 },
      totalMinutes: { type: Number, default: 0 },
      successfulCalls: { type: Number, default: 0 },
      averageCallDuration: { type: Number, default: 0 },
      lastCallAt: Date,
      monthlyUsage: {
        calls: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        resetDate: { type: Date, default: Date.now },
      },
    },
    
    // Tags and Organization
    tags: [String],
    category: String,
    
    // Audit Trail
    isActive: { type: Boolean, default: true },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for performance
vapiAssistantSchema.index({ userId: 1, status: 1 });
vapiAssistantSchema.index({ vapiId: 1 });
vapiAssistantSchema.index({ type: 1, status: 1 });

// Add plugin that converts mongoose to json
vapiAssistantSchema.plugin(toJSON);

export default mongoose.models.VapiAssistant || mongoose.model("VapiAssistant", vapiAssistantSchema, "av_vapi_assistants");
