'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';

interface TicketData {
  id: string;
  properties: {
    subject: string;
    content: string;
    hs_ticket_priority: string;
    hs_pipeline_stage: string;
    createdate: string;
    hs_lastmodifieddate: string;
    source_type: string;
    hubspot_owner_id?: string;
  };
}

interface TicketStatus {
  value: string;
  label: string;
  color: string;
}

interface TicketPriority {
  value: string;
  label: string;
  color: string;
}

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal and selection states
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Ticket status and priority options
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);

  // Check user permissions
  const userRole = (session?.user as any)?.role;
  const hasAccess = ['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole);

  useEffect(() => {
    if (!hasAccess) return;
    
    fetchTicketStatuses();
    fetchTickets();
  }, [hasAccess]);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, selectedStatus, selectedPriority, sortBy, sortOrder]);

  const fetchTicketStatuses = async () => {
    try {
      const response = await fetch('/api/admin/crm/ticket-statuses');
      if (response.ok) {
        const data = await response.json();
        setStatuses(data.statuses || []);
        setPriorities(data.priorities || []);
      }
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: selectedStatus,
        priority: selectedPriority,
        sortBy,
        sortOrder,
        limit: '100'
      });

      const response = await fetch(`/api/admin/crm/tickets?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.properties.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.properties.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(ticket => 
        ticket.properties.hs_pipeline_stage === selectedStatus
      );
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter(ticket => 
        ticket.properties.hs_ticket_priority === selectedPriority
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a.properties[sortBy as keyof typeof a.properties] || '';
      const bValue = b.properties[sortBy as keyof typeof b.properties] || '';
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredTickets(filtered);
  };

  if (!hasAccess) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: DesignSystem.colors.error[50],
          border: `1px solid ${DesignSystem.colors.error[200]}`,
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Typography variant="heading-md" style={{ color: DesignSystem.colors.error[700], marginBottom: '8px' }}>
            Access Denied
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.error[600] }}>
            You need Admin, God Mode, or Marketing permissions to access ticket management.
          </Typography>
        </div>
      </div>
    );
  }

  // Continue with the rest of the component in the next chunk...
  return (
    <div 
      style={{ 
        padding: '24px', 
        backgroundColor: '#ffffff', 
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <Typography variant="display-md" style={{ 
            color: DesignSystem.colors.primary[900], 
            marginBottom: '8px' 
          }}>
            🎫 Ticket Management
          </Typography>
          <Typography 
            variant="body-md" 
            style={{ color: '#666666' }}
          >
            Manage customer support tickets and track resolution progress
          </Typography>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: DesignSystem.colors.primary[600],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Create Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {/* Stats will be populated here */}
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: DesignSystem.shadows.sm
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666666',
            }}>
              Search Tickets
            </label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#cccccc' 
                }} 
              />
              <input
                type="text"
                placeholder="Search by subject or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666666',
            }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666666',
            }}>
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={fetchTickets}
              style={{
                backgroundColor: '#f9f9f9',
                color: 'white',
                padding: '8px 16px'
              }}
            >
              <Filter size={16} />
            </Button>
            
            <Button
              onClick={() => {/* Export functionality */}}
              style={{
                backgroundColor: '#e0e0e0',
                color: '#4a5568',
                border: '1px solid #e0e0e0',
                padding: '8px 16px'
              }}
            >
              <Download size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          backgroundColor: 'white',
          borderRadius: '12px'
        }}>
          <Typography variant="body-md" style={{ color: '#999999' }}>
            Loading tickets...
          </Typography>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: DesignSystem.colors.error[50],
          border: `1px solid ${DesignSystem.colors.error[200]}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.error[700] }}>
            {error}
          </Typography>
        </div>
      )}

      {/* Tickets Table - Placeholder for now */}
      {!loading && !error && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: DesignSystem.shadows.sm
        }}>
          <Typography variant="heading-md" style={{ marginBottom: '16px' }}>
            Tickets ({filteredTickets.length})
          </Typography>
          
          {filteredTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Ticket size={48} style={{ color: '#cccccc', marginBottom: '16px' }} />
              <Typography variant="heading-md" style={{ color: '#999999', marginBottom: '8px' }}>
                No tickets found
              </Typography>
              <Typography variant="body-md" style={{ color: '#cccccc' }}>
                Create your first ticket or adjust your filters
              </Typography>
            </div>
          ) : (
            <div>
              {/* Table implementation would go here */}
              <Typography variant="body-md" style={{ color: '#666666' }}>
                Tickets table implementation in progress...
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
