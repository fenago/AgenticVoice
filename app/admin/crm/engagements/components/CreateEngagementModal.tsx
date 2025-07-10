'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Target, Clock, AlertTriangle, Search, ChevronDown, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import SimpleContactSearch from './SimpleContactSearch';

interface CreateEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (engagement: any) => void;
}

export default function CreateEngagementModal({ isOpen, onClose, onSubmit }: CreateEngagementModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    type: 'call',
    title: '',
    description: '',
    contactId: '',
    contactName: '',
    dealId: '',
    priority: 'medium',
    scheduledAt: '',
    assignedTo: session?.user?.email || '',
    duration: 30
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: '📞' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'task', label: 'Task', icon: '✅' },
    { value: 'note', label: 'Note', icon: '📝' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ];

  // Handle contact selection
  const handleContactSelect = (contactId: string, contactName: string) => {
    setFormData(prev => ({
      ...prev,
      contactId,
      contactName
    }));
    if (errors.contactName) {
      setErrors(prev => ({ ...prev, contactName: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the engagement
    onSubmit({
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null
    });

    resetForm();
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectContact = (contact: any) => {
    setFormData(prev => ({
      ...prev,
      contactId: contact.id,
      contactName: contact.fullName
    }));
    setSearchTerm(contact.fullName);
    setDropdownOpen(false);
    if (errors.contactName) {
      setErrors(prev => ({ ...prev, contactName: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'call',
      title: '',
      description: '',
      contactId: '',
      contactName: '',
      dealId: '',
      priority: 'medium',
      scheduledAt: '',
      assignedTo: session?.user?.email || '',
      duration: 30
    });

    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              Create New Engagement
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
              }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '8px 0 0 0',
            paddingBottom: '16px'
          }}>
            Schedule a new activity or engagement with your contacts
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          {/* Activity Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Activity Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px'
            }}>
              {activityTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  style={{
                    padding: '12px 8px',
                    border: formData.type === type.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: formData.type === type.value ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Discovery Call - Enterprise Package"
              style={{
                width: '100%',
                padding: '12px',
                border: errors.title ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.title && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the engagement..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Contact and Deal Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Select Contact *
              </label>
              <SimpleContactSearch
                onContactSelect={handleContactSelect}
                error={errors.contactName}
                value={formData.contactName}
                placeholder="Search contacts by name or email..."
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Deal ID (Optional)
              </label>
              <input
                type="text"
                value={formData.dealId}
                onChange={(e) => handleInputChange('dealId', e.target.value)}
                placeholder="e.g., deal_001"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Priority and Scheduling */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Scheduled Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Duration (for calls/meetings) */}
          {(formData.type === 'call' || formData.type === 'meeting') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 30)}
                min="5"
                max="480"
                step="5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Assigned To */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              <Target size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Enter email or name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Currently assigned to you ({session?.user?.email})
            </p>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              <Plus size={16} />
              Create Engagement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
