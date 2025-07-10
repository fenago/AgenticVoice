/**
 * HubSpot Event Tracking Hooks
 * Automatic event tracking for user actions and system events
 */

import HubSpotService from '@/libs/hubspot';

// Event tracking function for user registration
export async function trackUserRegistration(user: any) {
  try {
    const hubspotService = new HubSpotService();
    
    await hubspotService.trackEvent({
      eventName: 'user_registration',
      email: user.email,
      properties: {
        source: 'AgenticVoice Platform',
        industry_type: user.industryType || 'OTHER',
        user_role: user.role || 'FREE',
        registration_date: new Date().toISOString(),
        signup_source: 'direct_registration'
      }
    });
    
    console.log(`✅ User registration tracked for ${user.email}`);
  } catch (error) {
    console.error('Failed to track user registration:', error);
  }
}

// Event tracking for user login
export async function trackUserLogin(user: any) {
  try {
    const hubspotService = new HubSpotService();
    
    await hubspotService.trackEvent({
      eventName: 'user_login',
      email: user.email,
      properties: {
        login_count: user.loginCount || 1,
        user_role: user.role || 'FREE',
        login_date: new Date().toISOString(),
        has_access: user.hasAccess || false
      }
    });
    
    console.log(`✅ User login tracked for ${user.email}`);
  } catch (error) {
    console.error('Failed to track user login:', error);
  }
}

// Event tracking for subscription changes
export async function trackSubscriptionChange(user: any, oldRole: string, newRole: string) {
  try {
    const hubspotService = new HubSpotService();
    
    await hubspotService.trackEvent({
      eventName: 'subscription_change',
      email: user.email,
      properties: {
        old_role: oldRole,
        new_role: newRole,
        change_date: new Date().toISOString(),
        upgrade: (newRole !== 'FREE' && oldRole === 'FREE').toString()
      }
    });
    
    // Update lead score based on subscription
    if (newRole !== 'FREE') {
      await hubspotService.updateLeadScore(user.email, 75);
    }
    
    console.log(`✅ Subscription change tracked for ${user.email}: ${oldRole} → ${newRole}`);
  } catch (error) {
    console.error('Failed to track subscription change:', error);
  }
}

// Event tracking for feature usage
export async function trackFeatureUsage(user: any, feature: string, usage_data?: any) {
  try {
    const hubspotService = new HubSpotService();
    
    await hubspotService.trackEvent({
      eventName: 'feature_usage',
      email: user.email,
      properties: {
        feature_name: feature,
        usage_date: new Date().toISOString(),
        user_role: user.role || 'FREE',
        ...usage_data
      }
    });
    
    console.log(`✅ Feature usage tracked for ${user.email}: ${feature}`);
  } catch (error) {
    console.error('Failed to track feature usage:', error);
  }
}

// Event tracking for admin actions
export async function trackAdminAction(admin: any, action: string, target_user?: any, metadata?: any) {
  try {
    const hubspotService = new HubSpotService();
    
    await hubspotService.trackEvent({
      eventName: 'admin_action',
      email: admin.email,
      properties: {
        action_type: action,
        target_user_email: target_user?.email || '',
        admin_role: admin.role,
        action_date: new Date().toISOString(),
        ...metadata
      }
    });
    
    console.log(`✅ Admin action tracked: ${admin.email} performed ${action}`);
  } catch (error) {
    console.error('Failed to track admin action:', error);
  }
}

// Batch sync existing users to HubSpot
export async function batchSyncUsersToHubSpot(users: any[]) {
  const hubspotService = new HubSpotService();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const user of users) {
    try {
      const hubspotContactId = await hubspotService.syncUserToContact(user);
      if (hubspotContactId) {
        results.success++;
        console.log(`✅ Synced user ${user.email} to HubSpot`);
      } else {
        results.failed++;
        results.errors.push(`Failed to sync ${user.email}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error syncing ${user.email}: ${error.message}`);
      console.error(`Failed to sync user ${user.email}:`, error);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// Marketing automation triggers
export async function triggerMarketingAutomation(user: any, trigger: string) {
  try {
    const hubspotService = new HubSpotService();
    
    // Find contact first
    const contact = await hubspotService.findContactByEmail(user.email);
    
    if (contact) {
      // Update contact properties to trigger workflows
      await hubspotService.updateContact(contact.id, {
        email: user.email,
        last_activity_date: new Date().toISOString(),
        engagement_trigger: trigger
      });
      
      console.log(`✅ Marketing automation triggered for ${user.email}: ${trigger}`);
    }
  } catch (error) {
    console.error('Failed to trigger marketing automation:', error);
  }
}

// Lead scoring updates
export async function updateUserLeadScore(user: any) {
  try {
    const hubspotService = new HubSpotService();
    
    // Calculate engagement score
    let score = 0;
    
    // Base scoring logic
    if (user.loginCount > 10) score += 20;
    if (user.hasAccess) score += 30;
    if (user.role !== 'FREE') score += 25;
    if (user.lastLoginAt) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin < 7) score += 15;
    }
    
    await hubspotService.updateLeadScore(user.email, Math.min(score, 100));
    
    console.log(`✅ Lead score updated for ${user.email}: ${score}`);
  } catch (error) {
    console.error('Failed to update lead score:', error);
  }
}
