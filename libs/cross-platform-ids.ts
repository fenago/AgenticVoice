/**
 * Cross-Platform User ID Management
 * Centralized service for managing user identities across all platforms
 */

export interface CrossPlatformUserIds {
  // Primary Universal Identifier
  mongoId: string;           // MongoDB ObjectId (primary key)
  email: string;             // Email (secondary universal key)
  
  // Platform-Specific IDs
  stripeCustomerId?: string; // Stripe: cus_xxxxx
  hubspotContactId?: string; // HubSpot: numeric ID
  vapiUserId?: string;       // VAPI: custom user identifier
  
  // Additional Identifiers
  externalId?: string;       // External system integration
  legacyId?: string;         // Legacy system migration
}

export interface VapiUserConfiguration {
  // User's VAPI setup within your account
  userId: string;            // MongoDB ObjectId
  assistantPrefix: string;   // Prefix for user's assistants (e.g., "user_123_")
  assistantIds: string[];    // VAPI assistant IDs owned by this user
  phoneNumbers: string[];    // Phone numbers assigned to user
  publicKey: string;         // Your VAPI public key (shared)
  privateKey: string;        // Your VAPI private key (shared)
  
  // Usage and limits
  monthlyMinuteLimit: number;
  currentUsage: {
    monthlyMinutes: number;
    totalCalls: number;
    lastResetDate: Date;
  };
  
  // Configuration
  timezone: string;
  language: string;
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
  };
}

export class CrossPlatformIdManager {
  
  /**
   * Generate unique VAPI user identifier
   */
  static generateVapiUserId(mongoId: string, email: string): string {
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortId = mongoId.slice(-8); // Last 8 chars of MongoDB ID
    return `${emailPrefix}_${shortId}`;
  }
  
  /**
   * Create assistant name with user prefix
   */
  static createAssistantName(userId: string, assistantType: string, index: number = 1): string {
    const userPrefix = this.generateVapiUserId(userId, '');
    return `${userPrefix}_${assistantType}_${index}`;
  }
  
  /**
   * Get all platform IDs for a user
   */
  static async getCrossPlatformIds(mongoId: string): Promise<CrossPlatformUserIds | null> {
    try {
      // This would typically query your user database
      const user = await this.getUserFromDatabase(mongoId);
      
      if (!user) return null;
      
      return {
        mongoId: user._id.toString(),
        email: user.email,
        stripeCustomerId: user.customerId,
        hubspotContactId: user.hubspotContactId,
        vapiUserId: user.vapiUserId || this.generateVapiUserId(user._id.toString(), user.email),
      };
    } catch (error) {
      console.error('Error fetching cross-platform IDs:', error);
      return null;
    }
  }
  
  /**
   * Sync user ID across all platforms
   */
  static async syncUserAcrossPlatforms(mongoId: string): Promise<{
    success: boolean;
    synced: string[];
    failed: string[];
    errors: any[];
  }> {
    const result = {
      success: true,
      synced: [] as string[],
      failed: [] as string[],
      errors: [] as any[]
    };
    
    try {
      const user = await this.getUserFromDatabase(mongoId);
      if (!user) throw new Error('User not found');
      
      // Sync to Stripe
      try {
        if (!user.customerId) {
          const stripeCustomer = await this.createStripeCustomer(user);
          user.customerId = stripeCustomer.id;
          result.synced.push('stripe');
        }
      } catch (error) {
        result.failed.push('stripe');
        result.errors.push({ platform: 'stripe', error });
      }
      
      // Sync to HubSpot
      try {
        if (!user.hubspotContactId) {
          const hubspotContact = await this.createHubSpotContact(user);
          user.hubspotContactId = hubspotContact.id;
          result.synced.push('hubspot');
        }
      } catch (error) {
        result.failed.push('hubspot');
        result.errors.push({ platform: 'hubspot', error });
      }
      
      // Setup VAPI Configuration
      try {
        if (!user.vapiUserId) {
          user.vapiUserId = this.generateVapiUserId(user._id.toString(), user.email);
          await this.setupVapiForUser(user);
          result.synced.push('vapi');
        }
      } catch (error) {
        result.failed.push('vapi');
        result.errors.push({ platform: 'vapi', error });
      }
      
      // Save updated user
      await this.saveUserToDatabase(user);
      
      result.success = result.failed.length === 0;
      return result;
      
    } catch (error) {
      result.success = false;
      result.errors.push({ platform: 'general', error });
      return result;
    }
  }
  
  /**
   * Setup VAPI configuration for a user
   */
  static async setupVapiForUser(user: any): Promise<VapiUserConfiguration> {
    const vapiConfig: VapiUserConfiguration = {
      userId: user._id.toString(),
      assistantPrefix: this.generateVapiUserId(user._id.toString(), user.email),
      assistantIds: [],
      phoneNumbers: [],
      publicKey: process.env.VAPI_PUBLIC_KEY || '',
      privateKey: process.env.VAPI_PRIVATE_KEY || '',
      monthlyMinuteLimit: this.getMonthlyLimitByRole(user.role),
      currentUsage: {
        monthlyMinutes: 0,
        totalCalls: 0,
        lastResetDate: new Date()
      },
      timezone: user.timezone || 'UTC',
      language: user.preferences?.language || 'en',
      voiceSettings: {
        voice: 'jennifer',
        speed: 1.0,
        pitch: 1.0
      }
    };
    
    // Create default assistant for user
    const defaultAssistant = await this.createDefaultAssistantForUser(vapiConfig);
    vapiConfig.assistantIds.push(defaultAssistant.id);
    
    // Save VAPI config to user document
    user.vapi = {
      publicKey: vapiConfig.publicKey,
      privateKey: vapiConfig.privateKey,
      assistants: [], // Will be populated with ObjectIds
      phoneNumbers: vapiConfig.phoneNumbers,
      usage: vapiConfig.currentUsage
    };
    
    return vapiConfig;
  }
  
  /**
   * Get monthly minute limit based on user role
   */
  static getMonthlyLimitByRole(role: string): number {
    const limits: { [key: string]: number } = {
      'FREE': 10,
      'STARTER': 100,
      'PRO': 500,
      'ENTERPRISE': 2000
    };
    return limits[role] || 10;
  }
  
  /**
   * Create default VAPI assistant for user
   */
  static async createDefaultAssistantForUser(vapiConfig: VapiUserConfiguration): Promise<any> {
    const assistantName = `${vapiConfig.assistantPrefix}_default`;
    
    // This would call VAPI API to create assistant
    const assistantData = {
      name: assistantName,
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `You are a helpful AI assistant for ${vapiConfig.userId}. Speak clearly and be concise.`
        }]
      },
      voice: {
        provider: 'playht',
        voiceId: 'jennifer'
      }
    };
    
    // Call VAPI API (placeholder)
    const response = await this.callVapiAPI('/assistant', 'POST', assistantData);
    
    // Save assistant to your database
    await this.saveAssistantToDatabase({
      userId: vapiConfig.userId,
      vapiAssistantId: response.id,
      name: assistantName,
      type: 'CUSTOM',
      status: 'ACTIVE',
      configuration: assistantData
    });
    
    return response;
  }
  
  // Placeholder methods for database operations
  private static async getUserFromDatabase(mongoId: string): Promise<any> {
    // Implementation would connect to MongoDB and fetch user
    throw new Error('Not implemented - connect to your MongoDB instance');
  }
  
  private static async saveUserToDatabase(user: any): Promise<void> {
    // Implementation would save user to MongoDB
    throw new Error('Not implemented - connect to your MongoDB instance');
  }
  
  private static async createStripeCustomer(user: any): Promise<any> {
    // Implementation would create Stripe customer
    throw new Error('Not implemented - connect to Stripe API');
  }
  
  private static async createHubSpotContact(user: any): Promise<any> {
    // Implementation would create HubSpot contact
    throw new Error('Not implemented - connect to HubSpot API');
  }
  
  private static async callVapiAPI(endpoint: string, method: string, data: any): Promise<any> {
    // Implementation would call VAPI API
    throw new Error('Not implemented - connect to VAPI API');
  }
  
  private static async saveAssistantToDatabase(assistantData: any): Promise<void> {
    // Implementation would save assistant to MongoDB
    throw new Error('Not implemented - save to VapiAssistant collection');
  }
}

/**
 * VAPI User Management within your account
 */
export class VapiUserManager {
  
  /**
   * How VAPI associates users within your single account:
   * 
   * 1. Single VAPI Account: All users share your credentials
   * 2. User Isolation via Naming: Each user gets unique assistant names
   * 3. Usage Tracking: Track individual user usage within your account
   * 4. Assistant Ownership: Link assistants to specific users in your database
   */
  
  static async createUserScope(mongoUserId: string, email: string) {
    const userScope = {
      // Unique identifier within your VAPI account
      vapiUserId: CrossPlatformIdManager.generateVapiUserId(mongoUserId, email),
      
      // User's assistants (within your account)
      assistants: [] as string[], // Array of VAPI assistant IDs
      
      // User's phone numbers (from your VAPI phone number pool)
      phoneNumbers: [] as string[],
      
      // User's usage (tracked separately)
      usage: {
        monthlyMinutes: 0,
        totalCalls: 0,
        costThisMonth: 0
      },
      
      // User's configuration
      settings: {
        defaultVoice: 'jennifer',
        language: 'en',
        timezone: 'UTC'
      }
    };
    
    return userScope;
  }
  
  /**
   * Get user's VAPI resources within your account
   */
  static async getUserVapiResources(mongoUserId: string) {
    // Get all assistants owned by this user
    const assistants = await this.getUserAssistants(mongoUserId);
    
    // Get phone numbers assigned to this user
    const phoneNumbers = await this.getUserPhoneNumbers(mongoUserId);
    
    // Get usage statistics for this user
    const usage = await this.getUserUsage(mongoUserId);
    
    return {
      assistants,
      phoneNumbers,
      usage,
      totalResources: assistants.length + phoneNumbers.length
    };
  }
  
  private static async getUserAssistants(mongoUserId: string): Promise<string[]> {
    // Query your VapiAssistant collection
    return [];
  }
  
  private static async getUserPhoneNumbers(mongoUserId: string): Promise<string[]> {
    // Query user's assigned phone numbers
    return [];
  }
  
  private static async getUserUsage(mongoUserId: string) {
    // Calculate user's usage from call logs
    return { monthlyMinutes: 0, totalCalls: 0, cost: 0 };
  }
}
