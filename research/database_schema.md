# AgenticVoice.net Database Schema Documentation

## Overview
This document outlines all MongoDB collections used by the AgenticVoice.net application. All collections use the `av_` prefix to avoid conflicts with other applications sharing the same database.

## Database Configuration
- **Database:** MongoDB (shared with other applications)
- **Collection Prefix:** `av_` (AgenticVoice prefix)
- **Connection:** See `.env` file for MongoDB URI

## Collections

### 1. av_users
**Purpose:** Store user account information, authentication data, and user preferences

**Model File:** `/models/User.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String - User's full name
- `email`: String (Unique, Required) - User's email address
- `image`: String - Profile image URL
- `role`: Enum - User role (FREE, ESSENTIAL, PRO, ENTERPRISE, ADMIN, SUPER_ADMIN, GOD_MODE)
- `industryType`: Enum - Industry (MEDICAL, LEGAL, SALES, OTHER)
- `accountStatus`: Enum - Account status (ACTIVE, SUSPENDED, PENDING)
- `hasAccess`: Boolean - Whether user has platform access
- `customerId`: String - Stripe customer ID
- `priceId`: String - Stripe price/subscription ID
- `company`: String - Company name
- `preferences`: Object - User preferences and settings
- `isEmailVerified`: Boolean - Email verification status
- `isTwoFactorEnabled`: Boolean - 2FA status
- `lastLoginAt`: Date - Last login timestamp
- `loginCount`: Number - Total login count
- `createdAt`: Date - Account creation date
- `updatedAt`: Date - Last update timestamp

**Indexes:**
- `email` (unique)
- `customerId`
- `role`
- `industryType`

---

### 2. av_vapi_assistants
**Purpose:** Store Vapi.ai voice assistant configurations and settings

**Model File:** `/models/VapiAssistant.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Reference to av_users) - Owner of the assistant
- `name`: String (Required) - Assistant name
- `description`: String - Assistant description
- `vapiId`: String - Vapi.ai assistant ID
- `status`: Enum - Assistant status (ACTIVE, INACTIVE, TRAINING, ERROR)
- `industry`: Enum - Target industry (MEDICAL, LEGAL, SALES, GENERAL)
- `voice`: Object - Voice configuration
  - `provider`: String - Voice provider
  - `voiceId`: String - Voice ID
  - `speed`: Number - Speaking speed
  - `pitch`: Number - Voice pitch
- `model`: Object - AI model configuration
  - `provider`: String - AI provider
  - `model`: String - Model name
  - `temperature`: Number - Model temperature
  - `maxTokens`: Number - Max tokens
  - `systemPrompt`: String - System prompt
- `transcriber`: Object - Transcription settings
  - `provider`: String - Transcription provider
  - `model`: String - Transcription model
  - `language`: String - Language code
- `functions`: Array - Available functions/tools
- `serverUrl`: String - Webhook server URL
- `serverUrlSecret`: String - Webhook secret
- `endCallFunctionEnabled`: Boolean - End call function enabled
- `dialKeypadFunctionEnabled`: Boolean - Dial keypad function enabled
- `fillersEnabled`: Boolean - Filler words enabled
- `silenceTimeoutSeconds`: Number - Silence timeout
- `maxDurationSeconds`: Number - Maximum call duration
- `backgroundSound`: String - Background sound URL
- `backchannelingEnabled`: Boolean - Backchanneling enabled
- `backgroundDenoisingEnabled`: Boolean - Background denoising
- `modelOutputInMessagesEnabled`: Boolean - Model output in messages
- `transportConfigurations`: Array - Transport configurations
- `name`: String - Configuration name
- `provider`: String - Transport provider
- `timeout`: Number - Transport timeout
- `record`: Boolean - Recording enabled
- `recordingChannels`: String - Recording channels
- `hipaaEnabled`: Boolean - HIPAA compliance mode
- `analysisEnabled`: Boolean - Call analysis enabled
- `artifactPlan`: Object - Artifact generation plan
- `messagePlan`: Object - Message handling plan
- `startSpeakingPlan`: Object - Speaking start plan
- `stopSpeakingPlan`: Object - Speaking stop plan
- `monitorPlan`: Object - Monitoring plan
- `metadata`: Object - Additional metadata
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last update timestamp

**Indexes:**
- `userId`
- `vapiId` (unique)
- `status`
- `industry`

---

### 3. av_call_records
**Purpose:** Store detailed call logs, transcriptions, and analytics

**Model File:** `/models/CallRecord.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Reference to av_users) - Call owner
- `assistantId`: ObjectId (Reference to av_vapi_assistants) - Assistant used
- `vapiCallId`: String - Vapi.ai call ID
- `phoneNumber`: String - Called phone number
- `direction`: Enum - Call direction (INBOUND, OUTBOUND)
- `status`: Enum - Call status (QUEUED, RINGING, IN_PROGRESS, FORWARDING, ENDED)
- `endedReason`: String - Reason call ended
- `startedAt`: Date - Call start time
- `endedAt`: Date - Call end time
- `duration`: Number - Call duration in seconds
- `cost`: Number - Call cost
- `messages`: Array - Call messages/transcript
  - `role`: String - Message role (user, assistant, system)
  - `message`: String - Message content
  - `time`: Number - Message timestamp
  - `endTime`: Number - Message end time
  - `secondsFromStart`: Number - Seconds from call start
- `recordingUrl`: String - Call recording URL
- `summary`: String - Call summary
- `transcript`: String - Full call transcript
- `analysis`: Object - Call analysis data
  - `sentiment`: String - Overall sentiment
  - `topics`: Array - Discussed topics
  - `keywords`: Array - Key phrases
  - `actionItems`: Array - Action items identified
  - `followUpRequired`: Boolean - Follow-up needed
- `metadata`: Object - Additional call metadata
- `hipaaCompliant`: Boolean - HIPAA compliance flag
- `createdAt`: Date - Record creation time
- `updatedAt`: Date - Last update time

**Indexes:**
- `userId`
- `assistantId`
- `vapiCallId` (unique)
- `phoneNumber`
- `status`
- `startedAt`

---

### 4. av_audit_logs
**Purpose:** Track all user actions and system events for security and compliance

**Model File:** `/models/AuditLog.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Reference to av_users) - User who performed action
- `action`: String (Required) - Action performed
- `resource`: String - Resource affected
- `resourceId`: String - ID of affected resource
- `details`: Object - Additional action details
- `ipAddress`: String - User's IP address
- `userAgent`: String - User's browser/client info
- `location`: Object - Geographic location
  - `country`: String - Country code
  - `region`: String - Region/state
  - `city`: String - City name
- `severity`: Enum - Log severity (LOW, MEDIUM, HIGH, CRITICAL)
- `category`: Enum - Action category (AUTH, USER_MGMT, ASSISTANT, CALL, BILLING, SYSTEM, SECURITY)
- `status`: Enum - Action status (SUCCESS, FAILURE, WARNING)
- `sessionId`: String - User session ID
- `correlationId`: String - Request correlation ID
- `metadata`: Object - Additional metadata
- `hipaaRelevant`: Boolean - HIPAA relevant action
- `timestamp`: Date - When action occurred
- `createdAt`: Date - Log creation time

**Indexes:**
- `userId`
- `action`
- `resource`
- `timestamp`
- `severity`
- `category`

---

### 5. av_demo_requests
**Purpose:** Store demo requests from potential customers

**Model File:** `/models/DemoRequest.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String (Required) - Requester's name
- `email`: String (Required) - Contact email
- `company`: String - Company name
- `role`: String - Job title/role
- `phone`: String - Phone number
- `industry`: Enum - Industry type (MEDICAL, LEGAL, SALES, OTHER)
- `companySize`: Enum - Company size (1-10, 11-50, 51-200, 201-1000, 1000+)
- `useCase`: String - Intended use case
- `currentSolution`: String - Current solution used
- `timeline`: String - Implementation timeline
- `budget`: String - Budget range
- `additionalInfo`: String - Additional information
- `status`: Enum - Request status (NEW, CONTACTED, SCHEDULED, COMPLETED, DECLINED)
- `assignedTo`: ObjectId (Reference to av_users) - Assigned sales rep
- `notes`: Array - Internal notes
  - `note`: String - Note content
  - `addedBy`: ObjectId - Who added the note
  - `addedAt`: Date - When note was added
- `scheduledAt`: Date - Demo scheduled time
- `completedAt`: Date - Demo completion time
- `source`: String - Lead source
- `utmSource`: String - UTM source
- `utmMedium`: String - UTM medium
- `utmCampaign`: String - UTM campaign
- `createdAt`: Date - Request creation time
- `updatedAt`: Date - Last update time

**Indexes:**
- `email`
- `status`
- `industry`
- `assignedTo`
- `createdAt`

---

### 6. av_leads
**Purpose:** Store lead information and tracking data

**Model File:** `/models/Lead.ts`

**Schema Fields:**
- `_id`: ObjectId (Primary Key)
- `email`: String (Required, Unique) - Lead email
- `firstName`: String - First name
- `lastName`: String - Last name
- `company`: String - Company name
- `industry`: String - Industry type
- `source`: String - Lead source
- `status`: Enum - Lead status (NEW, QUALIFIED, CONVERTED, LOST)
- `score`: Number - Lead score
- `notes`: String - Additional notes
- `tags`: Array - Lead tags
- `lastContactedAt`: Date - Last contact date
- `createdAt`: Date - Lead creation time
- `updatedAt`: Date - Last update time

**Indexes:**
- `email` (unique)
- `status`
- `industry`
- `source`

---

## NextAuth Collections

The following collections are automatically created by NextAuth.js:

### av_accounts
**Purpose:** Store OAuth account connections (Google, etc.)
- Managed by NextAuth.js
- Links external accounts to users

### av_sessions
**Purpose:** Store user session data
- Managed by NextAuth.js
- Session tokens and expiration

### av_verification_tokens
**Purpose:** Store email verification tokens
- Managed by NextAuth.js
- Magic link tokens

---

## Collection Naming Convention

All AgenticVoice collections use the `av_` prefix to ensure:
1. **Namespace Isolation:** Prevent conflicts with other applications
2. **Easy Identification:** Quickly identify AgenticVoice collections
3. **Database Organization:** Keep related collections grouped
4. **Migration Safety:** Safe database operations without affecting other apps

## Database Access Patterns

### High-Frequency Operations
- User authentication lookups (`av_users`)
- Session management (`av_sessions`)
- Call record inserts (`av_call_records`)
- Audit log inserts (`av_audit_logs`)

### Medium-Frequency Operations
- Assistant configuration reads (`av_vapi_assistants`)
- Demo request management (`av_demo_requests`)
- Lead tracking (`av_leads`)

### Low-Frequency Operations
- User management operations
- Bulk data analysis
- Reporting queries

## Security Considerations

1. **HIPAA Compliance:** Medical industry collections include HIPAA flags
2. **Audit Trail:** All significant actions logged in `av_audit_logs`
3. **Data Encryption:** Sensitive fields encrypted at rest
4. **Access Control:** Role-based access enforced at application level
5. **Data Retention:** Automatic cleanup policies for compliance

## Backup and Recovery

- **Primary Backup:** MongoDB Atlas automated backups
- **Collection Priority:** Critical data in `av_users`, `av_call_records`, `av_audit_logs`
- **Recovery Time:** Target RTO < 4 hours for critical collections

## Monitoring

- **Performance Metrics:** Track query performance for frequently accessed collections
- **Growth Tracking:** Monitor collection size growth, especially `av_call_records` and `av_audit_logs`
- **Index Optimization:** Regular index analysis and optimization

---

*Last Updated: 2025-05-28*
*Version: 1.0*
