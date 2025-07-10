// Admin Dashboard Types

export interface User {
  id: string;
  email: string;
  name: string;
  company_name?: string;
  role_id: string;
  status: 'active' | 'suspended' | 'pending';
  email_verified: boolean;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  role?: Role;
  subscription?: CustomerSubscription;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  voice_agent_limit: number;
  call_minutes_limit: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface UsageStats {
  user_id: string;
  period: string;
  voice_calls: number;
  call_minutes: number;
  api_requests: number;
  cost: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  admin_user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
  admin_user?: User;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  total_subscriptions: number;
  monthly_revenue: number;
  total_usage: {
    voice_calls: number;
    call_minutes: number;
    api_requests: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: User['status'];
  role_id?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface BulkUserAction {
  action: 'activate' | 'suspend' | 'delete' | 'change_role';
  user_ids: string[];
  role_id?: string; // for change_role action
}

// Component Props Types
export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onBulkAction?: (action: string, selectedRows: T[]) => void;
}

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}
