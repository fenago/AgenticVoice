'use client';

import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAdminStore } from '../hooks/useAdminStore';
import { classNames } from '../utils/helpers';

export function AdminHeader() {
  const { loading } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock admin user data - in real app this would come from auth context
  const adminUser = {
    name: 'Admin User',
    email: 'admin@agenticvoice.net',
    avatar: null as string | null,
    role: 'Super Admin'
  };

  const notifications = [
    {
      id: '1',
      title: 'New user registration',
      message: 'John Doe has registered for a trial account',
      time: '2 minutes ago',
      type: 'info',
      unread: true
    },
    {
      id: '2',
      title: 'Payment failed',
      message: 'Subscription payment failed for Acme Corp',
      time: '1 hour ago',
      type: 'warning',
      unread: true
    },
    {
      id: '3',
      title: 'System maintenance',
      message: 'Scheduled maintenance completed successfully',
      time: '3 hours ago',
      type: 'success',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-secondary-light-gray shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-medium-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search users, orders, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-light-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 text-primary-blue">
              <div className="w-4 h-4 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Help Button */}
          <button
            className="p-2 text-secondary-medium-gray hover:text-primary-blue hover:bg-secondary-light-gray rounded-lg transition-colors"
            title="Help & Documentation"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-secondary-medium-gray hover:text-primary-blue hover:bg-secondary-light-gray rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-light-gray z-50">
                <div className="p-4 border-b border-secondary-light-gray">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary-dark-blue">Notifications</h3>
                    <span className="text-sm text-secondary-medium-gray">{unreadCount} unread</span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={classNames(
                        'p-4 border-b border-secondary-light-gray hover:bg-secondary-light-gray transition-colors cursor-pointer',
                        notification.unread && 'bg-primary-blue/5'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={classNames(
                          'w-2 h-2 rounded-full mt-2',
                          notification.type === 'info' && 'bg-status-info',
                          notification.type === 'warning' && 'bg-status-warning',
                          notification.type === 'success' && 'bg-status-success'
                        )} />
                        <div className="flex-1">
                          <p className="font-medium text-secondary-dark-blue">{notification.title}</p>
                          <p className="text-sm text-secondary-medium-gray mt-1">{notification.message}</p>
                          <p className="text-xs text-secondary-medium-gray mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-secondary-light-gray">
                  <button className="text-sm text-primary-blue hover:text-primary-purple font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-light-gray transition-colors"
            >
              <div className="w-8 h-8 bg-gradient rounded-full flex items-center justify-center">
                {adminUser.avatar ? (
                  <img src={adminUser.avatar} alt={adminUser.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-secondary-dark-blue">{adminUser.name}</div>
                <div className="text-xs text-secondary-medium-gray">{adminUser.role}</div>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-light-gray z-50">
                <div className="p-4 border-b border-secondary-light-gray">
                  <div className="text-sm font-medium text-secondary-dark-blue">{adminUser.name}</div>
                  <div className="text-xs text-secondary-medium-gray">{adminUser.email}</div>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-secondary-dark-blue hover:bg-secondary-light-gray transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-secondary-dark-blue hover:bg-secondary-light-gray transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Admin Settings</span>
                  </button>
                </div>
                
                <div className="border-t border-secondary-light-gray py-2">
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-status-error hover:bg-secondary-light-gray transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}
