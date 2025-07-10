'use client';

import React, { useState } from 'react';
import { X, Calendar, User, Target, Clock, Star, CheckCircle, XCircle, Edit3, Save } from 'lucide-react';

interface Engagement {
  id: string;
  type: string;
  title: string;
  description?: string;
  contactName: string;
  contactEmail?: string;
  dealName?: string;
  status: string;
  priority: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  outcome?: string;
  score?: number;
  duration?: number;
}

interface EngagementDetailsModalProps {
  engagement: Engagement | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
}

export function EngagementDetailsModal({ engagement, isOpen, onClose, onUpdate }: EngagementDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  if (!isOpen || !engagement) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      status: engagement.status,
      outcome: engagement.outcome || '',
      score: engagement.score || 5,
      completedAt: engagement.completedAt ? 
        new Date(engagement.completedAt).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    });
  };

  const handleSave = () => {
    onUpdate(engagement.id, {
      ...editData,
      completedAt: editData.completedAt ? new Date(editData.completedAt).toISOString() : null
    });
    setIsEditing(false);
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '📧',
      meeting: '🤝',
      task: '✅',
      note: '📝'
    };
    return icons[type] || '📋';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#10b981',
      scheduled: '#3b82f6',
      pending: '#f59e0b',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < score ? '#fbbf24' : 'none'}
        color={i < score ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

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
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{getActivityIcon(engagement.type)}</span>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {engagement.title}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: getStatusColor(engagement.status) + '20',
                  color: getStatusColor(engagement.status),
                  textTransform: 'capitalize'
                }}>
                  {engagement.status}
                </span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: getPriorityColor(engagement.priority) + '20',
                  color: getPriorityColor(engagement.priority),
                  textTransform: 'capitalize'
                }}>
                  {engagement.priority} Priority
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'capitalize'
                }}>
                  {engagement.type}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditing && engagement.status !== 'completed' && (
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              )}
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
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Contact and Deal Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={16} color="#6b7280" />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contact</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {engagement.contactName}
              </p>
              {engagement.contactEmail && (
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {engagement.contactEmail}
                </p>
              )}
            </div>

            {engagement.dealName && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Target size={16} color="#6b7280" />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Deal</span>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {engagement.dealName}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {engagement.description && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Description
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                {engagement.description}
              </p>
            </div>
          )}

          {/* Timing Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              Timeline
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={16} color="#6b7280" />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Created</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {formatDate(engagement.createdAt)}
                </p>
              </div>

              {engagement.scheduledAt && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={16} color="#3b82f6" />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Scheduled</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {formatDate(engagement.scheduledAt)}
                  </p>
                </div>
              )}

              {engagement.completedAt && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Completed</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {formatDate(engagement.completedAt)}
                  </p>
                </div>
              )}

              {engagement.duration && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={16} color="#f59e0b" />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Duration</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {engagement.duration} minutes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Outcome and Score */}
          {(engagement.outcome || engagement.score || isEditing) && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Results
              </h3>
              
              {isEditing ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Status
                    </label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, status: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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
                      Outcome
                    </label>
                    <textarea
                      value={editData.outcome}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, outcome: e.target.value }))}
                      rows={3}
                      placeholder="Describe the outcome of this engagement..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
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
                      Engagement Score (1-10)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editData.score}
                        onChange={(e) => setEditData((prev: any) => ({ ...prev, score: parseInt(e.target.value) }))}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '24px' }}>
                        {editData.score}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '8px' }}>
                      {renderStars(editData.score)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {engagement.outcome && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Outcome:</span>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                        {engagement.outcome}
                      </p>
                    </div>
                  )}
                  
                  {engagement.score && (
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        Engagement Score: {engagement.score}/10
                      </span>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                        {renderStars(engagement.score)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
