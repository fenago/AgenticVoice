// Admin utility functions
import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date, dateFormat = 'MMM dd, yyyy') => {
  return format(new Date(date), dateFormat);
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const truncateText = (text: string, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

export const getStatusColor = (status: string) => {
  const statusColors = {
    active: 'text-status-success bg-status-success/10',
    suspended: 'text-status-error bg-status-error/10',
    pending: 'text-status-warning bg-status-warning/10',
    cancelled: 'text-status-error bg-status-error/10',
    past_due: 'text-status-warning bg-status-warning/10',
    trialing: 'text-status-info bg-status-info/10',
  };
  
  return statusColors[status as keyof typeof statusColors] || 'text-secondary-medium-gray bg-secondary-light-gray';
};

export const getRoleColor = (roleName: string) => {
  const roleColors = {
    admin: 'text-primary-purple bg-primary-purple/10',
    moderator: 'text-primary-blue bg-primary-blue/10',
    user: 'text-secondary-medium-gray bg-secondary-light-gray',
    support: 'text-primary-teal bg-primary-teal/10',
  };
  
  return roleColors[roleName.toLowerCase() as keyof typeof roleColors] || 'text-secondary-medium-gray bg-secondary-light-gray';
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const isValid = Object.values(requirements).every(Boolean);
  return { isValid, requirements };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const classNames = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
