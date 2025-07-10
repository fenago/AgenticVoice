// Admin API utilities
import { ApiResponse, PaginatedResponse } from '../types';

const API_BASE = '/api/admin';

class AdminAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // User Management
  async getUsers(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters);
    return this.request<PaginatedResponse<any>>(`/users?${params}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async suspendUser(id: string) {
    return this.request<any>(`/users/${id}/suspend`, {
      method: 'POST',
    });
  }

  async activateUser(id: string) {
    return this.request<any>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async bulkUserAction(action: any) {
    return this.request<any>('/users/bulk', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  // Role Management
  async getRoles() {
    return this.request<any[]>('/roles');
  }

  async getRole(id: string) {
    return this.request<any>(`/roles/${id}`);
  }

  async createRole(roleData: any) {
    return this.request<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: any) {
    return this.request<any>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string) {
    return this.request<any>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription Management
  async getSubscriptionPlans() {
    return this.request<any[]>('/subscriptions/plans');
  }

  async createSubscriptionPlan(planData: any) {
    return this.request<any>('/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateSubscriptionPlan(id: string, planData: any) {
    return this.request<any>(`/subscriptions/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  // Analytics
  async getAdminStats() {
    return this.request<any>('/stats');
  }

  async getUsageStats(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters);
    return this.request<any>(`/usage?${params}`);
  }

  // Audit Logs
  async getAuditLogs(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters);
    return this.request<PaginatedResponse<any>>(`/audit-logs?${params}`);
  }

  // System Configuration
  async getSystemSettings() {
    return this.request<any>('/system/settings');
  }

  async updateSystemSettings(settings: any) {
    return this.request<any>('/system/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const adminAPI = new AdminAPI();
