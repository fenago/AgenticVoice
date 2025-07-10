import { AssistantType, AssistantStatus } from "@/models/VapiAssistant";

// Base metadata structure for VAPI objects
interface VapiMetadata {
  customer_id?: string;      // Stripe Customer ID for billing
  user_id?: string;          // MongoDB User ID for user tracking
  billing_entity?: string;   // For easy filtering (e.g., 'stripe_customer')
  user_email?: string;       // User email for reference
  user_name?: string;        // User name for reference
  customer_name?: string;    // Customer name for reference
  customer_email?: string;   // Customer email for reference
  [key: string]: any;        // Allow additional metadata
}

export interface VapiAssistantConfig {
  name: string;
  model: { provider: string; model: string; };
  voice: { provider: string; voiceId: string; };
  firstMessage: string;
  systemMessage?: string;
  recordingEnabled: boolean;
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
  metadata?: VapiMetadata;
}

export interface VapiAssistant {
  id: string;
  name: string;
  model: any;
  voice: any;
  firstMessage: string;
  systemMessage: string;
  metadata?: VapiMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface VapiCall {
  id: string;
  phoneNumberId: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  createdAt: string;
  customer?: {
    number: string;
  };
  assistantId?: string; // Added for leads without customer object
  cost?: number;
  startedAt?: string;
  endedAt?: string;
  metadata?: VapiMetadata;
  assistant?: VapiAssistant;
}

export interface VapiPhoneNumber {
  id: string;
  number: string;
}

export interface VapiCampaign {
  id: string;
  name: string;
}

export interface VapiSystemAnalytics {
  totalCost: number;
  totalCalls: number;
  totalCustomers: number;
  totalMinutes: number;
  averageCallDuration: number;
  totalAssistants: number;
  totalPhoneNumbers: number;
  callsLast7Days: number;
  costLast7Days: number;
  callsLast30Days: number;
  costLast30Days: number;
  performanceTrends: {
    date: string;
    calls: number;
    cost: number;
  }[];
  callSuccessRate: number;
  callFailureRate: number;
  averageCallSetupTimeSeconds: number;
}

export interface VapiCustomer {
  id: string; 
  name: string;
  email: string;
  totalCalls: number;
  totalCost: number;
  totalDuration: number; // in minutes
  averageCallDuration: number; // in minutes
  firstCallDate?: string;
  lastCallDate?: string;
}

export class VapiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.vapi.ai';
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('VAPI_API_KEY environment variable is required');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, attempt = 1): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      }
    };

    const requestOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        throw error;
      }
      
      if (response.status === 204) { // No Content
        return {} as T;
      }

      return await response.json();

    } catch (error: any) {
      if (attempt < this.retryAttempts && (!error.response || (error.response.status >= 500 && error.response.status < 600))) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.request<T>(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  private async _fetchAllCalls(): Promise<VapiCall[]> {
    console.log("Fetching all calls with pagination...");
    const allCalls: VapiCall[] = [];
    let hasMore = true;
    let lastCreatedAt: string | undefined = undefined;
    const limit = 1000;

    while (hasMore) {
      const calls = await this.listCalls({ limit, createdAtLt: lastCreatedAt });

      if (calls && calls.length > 0) {
        allCalls.push(...calls);
        lastCreatedAt = calls[calls.length - 1].createdAt;
        if (calls.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    console.log(`Finished fetching all calls. Total: ${allCalls.length}`);
    return allCalls;
  }

  public async listUniqueCustomers(): Promise<{ id: string; name: string; email: string; totalCalls: number; }[]> {
    try {
      console.log("Starting to fetch unique customers with enhanced logic...");
      const allCalls = await this._fetchAllCalls();

      const customerMap = new Map<string, { name: string; email: string; totalCalls: number }>();

      for (const call of allCalls) {
        try {
          // Use a hierarchical ID for the customer.
          const customerId = call.metadata?.customer_id || call.customer?.number || call.assistantId;
          if (!customerId) continue; // Skip calls with no identifier.

          // Create a descriptive name based on the available data.
          let customerName = `Customer (${typeof customerId === 'string' ? customerId.substring(0, 6) : 'ID'}...)`; // Fallback name
          if (call.metadata?.customer_name) {
            customerName = call.metadata.customer_name;
          } else if (call.customer?.number) {
            customerName = `Caller (${call.customer.number})`;
          } else if (call.assistantId) {
            customerName = `Lead (Assistant: ${call.assistantId.substring(0, 6)}...)`;
          }

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              name: customerName,
              email: call.metadata?.customer_email || '',
              totalCalls: 0,
            });
          }

          customerMap.get(customerId)!.totalCalls += 1;
        } catch (e) {
          console.error("Error processing a single call record:", e);
        }
      }

      console.log(`Found ${customerMap.size} unique customers.`);

      const customers = Array.from(customerMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));

      return customers.sort((a, b) => b.totalCalls - a.totalCalls);
    } catch (error: any) {
      console.error("Failed to list unique customers:", error.message);
      return [];
    }
  }

  async findCustomerByQuery(query: string): Promise<VapiCustomer | null> {
    const allCalls = await this._fetchAllCalls();
    const lowerCaseQuery = query.toLowerCase();

    const customerCalls = allCalls.filter(call => {
      const customerId = call.metadata?.customer_id || call.customer?.number || call.assistantId;
      if (!customerId) return false;
      
      const idMatch = typeof customerId === 'string' && customerId.toLowerCase() === lowerCaseQuery;
      const emailMatch = call.metadata?.customer_email?.toLowerCase() === lowerCaseQuery;
      const numberMatch = call.customer?.number === lowerCaseQuery;
      
      return idMatch || emailMatch || numberMatch;
    });

    if (customerCalls.length === 0) {
      console.log(`Customer not found for query: ${query}`);
      return null;
    }

    const representativeCall = customerCalls[0];
    const customerId = representativeCall.metadata?.customer_id || representativeCall.customer?.number || representativeCall.assistantId!;
    
    let customerName = `Customer (${customerId.substring(0, 8)}...)`;
    if (representativeCall.metadata?.customer_name) {
      customerName = representativeCall.metadata.customer_name;
    } else if (representativeCall.customer?.number) {
      customerName = `Caller (${representativeCall.customer.number})`;
    } else if (representativeCall.assistantId) {
      customerName = `Lead (Assistant: ${representativeCall.assistantId.substring(0, 8)}...)`;
    }
    
    const customerEmail = representativeCall.metadata?.customer_email || 'N/A';

    let totalCost = 0;
    let totalDuration = 0;
    let firstCallDate: Date | null = null;
    let lastCallDate: Date | null = null;

    customerCalls.forEach(call => {
      totalCost += call.cost || 0;
      if (call.startedAt && call.endedAt) {
        const start = new Date(call.startedAt);
        const end = new Date(call.endedAt);
        totalDuration += (end.getTime() - start.getTime());

        if (!firstCallDate || start < firstCallDate) {
          firstCallDate = start;
        }
        if (!lastCallDate || end > lastCallDate) {
          lastCallDate = end;
        }
      }
    });

    const totalDurationMinutes = Math.round(totalDuration / (1000 * 60));
    const averageCallDuration = customerCalls.length > 0 ? (totalDurationMinutes / customerCalls.length) : 0;

    return {
      id: customerId,
      name: customerName,
      email: customerEmail,
      totalCalls: customerCalls.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalDuration: totalDurationMinutes,
      averageCallDuration: Math.round(averageCallDuration * 100) / 100,
      firstCallDate: firstCallDate?.toISOString(),
      lastCallDate: lastCallDate?.toISOString(),
    };
  }

  async listAssistantsForCustomer(customerId: string): Promise<VapiAssistant[]> {
    const allCalls = await this._fetchAllCalls();
    const assistantIds = new Set<string>();

    allCalls.forEach(call => {
        const callCustomerId = call.metadata?.customer_id || call.customer?.number || call.assistantId;
        if (callCustomerId === customerId && call.assistantId) {
            assistantIds.add(call.assistantId);
        }
    });
    
    if (assistantIds.size === 0) return [];

    const allAssistants = await this.listAssistants({ limit: 1000 });
    return allAssistants.filter(a => assistantIds.has(a.id));
  }

  async listCallsForCustomer(customerId: string, options: { limit?: number } = {}): Promise<VapiCall[]> {
    const allCalls = await this._fetchAllCalls();
    const customerCalls = allCalls.filter(c => {
        const callCustomerId = c.metadata?.customer_id || c.customer?.number || c.assistantId;
        return callCustomerId === customerId;
    });

    return options.limit ? customerCalls.slice(0, options.limit) : customerCalls;
  }

  async listAssistants(params: { limit?: number } = {}): Promise<VapiAssistant[]> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<VapiAssistant[]>(`/assistant${queryString ? `?${queryString}` : ''}`);
  }

  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    return this.request<VapiAssistant>(`/assistant/${assistantId}`);
  }
  
  async createAssistantForUser(userData: { mongoUserId: string; stripeCustomerId?: string; email: string; name?: string; }, config: Partial<VapiAssistantConfig> = {}): Promise<VapiAssistant> {
    const assistantName = config.name || `${userData.name || userData.email.split('@')[0]}'s Assistant`;
    const defaultConfig: VapiAssistantConfig = {
      name: assistantName,
      model: { provider: "openai", model: "gpt-3.5-turbo" },
      voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
      firstMessage: config.firstMessage || "Hello! I'm your AI assistant. How can I help you today?",
      recordingEnabled: true,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 300,
      metadata: {
        customer_id: userData.stripeCustomerId || '',
        user_id: userData.mongoUserId,
        billing_entity: 'stripe_customer',
        user_email: userData.email,
        user_name: userData.name || '',
        created_by_system: 'AgenticVoice',
        ...config.metadata
      }
    };

    return this.request<VapiAssistant>('/assistant', { method: 'POST', body: JSON.stringify(defaultConfig) });
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    await this.request<void>(`/assistant/${assistantId}`, { method: 'DELETE' });
  }

  async listCalls(params: { limit?: number; createdAtLt?: string } = {}): Promise<VapiCall[]> {
    const queryParams = new URLSearchParams();
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.createdAtLt) {
      queryParams.append('createdAtLt', params.createdAtLt);
    }
    const queryString = queryParams.toString();
    return this.request<VapiCall[]>(`/call${queryString ? `?${queryString}` : ''}`);
  }

  async listPhoneNumbers(params: { limit?: number } = {}): Promise<VapiPhoneNumber[]> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<VapiPhoneNumber[]>(`/phone-number${queryString ? `?${queryString}` : ''}`);
  }

  async listCampaigns(params: { limit?: number } = {}): Promise<VapiCampaign[]> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<VapiCampaign[]>(`/campaign${queryString ? `?${queryString}` : ''}`);
  }

  async getCall(callId: string): Promise<VapiCall> {
    return this.request<VapiCall>(`/call/${callId}`);
  }

  async getSystemAnalytics(): Promise<VapiSystemAnalytics> {
    try {
      const allCalls = await this._fetchAllCalls();
      const allAssistants = await this.listAssistants({ limit: 1000 });
      const allPhoneNumbers = await this.listPhoneNumbers({ limit: 1000 });

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalCost = 0;
      let totalMinutes = 0;
      let callsLast7Days = 0;
      let costLast7Days = 0;
      let callsLast30Days = 0;
      let costLast30Days = 0;
      let successfulCalls = 0;
      let totalSetupTimeMs = 0;
      let callsWithSetupTime = 0;
      const customerIds = new Set<string>();

      const performanceTrends: { date: string; calls: number; cost: number }[] = [];
      const trendMap = new Map<string, { calls: number; cost: number }>();

      for (const call of allCalls) {
        const cost = call.cost || 0;
        totalCost += cost;

        if (call.status === 'ended') {
          successfulCalls++;
        }

        if (call.createdAt && call.startedAt) {
          totalSetupTimeMs += new Date(call.startedAt).getTime() - new Date(call.createdAt).getTime();
          callsWithSetupTime++;
        }

        if (call.metadata?.customer_id) {
          customerIds.add(call.metadata.customer_id);
        }

        const duration = call.endedAt && call.startedAt
          ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / (1000 * 60)
          : 0;
        totalMinutes += duration;

        if (call.createdAt) {
          const callDate = new Date(call.createdAt);
          if (callDate >= sevenDaysAgo) {
            callsLast7Days++;
            costLast7Days += cost;
          }
          if (callDate >= thirtyDaysAgo) {
            callsLast30Days++;
            costLast30Days += cost;

            const dateKey = callDate.toISOString().split('T')[0];
            const dailyStat = trendMap.get(dateKey) || { calls: 0, cost: 0 };
            dailyStat.calls++;
            dailyStat.cost += cost;
            trendMap.set(dateKey, dailyStat);
          }
        }
      }

      const sortedTrends = Array.from(trendMap.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
      for (const [date, data] of sortedTrends) {
        performanceTrends.push({ date, calls: data.calls, cost: Math.round(data.cost * 100) / 100 });
      }

      const callSuccessRate = allCalls.length > 0 ? (successfulCalls / allCalls.length) * 100 : 0;

      return {
        totalCost: Math.round(totalCost * 100) / 100,
        totalCalls: allCalls.length,
        totalCustomers: customerIds.size,
        totalMinutes: Math.round(totalMinutes),
        averageCallDuration: allCalls.length > 0 ? Math.round((totalMinutes / allCalls.length) * 100) / 100 : 0,
        totalAssistants: allAssistants.length,
        totalPhoneNumbers: allPhoneNumbers.length,
        callsLast7Days,
        costLast7Days: Math.round(costLast7Days * 100) / 100,
        callsLast30Days,
        costLast30Days: Math.round(costLast30Days * 100) / 100,
        performanceTrends,
        callSuccessRate: callSuccessRate,
        callFailureRate: 100 - callSuccessRate,
        averageCallSetupTimeSeconds: callsWithSetupTime > 0 ? Math.round((totalSetupTimeMs / callsWithSetupTime) / 1000 * 100) / 100 : 0,
      };
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }

  async getCustomerCalls(stripeCustomerId: string, options: { startDate?: Date; endDate?: Date; limit?: number } = {}): Promise<VapiCall[]> {
    const allCalls = await this._fetchAllCalls();
    // ...
    const customerCalls = allCalls.filter(call => 
      call.metadata?.customer_id === stripeCustomerId || 
      call.assistant?.metadata?.customer_id === stripeCustomerId
    );

    const { startDate, endDate } = options;
    if (!startDate && !endDate) {
      return customerCalls.slice(0, options.limit || customerCalls.length);
    }

    return customerCalls.filter(call => {
      if (!call.startedAt) return false;
      const callDate = new Date(call.startedAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && callDate < start) return false;
      if (end && callDate > end) return false;
      return true;
    }).slice(0, options.limit || customerCalls.length);
  }

  async getCustomerUsageAnalytics(stripeCustomerId: string, options: { startDate?: Date; endDate?: Date; } = {}): Promise<{ totalCalls: number; totalMinutes: number; totalCost: number; callsByAssistant: Record<string, { calls: number; minutes: number; cost: number }>; period: { start: Date; end: Date }; }> {
    const calls = await this.getCustomerCalls(stripeCustomerId, { startDate: options.startDate, endDate: options.endDate, limit: 1000 });
    let totalCalls = 0, totalMinutes = 0, totalCost = 0;
    const callsByAssistant: Record<string, { calls: number; minutes: number; cost: number }> = {};

    calls.forEach((call: any) => {
      totalCalls++;
      const duration = call.endedAt && call.startedAt ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / (1000 * 60) : 0;
      const cost = call.cost || 0;
      totalMinutes += duration;
      totalCost += cost;
      const assistantId = call.assistantId || 'unknown';
      if (!callsByAssistant[assistantId]) callsByAssistant[assistantId] = { calls: 0, minutes: 0, cost: 0 };
      callsByAssistant[assistantId].calls++;
      callsByAssistant[assistantId].minutes += duration;
      callsByAssistant[assistantId].cost += cost;
    });

    return { totalCalls, totalMinutes: Math.round(totalMinutes * 100) / 100, totalCost: Math.round(totalCost * 100) / 100, callsByAssistant, period: { start: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: options.endDate || new Date() } };
  }
  
  async getCustomerAssistants(stripeCustomerId: string): Promise<VapiAssistant[]> {
    const assistants = await this.listAssistants({ limit: 1000 });
    return assistants.filter(assistant => assistant.metadata?.customer_id === stripeCustomerId);
  }

  async testAssistant(assistantId: string): Promise<{ success: boolean; message: string; accessible: boolean; details?: VapiAssistant; }> {
    try {
      const assistant = await this.getAssistant(assistantId);
      return {
        success: true,
        message: `Assistant '${assistant.name}' is accessible.`,
        accessible: true,
        details: assistant
      };
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          message: `Assistant with ID '${assistantId}' not found on VAPI. It may have been deleted or the ID is incorrect.`,
          accessible: false
        };
      }
      return {
        success: false,
        message: `Failed to test assistant due to an API error: ${error.message}`,
        accessible: false
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: { apiKeyValid: boolean; canListAssistants: boolean; assistantCount: number; }; }> {
    try {
      const assistants = await this.listAssistants({ limit: 1 });
      return { success: true, message: `VAPI connection successful. Found ${assistants.length} or more assistants.`, details: { apiKeyValid: true, canListAssistants: true, assistantCount: assistants.length } };
    } catch (error: any) {
      return { success: false, message: `VAPI connection failed: ${error.message}`, details: { apiKeyValid: false, canListAssistants: false, assistantCount: 0 } };
    }
  }
}

export const vapiService = new VapiService();
