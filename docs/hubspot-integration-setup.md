# HubSpot Integration Setup Guide

This guide covers the complete setup and configuration of HubSpot CRM integration with AgenticVoice.

## Overview

The HubSpot integration provides:
- ✅ Automatic contact synchronization on user registration
- ✅ Event tracking for user actions and feature usage  
- ✅ Lead scoring based on platform engagement
- ✅ Marketing automation workflows
- ✅ Analytics dashboard integration
- ✅ Cross-platform user management

## Prerequisites

1. **HubSpot Account**: Professional or Enterprise tier required for API access
2. **HubSpot API Token**: Private app access token with required scopes
3. **MongoDB Connection**: For user data synchronization
4. **Next.js Environment**: App Router with TypeScript support

## Environment Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# HubSpot Configuration
HUBSPOT_TOKEN=your_hubspot_private_app_token
HUBSPOT_PORTAL_ID=your_hubspot_portal_id

# Existing variables (ensure these are set)
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. HubSpot Private App Setup

1. Navigate to HubSpot Settings → Integrations → Private Apps
2. Create a new private app with these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `oauth`
   - `timeline`
   - `content`
3. Copy the access token to your environment variables

### 3. Custom Properties (Optional)

Create these custom properties in HubSpot for enhanced tracking:

**Contact Properties:**
- `user_role` (Single-line text)
- `signup_date` (Date picker)
- `last_login_date` (Date picker) 
- `login_count` (Number)
- `feature_usage_score` (Number)
- `engagement_score` (Number)
- `account_status` (Dropdown: Active, Suspended, Inactive)
- `industry_type` (Dropdown: Your industry options)

## API Endpoints

### Admin HubSpot Endpoints

#### `POST /api/admin/hubspot/sync-contact`
Sync a user to HubSpot contact

**Request Body:**
```json
{
  "userId": "mongodb_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "hubspotContactId": "12345",
  "message": "Contact synced successfully"
}
```

#### `POST /api/admin/hubspot/track-event`
Track custom user events

**Request Body:**
```json
{
  "eventName": "feature_usage",
  "email": "user@example.com",
  "properties": {
    "feature_name": "voice_assistant",
    "usage_count": 5
  }
}
```

#### `GET /api/admin/hubspot/analytics?email=user@example.com`
Get HubSpot analytics for a user

**Response:**
```json
{
  "contact": {
    "id": "12345",
    "email": "user@example.com",
    "lifecycle_stage": "customer"
  },
  "engagement": {
    "email_opens": 15,
    "page_views": 45,
    "form_submissions": 3
  },
  "lead_score": 85
}
```

## User Registration Integration

The registration API (`/api/auth/register`) automatically:

1. **Creates User in MongoDB**
   ```typescript
   const newUser = {
     email,
     password: hashedPassword,
     firstName,
     lastName,
     industryType,
     role: 'FREE',
     hasAccess: false,
     createdAt: new Date(),
     lastLoginAt: new Date(),
     loginCount: 1
   };
   ```

2. **Syncs to HubSpot Contact**
   ```typescript
   const hubspotContactId = await hubspotService.syncUserToContact(newUser);
   ```

3. **Tracks Registration Event**
   ```typescript
   await hubspotService.trackEvent({
     eventName: 'user_registration',
     email: newUser.email,
     properties: {
       source: 'AgenticVoice Platform',
       industry_type: newUser.industryType,
       user_role: newUser.role
     }
   });
   ```

## Admin Dashboard Integration

### User Details Modal

The enhanced `UserDetailsModal` component includes:

**HubSpot Sync Actions:**
- Manual contact sync button
- Event tracking buttons
- Analytics toggle

**Event Tracking Options:**
- Profile view tracking
- Admin action tracking  
- Engagement check tracking

**Analytics Display:**
- Contact information
- Engagement metrics
- Lead scoring data
- Activity timeline

### Usage Example

```tsx
// Manual HubSpot sync
const handleHubSpotSync = async () => {
  const response = await fetch('/api/admin/hubspot/sync-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id }),
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('Synced:', data.hubspotContactId);
  }
};

// Track custom event
const handleTrackEvent = async () => {
  await fetch('/api/admin/hubspot/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'profile_viewed',
      email: user.email,
      properties: { source: 'admin_dashboard' }
    }),
  });
};
```

## Automatic Event Hooks

### Registration Hook
```typescript
import { trackUserRegistration } from '@/libs/hubspot-hooks';

// In registration API
await trackUserRegistration(newUser);
```

### Login Hook
```typescript
import { trackUserLogin } from '@/libs/hubspot-hooks';

// In authentication flow
await trackUserLogin(user);
```

### Subscription Change Hook
```typescript
import { trackSubscriptionChange } from '@/libs/hubspot-hooks';

// When user upgrades/downgrades
await trackSubscriptionChange(user, oldRole, newRole);
```

## Lead Scoring Logic

Automatic lead scoring based on:

- **Login Count**: +20 points (> 10 logins)
- **Access Status**: +30 points (has access)
- **Subscription**: +25 points (paid role)
- **Recent Activity**: +15 points (< 7 days)

**Maximum Score**: 100 points

## Marketing Automation

### Workflow Triggers

Set up HubSpot workflows based on:

1. **Contact Properties**:
   - `user_role` changes
   - `engagement_score` thresholds
   - `last_login_date` activity

2. **Custom Events**:
   - `user_registration`
   - `subscription_change`
   - `feature_usage`

### Example Workflow

**Trigger**: Contact property `user_role` = "PREMIUM"
**Actions**:
1. Add to "Premium Users" list
2. Send welcome email sequence
3. Assign to sales team
4. Update lifecycle stage to "Customer"

## Analytics & Reporting

### HubSpot Analytics Dashboard

The `HubSpotAnalyticsDashboard` component displays:

- Contact engagement metrics
- Lead scoring progression
- Event tracking history
- Lifecycle stage changes
- Form submission data

### Custom Reports

Create HubSpot reports for:

1. **User Acquisition**:
   - Registration source analysis
   - Industry breakdown
   - Conversion funnel

2. **Engagement Metrics**:
   - Feature usage trends
   - Login frequency analysis
   - Churn prediction scores

3. **Revenue Attribution**:
   - Subscription upgrade paths
   - Marketing ROI analysis
   - Customer lifetime value

## Troubleshooting

### Common Issues

**1. API Token Invalid**
```
Error: Unauthorized (401)
```
- Verify HubSpot private app token
- Check token scopes and permissions
- Regenerate token if needed

**2. Contact Sync Failures**
```
Error: Contact already exists
```
- Enable merge duplicate contacts
- Update existing contact instead of creating

**3. Event Tracking Issues**
```
Error: Invalid event properties
```
- Verify property types in HubSpot
- Check custom property permissions

### Debug Mode

Enable debug logging:
```typescript
// In hubspot.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('HubSpot API Request:', data);
}
```

## Security Considerations

### Access Control

- API endpoints protected by role-based authentication
- Only ADMIN, GOD_MODE, and MARKETING roles can access HubSpot features
- User data encryption in transit and at rest

### Data Privacy

- GDPR/CCPA compliance for contact data
- User consent for tracking and marketing
- Data retention policies aligned with privacy laws

### API Security

- Rate limiting for HubSpot API calls
- Error handling to prevent data exposure
- Audit logging for compliance tracking

## Performance Optimization

### Rate Limiting

```typescript
// Batch operations with delays
for (const user of users) {
  await syncUser(user);
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### Caching

```typescript
// Cache contact lookups
const contactCache = new Map();

async function getCachedContact(email: string) {
  if (contactCache.has(email)) {
    return contactCache.get(email);
  }
  
  const contact = await hubspotService.findContactByEmail(email);
  contactCache.set(email, contact);
  return contact;
}
```

### Background Processing

```typescript
// Queue HubSpot operations
const hubspotQueue = [];

setInterval(() => {
  if (hubspotQueue.length > 0) {
    const operation = hubspotQueue.shift();
    operation.execute();
  }
}, 1000);
```

## Next Steps

1. **Test Integration**: Verify all endpoints and UI components
2. **Configure Workflows**: Set up HubSpot marketing automation
3. **Monitor Performance**: Track API usage and response times
4. **Optimize Scoring**: Refine lead scoring algorithms
5. **Expand Tracking**: Add more granular event tracking

For support or questions, refer to the HubSpot API documentation or contact the development team.
