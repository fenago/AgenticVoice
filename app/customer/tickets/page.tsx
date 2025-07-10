'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Ticket, Plus, Search, Clock, AlertCircle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';

interface TicketType {
  id: string;
  subject: string;
  content: string;
  status: string;
  priority: string;
  createdate: string;
  hs_lastmodifieddate: string;
  source_type: string;
}

export default function CustomerTicketsPage() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    content: '',
    priority: 'MEDIUM'
  });

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div style={{ 
        padding: '24px',
        textAlign: 'center'
      }}>
        <Typography variant="heading-md">Please log in to access your tickets</Typography>
      </div>
    );
  }

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy: 'createdate',
        sortOrder: 'desc',
        limit: '50'
      });

      const response = await fetch(`/api/portal/tickets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session, statusFilter]);

  const createTicket = async () => {
    try {
      const response = await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      setShowCreateModal(false);
      setNewTicket({ subject: '', content: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'open':
        return <AlertCircle size={16} style={{ color: DesignSystem.colors.warning[600] }} />;
      case 'in_progress':
      case 'pending':
        return <Clock size={16} style={{ color: DesignSystem.colors.info }} />;
      case 'closed':
      case 'resolved':
        return <CheckCircle size={16} style={{ color: DesignSystem.colors.success[600] }} />;
      default:
        return <Ticket size={16} style={{ color: '#666666' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return DesignSystem.colors.error[600];
      case 'medium':
        return DesignSystem.colors.warning[600];
      case 'low':
        return DesignSystem.colors.success[600];
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ 
        padding: '24px',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        <Typography variant="body-md" style={{ color: '#999999', textAlign: 'center' }}>
          Loading your tickets...
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <Typography variant="display-md" style={{ 
            color: DesignSystem.colors.primary[900], 
            marginBottom: '8px' 
          }}>
            🎫 My Support Tickets
          </Typography>
          <Typography variant="body-md" style={{ color: '#666666' }}>
            View and manage your support requests
          </Typography>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: DesignSystem.colors.primary[600],
            color: 'white',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#999999' 
              }} 
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '120px'
          }}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: DesignSystem.colors.error[50],
          border: `1px solid ${DesignSystem.colors.error[300]}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.error[700] }}>
            {error}
          </Typography>
        </div>
      )}

      {/* Tickets List */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: DesignSystem.shadows.sm,
        overflow: 'hidden'
      }}>
        {filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Ticket size={48} style={{ color: '#cccccc', marginBottom: '16px' }} />
            <Typography variant="heading-md" style={{ color: '#999999', marginBottom: '8px' }}>
              No tickets found
            </Typography>
            <Typography variant="body-md" style={{ color: '#cccccc' }}>
              {tickets.length === 0 ? 'Create your first support ticket' : 'Try adjusting your search or filters'}
            </Typography>
          </div>
        ) : (
          <div>
            {filteredTickets.map((ticket, index) => (
              <div 
                key={ticket.id} 
                style={{ 
                  padding: '20px',
                  borderBottom: index < filteredTickets.length - 1 ? '1px solid #f0f0f0' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {getStatusIcon(ticket.status)}
                      <Typography variant="heading-sm" style={{ color: DesignSystem.colors.primary[900] }}>
                        {ticket.subject || 'No Subject'}
                      </Typography>
                      <div 
                        style={{
                          backgroundColor: getPriorityColor(ticket.priority),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}
                      >
                        {ticket.priority || 'Medium'}
                      </div>
                    </div>
                    <Typography variant="body-md" style={{ 
                      color: '#666666', 
                      marginBottom: '8px',
                      lineHeight: '1.5'
                    }}>
                      {ticket.content?.substring(0, 200)}{ticket.content?.length > 200 ? '...' : ''}
                    </Typography>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999999' }}>
                      <span>Created: {formatDate(ticket.createdate)}</span>
                      {ticket.hs_lastmodifieddate && (
                        <span>Updated: {formatDate(ticket.hs_lastmodifieddate)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: ticket.status === 'closed' ? DesignSystem.colors.success[100] : 
                                   ticket.status === 'open' ? DesignSystem.colors.warning[100] : 
                                   DesignSystem.colors.info + '20',
                    color: ticket.status === 'closed' ? DesignSystem.colors.success[800] : 
                           ticket.status === 'open' ? DesignSystem.colors.warning[800] : 
                           DesignSystem.colors.info,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}>
                    {ticket.status?.replace('_', ' ') || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <Typography variant="heading-md" style={{ marginBottom: '16px' }}>
              Create Support Ticket
            </Typography>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#666666'
              }}>
                Subject *
              </label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Brief description of your issue"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#666666'
              }}>
                Priority
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#666666'
              }}>
                Description *
              </label>
              <textarea
                value={newTicket.content}
                onChange={(e) => setNewTicket({...newTicket, content: e.target.value})}
                placeholder="Please describe your issue in detail..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: '#e0e0e0',
                  color: '#666666',
                  padding: '8px 16px'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createTicket}
                disabled={!newTicket.subject.trim() || !newTicket.content.trim()}
                style={{
                  backgroundColor: DesignSystem.colors.primary[600],
                  color: 'white',
                  padding: '8px 16px',
                  opacity: (!newTicket.subject.trim() || !newTicket.content.trim()) ? 0.5 : 1
                }}
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
