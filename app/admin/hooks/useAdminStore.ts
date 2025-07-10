// Admin state management with Zustand
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, Role, SubscriptionPlan, AdminStats, AuditLog } from '../types';

interface AdminState {
  // UI State
  sidebarCollapsed: boolean;
  loading: boolean;
  error: string | null;

  // Data State
  users: User[];
  selectedUsers: string[];
  roles: Role[];
  subscriptionPlans: SubscriptionPlan[];
  adminStats: AdminStats | null;
  auditLogs: AuditLog[];

  // Pagination
  pagination: {
    users: { page: number; limit: number; total: number };
    auditLogs: { page: number; limit: number; total: number };
  };

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // User actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  setSelectedUsers: (userIds: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  clearUserSelection: () => void;

  // Role actions
  setRoles: (roles: Role[]) => void;
  addRole: (role: Role) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  removeRole: (id: string) => void;

  // Subscription actions
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
  addSubscriptionPlan: (plan: SubscriptionPlan) => void;
  updateSubscriptionPlan: (id: string, plan: Partial<SubscriptionPlan>) => void;
  removeSubscriptionPlan: (id: string) => void;

  // Analytics actions
  setAdminStats: (stats: AdminStats) => void;

  // Audit log actions
  setAuditLogs: (logs: AuditLog[]) => void;
  addAuditLog: (log: AuditLog) => void;

  // Pagination actions
  setUsersPagination: (pagination: { page: number; limit: number; total: number }) => void;
  setAuditLogsPagination: (pagination: { page: number; limit: number; total: number }) => void;

  // Reset actions
  reset: () => void;
}

const initialState: Omit<AdminState, keyof {
  setSidebarCollapsed: any;
  setLoading: any;
  setError: any;
  setUsers: any;
  addUser: any;
  updateUser: any;
  removeUser: any;
  setSelectedUsers: any;
  toggleUserSelection: any;
  clearUserSelection: any;
  setRoles: any;
  addRole: any;
  updateRole: any;
  removeRole: any;
  setSubscriptionPlans: any;
  addSubscriptionPlan: any;
  updateSubscriptionPlan: any;
  removeSubscriptionPlan: any;
  setAdminStats: any;
  setAuditLogs: any;
  addAuditLog: any;
  setUsersPagination: any;
  setAuditLogsPagination: any;
  reset: any;
}> = {
  sidebarCollapsed: false,
  loading: false,
  error: null,
  users: [] as User[],
  selectedUsers: [] as string[],
  roles: [] as Role[],
  subscriptionPlans: [] as SubscriptionPlan[],
  adminStats: null as AdminStats | null,
  auditLogs: [] as AuditLog[],
  pagination: {
    users: { page: 1, limit: 10, total: 0 },
    auditLogs: { page: 1, limit: 10, total: 0 },
  },
};

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // UI Actions
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      
      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),

      // User Actions
      setUsers: (users) =>
        set({ users }, false, 'setUsers'),

      addUser: (user) =>
        set(
          (state) => ({ users: [...state.users, user] }),
          false,
          'addUser'
        ),

      updateUser: (id, updatedUser) =>
        set(
          (state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updatedUser } : user
            ),
          }),
          false,
          'updateUser'
        ),

      removeUser: (id) =>
        set(
          (state) => ({
            users: state.users.filter((user) => user.id !== id),
            selectedUsers: state.selectedUsers.filter((userId) => userId !== id),
          }),
          false,
          'removeUser'
        ),

      setSelectedUsers: (userIds) =>
        set({ selectedUsers: userIds }, false, 'setSelectedUsers'),

      toggleUserSelection: (userId) =>
        set(
          (state) => ({
            selectedUsers: state.selectedUsers.includes(userId)
              ? state.selectedUsers.filter((id) => id !== userId)
              : [...state.selectedUsers, userId],
          }),
          false,
          'toggleUserSelection'
        ),

      clearUserSelection: () =>
        set({ selectedUsers: [] }, false, 'clearUserSelection'),

      // Role Actions
      setRoles: (roles) =>
        set({ roles }, false, 'setRoles'),

      addRole: (role) =>
        set(
          (state) => ({ roles: [...state.roles, role] }),
          false,
          'addRole'
        ),

      updateRole: (id, updatedRole) =>
        set(
          (state) => ({
            roles: state.roles.map((role) =>
              role.id === id ? { ...role, ...updatedRole } : role
            ),
          }),
          false,
          'updateRole'
        ),

      removeRole: (id) =>
        set(
          (state) => ({
            roles: state.roles.filter((role) => role.id !== id),
          }),
          false,
          'removeRole'
        ),

      // Subscription Actions
      setSubscriptionPlans: (plans) =>
        set({ subscriptionPlans: plans }, false, 'setSubscriptionPlans'),

      addSubscriptionPlan: (plan) =>
        set(
          (state) => ({ subscriptionPlans: [...state.subscriptionPlans, plan] }),
          false,
          'addSubscriptionPlan'
        ),

      updateSubscriptionPlan: (id, updatedPlan) =>
        set(
          (state) => ({
            subscriptionPlans: state.subscriptionPlans.map((plan) =>
              plan.id === id ? { ...plan, ...updatedPlan } : plan
            ),
          }),
          false,
          'updateSubscriptionPlan'
        ),

      removeSubscriptionPlan: (id) =>
        set(
          (state) => ({
            subscriptionPlans: state.subscriptionPlans.filter((plan) => plan.id !== id),
          }),
          false,
          'removeSubscriptionPlan'
        ),

      // Analytics Actions
      setAdminStats: (stats) =>
        set({ adminStats: stats }, false, 'setAdminStats'),

      // Audit Log Actions
      setAuditLogs: (logs) =>
        set({ auditLogs: logs }, false, 'setAuditLogs'),

      addAuditLog: (log) =>
        set(
          (state) => ({ auditLogs: [log, ...state.auditLogs] }),
          false,
          'addAuditLog'
        ),

      // Pagination Actions
      setUsersPagination: (pagination) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, users: pagination },
          }),
          false,
          'setUsersPagination'
        ),

      setAuditLogsPagination: (pagination) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, auditLogs: pagination },
          }),
          false,
          'setAuditLogsPagination'
        ),

      // Reset
      reset: () =>
        set(initialState, false, 'reset'),
    }),
    {
      name: 'admin-store',
    }
  )
);
