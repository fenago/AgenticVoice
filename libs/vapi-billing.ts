/**
 * VAPI Billing Service
 * Handles usage tracking, billing calculations, and invoice generation for VAPI usage
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

export interface VapiUsageData {
  userId: string;
  monthlyMinutes: number;
  totalCalls: number;
  assistantMinutes: number;
  workflowMinutes: number;
  lastResetDate: string;
  lastActivityDate?: string;
  dailyBreakdown: DailyUsage[];
  assistantBreakdown: AssistantUsage[];
}

export interface DailyUsage {
  date: string;
  minutes: number;
  calls: number;
  cost: number;
}

export interface AssistantUsage {
  assistantId: string;
  assistantName?: string;
  minutes: number;
  calls: number;
  cost: number;
}

export interface BillingInfo {
  ratePerMinute: number;
  assistantRate: number;
  workflowRate: number;
  assistantCost: number;
  workflowCost: number;
  totalCost: number;
  estimatedMonthlyCost: number;
  currency: string;
}

export interface UsageLimits {
  monthlyMinuteLimit: number;
  dailyMinuteLimit: number;
  warningThreshold: number; // percentage (0.8 = 80%)
  overageRate: number; // rate for usage over limit
}

export class VapiBillingService {
  
  /**
   * Get comprehensive usage data for a user
   */
  static async getUserUsage(userId: string, month?: string): Promise<VapiUsageData> {
    const db = await this.connectToDatabase();
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    
    // Get usage logs for the month
    const usageLogs = await db.collection('vapi_usage_logs')
      .find({ 
        userId: new ObjectId(userId),
        billingMonth: currentMonth
      })
      .toArray();

    // Calculate totals
    const totalMinutes = usageLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const totalCalls = usageLogs.length;
    const assistantMinutes = usageLogs
      .filter(log => log.callType === 'assistant')
      .reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const workflowMinutes = usageLogs
      .filter(log => log.callType === 'workflow')
      .reduce((sum, log) => sum + (log.durationMinutes || 0), 0);

    // Get user data
    const user = await db.collection('av_users').findOne(
      { _id: new ObjectId(userId) }
    );

    const dailyBreakdown = await this.getDailyUsageBreakdown(userId, currentMonth);
    const assistantBreakdown = await this.getAssistantUsageBreakdown(userId, currentMonth);

    return {
      userId,
      monthlyMinutes: totalMinutes,
      totalCalls,
      assistantMinutes,
      workflowMinutes,
      lastResetDate: user?.vapi?.usage?.lastResetDate || new Date().toISOString(),
      lastActivityDate: user?.vapi?.usage?.lastActivityDate || null,
      dailyBreakdown,
      assistantBreakdown
    };
  }

  /**
   * Calculate billing information for user's usage
   */
  static calculateBilling(usage: VapiUsageData, limits: UsageLimits): BillingInfo {
    const ASSISTANT_RATE = 0.05; // $0.05 per minute for assistants
    const WORKFLOW_RATE = 0.05;  // $0.05 per minute for workflows
    const OVERAGE_RATE = limits.overageRate || 0.08; // $0.08 per minute for overage

    let assistantCost = usage.assistantMinutes * ASSISTANT_RATE;
    let workflowCost = usage.workflowMinutes * WORKFLOW_RATE;

    // Apply overage charges if user exceeds monthly limit
    const totalUsage = usage.monthlyMinutes;
    if (totalUsage > limits.monthlyMinuteLimit) {
      const overageMinutes = totalUsage - limits.monthlyMinuteLimit;
      const overageCharge = overageMinutes * OVERAGE_RATE;
      
      // Distribute overage proportionally between assistant and workflow usage
      const assistantProportion = usage.assistantMinutes / totalUsage;
      const workflowProportion = usage.workflowMinutes / totalUsage;
      
      assistantCost += overageCharge * assistantProportion;
      workflowCost += overageCharge * workflowProportion;
    }

    const totalCost = assistantCost + workflowCost;

    return {
      ratePerMinute: ASSISTANT_RATE,
      assistantRate: ASSISTANT_RATE,
      workflowRate: WORKFLOW_RATE,
      assistantCost: Number(assistantCost.toFixed(2)),
      workflowCost: Number(workflowCost.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      estimatedMonthlyCost: Number(totalCost.toFixed(2)),
      currency: 'USD'
    };
  }

  /**
   * Get usage limits for a user based on their role/plan
   */
  static getUserLimits(userRole: string): UsageLimits {
    const limits: Record<string, UsageLimits> = {
      'FREE': {
        monthlyMinuteLimit: 10,
        dailyMinuteLimit: 2,
        warningThreshold: 0.8,
        overageRate: 0.08
      },
      'STARTER': {
        monthlyMinuteLimit: 100,
        dailyMinuteLimit: 10,
        warningThreshold: 0.8,
        overageRate: 0.07
      },
      'PRO': {
        monthlyMinuteLimit: 500,
        dailyMinuteLimit: 25,
        warningThreshold: 0.85,
        overageRate: 0.06
      },
      'ENTERPRISE': {
        monthlyMinuteLimit: 2000,
        dailyMinuteLimit: 100,
        warningThreshold: 0.9,
        overageRate: 0.05
      },
      'ADMIN': {
        monthlyMinuteLimit: 1000,
        dailyMinuteLimit: 50,
        warningThreshold: 0.9,
        overageRate: 0.05
      },
      'GOD_MODE': {
        monthlyMinuteLimit: 999999,
        dailyMinuteLimit: 999999,
        warningThreshold: 0.95,
        overageRate: 0.03
      }
    };

    return limits[userRole] || limits['FREE'];
  }

  /**
   * Check if user is approaching or exceeding limits
   */
  static checkUsageLimits(usage: VapiUsageData, limits: UsageLimits): {
    status: 'safe' | 'warning' | 'exceeded';
    percentUsed: number;
    minutesRemaining: number;
    message: string;
  } {
    const percentUsed = usage.monthlyMinutes / limits.monthlyMinuteLimit;
    const minutesRemaining = Math.max(0, limits.monthlyMinuteLimit - usage.monthlyMinutes);

    if (percentUsed >= 1.0) {
      return {
        status: 'exceeded',
        percentUsed: Math.round(percentUsed * 100),
        minutesRemaining,
        message: `Usage limit exceeded. ${usage.monthlyMinutes}/${limits.monthlyMinuteLimit} minutes used. Overage charges apply.`
      };
    } else if (percentUsed >= limits.warningThreshold) {
      return {
        status: 'warning',
        percentUsed: Math.round(percentUsed * 100),
        minutesRemaining,
        message: `Approaching usage limit. ${usage.monthlyMinutes}/${limits.monthlyMinuteLimit} minutes used (${Math.round(percentUsed * 100)}%).`
      };
    } else {
      return {
        status: 'safe',
        percentUsed: Math.round(percentUsed * 100),
        minutesRemaining,
        message: `Usage within limits. ${usage.monthlyMinutes}/${limits.monthlyMinuteLimit} minutes used.`
      };
    }
  }

  /**
   * Generate monthly invoice for user
   */
  static async generateMonthlyInvoice(userId: string, month: string): Promise<any> {
    const usage = await this.getUserUsage(userId, month);
    const user = await this.getUser(userId);
    const limits = this.getUserLimits(user.role);
    const billing = this.calculateBilling(usage, limits);
    const limitStatus = this.checkUsageLimits(usage, limits);

    const invoice = {
      invoiceId: `vapi-${userId}-${month}`,
      userId,
      userEmail: user.email,
      userName: user.name,
      billingMonth: month,
      generatedAt: new Date().toISOString(),
      
      usage: {
        totalMinutes: usage.monthlyMinutes,
        totalCalls: usage.totalCalls,
        assistantMinutes: usage.assistantMinutes,
        workflowMinutes: usage.workflowMinutes,
      },
      
      billing: {
        assistantCost: billing.assistantCost,
        workflowCost: billing.workflowCost,
        totalCost: billing.totalCost,
        currency: billing.currency,
        ratePerMinute: billing.ratePerMinute
      },
      
      limits: {
        monthlyLimit: limits.monthlyMinuteLimit,
        overageApplied: usage.monthlyMinutes > limits.monthlyMinuteLimit,
        overageMinutes: Math.max(0, usage.monthlyMinutes - limits.monthlyMinuteLimit)
      },
      
      status: limitStatus.status,
      breakdown: usage.dailyBreakdown,
      assistantUsage: usage.assistantBreakdown
    };

    // Save invoice to database
    const db = await this.connectToDatabase();
    await db.collection('vapi_invoices').insertOne(invoice);

    return invoice;
  }

  /**
   * Reset monthly usage for user
   */
  static async resetMonthlyUsage(userId: string): Promise<void> {
    const db = await this.connectToDatabase();
    
    await db.collection('av_users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'vapi.usage.monthlyMinutes': 0,
          'vapi.usage.assistantMinutes': 0,
          'vapi.usage.workflowMinutes': 0,
          'vapi.usage.lastResetDate': new Date()
        }
      }
    );
  }

  /**
   * Get all users who need monthly billing
   */
  static async getUsersForBilling(month: string): Promise<string[]> {
    const db = await this.connectToDatabase();
    
    // Get all users who had VAPI usage in the specified month
    const userIds = await db.collection('vapi_usage_logs')
      .distinct('userId', { billingMonth: month });

    return userIds.map(id => id.toString());
  }

  // Private helper methods
  private static async connectToDatabase() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    return client.db('test');
  }

  private static async getUser(userId: string) {
    const db = await this.connectToDatabase();
    return await db.collection('av_users').findOne({ _id: new ObjectId(userId) });
  }

  private static async getDailyUsageBreakdown(userId: string, month: string): Promise<DailyUsage[]> {
    const db = await this.connectToDatabase();
    
    const pipeline = [
      {
        $match: {
          userId: new ObjectId(userId),
          billingMonth: month
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp"
            }
          },
          minutes: { $sum: "$durationMinutes" },
          calls: { $sum: 1 },
          cost: { $sum: "$cost" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ];

    const dailyUsage = await db.collection('vapi_usage_logs')
      .aggregate(pipeline)
      .toArray();

    return dailyUsage.map(day => ({
      date: day._id,
      minutes: day.minutes,
      calls: day.calls,
      cost: Number((day.cost || 0).toFixed(2))
    }));
  }

  private static async getAssistantUsageBreakdown(userId: string, month: string): Promise<AssistantUsage[]> {
    const db = await this.connectToDatabase();
    
    const pipeline = [
      {
        $match: {
          userId: new ObjectId(userId),
          billingMonth: month,
          assistantId: { $exists: true, $ne: null as any }
        }
      },
      {
        $group: {
          _id: "$assistantId",
          minutes: { $sum: "$durationMinutes" },
          calls: { $sum: 1 },
          cost: { $sum: "$cost" }
        }
      },
      {
        $sort: { "minutes": -1 }
      }
    ];

    const assistantUsage = await db.collection('vapi_usage_logs')
      .aggregate(pipeline)
      .toArray();

    // Get assistant names
    const assistantIds = assistantUsage.map(a => a._id);
    const assistants = await db.collection('vapi_assistants')
      .find({ vapiAssistantId: { $in: assistantIds } })
      .toArray();

    const assistantMap: Record<string, string> = assistants.reduce((map, assistant) => {
      map[assistant.vapiAssistantId] = assistant.name;
      return map;
    }, {} as Record<string, string>);

    return assistantUsage.map(assistant => ({
      assistantId: assistant._id,
      assistantName: assistantMap[assistant._id] || 'Unknown Assistant',
      minutes: assistant.minutes,
      calls: assistant.calls,
      cost: Number((assistant.cost || 0).toFixed(2))
    }));
  }
}
