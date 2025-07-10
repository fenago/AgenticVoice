'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Plus, Edit, Trash2, MoreHorizontal, FileUp, FileDown, User, Building2, DollarSign, Ticket, Eye, Edit2 } from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { useSession } from 'next-auth/react';

interface Contact {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  phone?: string;
  createdate?: string;
  lastmodifieddate?: string;
  lifecyclestage?: string;
  hs_lead_status?: string;
  hubspotscore?: string;
  jobtitle?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface FilterOptions {
  search: string;
  leadStatus: string;
  lifecycleStage: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ContactDetailModal {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

const CRMContactsPage: React.FC = () => {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [leadStatusOptions, setLeadStatusOptions] = useState<any[]>([]);
  const [lifecycleStages, setLifecycleStages] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    leadStatus: '',
    lifecycleStage: '',
    dateRange: '',
    sortBy: 'lastmodifieddate',
    sortOrder: 'desc'
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [contactDetailModal, setContactDetailModal] = useState<{
    contact: Contact | null;
    isOpen: boolean;
  }>({ contact: null, isOpen: false });

  useEffect(() => {
    fetchContacts();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [filters]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filters.search,
        leadStatus: filters.leadStatus,
        lifecycleStage: filters.lifecycleStage,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/crm/contacts?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }
      
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [leadStatusRes, lifecycleRes] = await Promise.all([
        fetch('/api/admin/crm/lead-status'),
        fetch('/api/admin/crm/lifecycle-stages')
      ]);
      
      if (leadStatusRes.ok) {
        const leadData = await leadStatusRes.json();
        setLeadStatusOptions(leadData.leadStatusOptions || []);
      }
      
      if (lifecycleRes.ok) {
        const lifecycleData = await lifecycleRes.json();
        setLifecycleStages(lifecycleData.lifecycleStages || []);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleCreateContact = async () => {
    // Open create contact modal
    setContactDetailModal({ contact: null, isOpen: true });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contactIds: selectedContacts })
      });
      
      if (response.ok) {
        await fetchContacts();
        setSelectedContacts([]);
        setShowBulkActions(false);
      }
    } catch (err) {
      console.error('Bulk action error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportContacts = async () => {
    try {
      const response = await fetch('/api/admin/crm/contacts?export=true');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getContactDisplayName = (contact: Contact) => {
    return contact.firstname || contact.lastname 
      ? `${contact.firstname || ''} ${contact.lastname || ''}`.trim()
      : contact.email;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'customer': return DesignSystem.colors.success;
      case 'lead': return DesignSystem.colors.warning;
      case 'opportunity': return DesignSystem.colors.primary;
      default: return DesignSystem.colors.neutral[600];
    }
  };

  if (!session) {
    return (
      <div style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
        <Typography variant="heading-md">Authentication Required</Typography>
        <Typography variant="body-md" style={{ marginTop: DesignSystem.spacing[4] }}>
          Please log in to view CRM contacts.
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: DesignSystem.spacing[6] }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[6]
      }}>
        <div>
          <Typography variant="heading-lg">CRM Contacts</Typography>
          <Typography variant="body-md" style={{ 
            color: DesignSystem.colors.neutral[600],
            marginTop: DesignSystem.spacing[1]
          }}>
            Manage your HubSpot contacts and leads
          </Typography>
        </div>
        
        <div style={{ display: 'flex', gap: DesignSystem.spacing[3] }}>
          {selectedContacts.length > 0 && (
            <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('batchDelete')}>
                <Trash2 size={16} />
                Delete ({selectedContacts.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowBulkActions(!showBulkActions)}>
                <MoreHorizontal size={16} />
                More Actions
              </Button>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://developers.hubspot.com/docs/reference/api/crm/contacts', '_blank')}
          >
            📚 HubSpot Docs
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportContacts}>
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateContact}>
            <Plus size={16} />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: DesignSystem.spacing[6] }}>
        <div style={{ 
          display: 'flex', 
          gap: DesignSystem.spacing[4],
          marginBottom: DesignSystem.spacing[4]
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: DesignSystem.spacing[3], 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: DesignSystem.colors.neutral[400]
              }} 
            />
            <input
              type="text"
              placeholder="Search contacts..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[3]} ${DesignSystem.spacing[3]} ${DesignSystem.spacing[10]}`,
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.md,
                fontSize: '14px'
              }}
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters {showFilters ? '▲' : '▼'}
          </Button>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: DesignSystem.spacing[4],
            padding: DesignSystem.spacing[4],
            backgroundColor: DesignSystem.colors.neutral[50],
            borderRadius: DesignSystem.borderRadius.md,
            border: `1px solid ${DesignSystem.colors.neutral[200]}`
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: DesignSystem.spacing[2], display: 'block' }}>Lead Status</label>
              <select
                value={filters.leadStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, leadStatus: e.target.value }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[2],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: DesignSystem.borderRadius.sm,
                  fontSize: '14px'
                }}
              >
                <option value="">All Lead Status</option>
                {leadStatusOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: DesignSystem.spacing[2], display: 'block' }}>Lifecycle Stage</label>
              <select
                value={filters.lifecycleStage}
                onChange={(e) => setFilters(prev => ({ ...prev, lifecycleStage: e.target.value }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[2],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: DesignSystem.borderRadius.sm,
                  fontSize: '14px'
                }}
              >
                <option value="">All Lifecycle Stages</option>
                {lifecycleStages.map((stage: any) => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: DesignSystem.spacing[2], display: 'block' }}>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[2],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: DesignSystem.borderRadius.sm,
                  fontSize: '14px'
                }}
              >
                <option value="lastmodifieddate">Last Modified</option>
                <option value="createdate">Created Date</option>
                <option value="email">Email</option>
                <option value="hubspotscore">Lead Score</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: DesignSystem.spacing[12],
          color: DesignSystem.colors.neutral[500]
        }}>
          <div style={{ fontSize: '18px', marginBottom: DesignSystem.spacing[2] }}>
            Loading contacts...
          </div>
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: DesignSystem.spacing[12],
          color: DesignSystem.colors.error,
          backgroundColor: DesignSystem.colors.neutral[50],
          borderRadius: DesignSystem.borderRadius.lg,
          border: `1px solid ${DesignSystem.colors.neutral[200]}`
        }}>
          <div style={{ fontSize: '18px', marginBottom: DesignSystem.spacing[2] }}>
            ⚠️ Error Loading Contacts
          </div>
          <div style={{ fontSize: '14px', marginBottom: DesignSystem.spacing[4] }}>
            {error}
          </div>
          <Button variant="primary" size="sm" onClick={fetchContacts}>
            Retry
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: DesignSystem.spacing[12],
          color: DesignSystem.colors.neutral[600]
        }}>
          <div style={{ fontSize: '16px', marginBottom: DesignSystem.spacing[2] }}>
            No contacts found
          </div>
          <div style={{ fontSize: '14px' }}>
            Try adjusting your search filters
          </div>
        </div>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: DesignSystem.colors.neutral[50] }}>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
                    width: '50px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === contacts.length && contacts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(contacts.map(c => c.id));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Company
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Lead Score
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Last Modified
                  </th>
                  <th style={{
                    padding: DesignSystem.spacing[3],
                    textAlign: 'center',
                    fontWeight: 600,
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact: Contact, index: number) => (
                  <tr 
                    key={contact.id}
                    style={{ 
                      borderTop: index > 0 ? `1px solid ${DesignSystem.colors.neutral[200]}` : 'none'
                    }}
                  >
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts(prev => [...prev, contact.id]);
                          } else {
                            setSelectedContacts(prev => prev.filter(id => id !== contact.id));
                          }
                        }}
                      />
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => setContactDetailModal({ contact, isOpen: true })}
                      >
                        <div style={{ 
                          fontWeight: 500, 
                          color: DesignSystem.colors.neutral[900],
                          marginBottom: DesignSystem.spacing[1]
                        }}>
                          {getContactDisplayName(contact)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: DesignSystem.colors.neutral[500]
                        }}>
                          ID: {contact.id}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <div style={{ fontSize: '14px', color: DesignSystem.colors.neutral[700] }}>
                        {contact.email}
                      </div>
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      color: DesignSystem.colors.neutral[700]
                    }}>
                      {contact.company || '--'}
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <span style={{
                        padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
                        borderRadius: DesignSystem.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: contact.lifecyclestage === 'customer' 
                          ? DesignSystem.colors.success + '20'
                          : contact.lifecyclestage === 'lead'
                          ? DesignSystem.colors.warning + '20'
                          : DesignSystem.colors.neutral[200],
                        color: contact.lifecyclestage === 'customer' 
                          ? DesignSystem.colors.success
                          : contact.lifecyclestage === 'lead'
                          ? DesignSystem.colors.warning
                          : DesignSystem.colors.neutral[600]
                      }}>
                        {contact.lifecyclestage?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      color: DesignSystem.colors.neutral[600],
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: contact.hubspotscore 
                          ? (Number(contact.hubspotscore) > 75 ? DesignSystem.colors.success + '20' 
                          : Number(contact.hubspotscore) > 50 ? DesignSystem.colors.warning + '20'
                          : DesignSystem.colors.neutral[200])
                          : DesignSystem.colors.neutral[100],
                        color: contact.hubspotscore 
                          ? (Number(contact.hubspotscore) > 75 ? DesignSystem.colors.success 
                          : Number(contact.hubspotscore) > 50 ? DesignSystem.colors.warning
                          : DesignSystem.colors.neutral[600])
                          : DesignSystem.colors.neutral[500],
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {contact.hubspotscore || '0'}
                      </div>
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      color: DesignSystem.colors.neutral[600],
                      fontSize: '12px'
                    }}>
                      {contact.lastmodifieddate 
                        ? new Date(contact.lastmodifieddate).toLocaleDateString()
                        : '--'
                      }
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3], textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: DesignSystem.spacing[1], justifyContent: 'center' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setContactDetailModal({ contact, isOpen: true })}
                          style={{ padding: DesignSystem.spacing[1] }}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Edit contact logic
                            setContactDetailModal({ contact, isOpen: true });
                          }}
                          style={{ padding: DesignSystem.spacing[1] }}
                        >
                          <Edit2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {/* Contact Detail Modal */}
      {contactDetailModal.isOpen && (
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
            borderRadius: DesignSystem.borderRadius.lg,
            padding: DesignSystem.spacing[6],
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: DesignSystem.spacing[4]
            }}>
              <Typography variant="heading-md">
                {contactDetailModal.contact ? 'Edit Contact' : 'Add New Contact'}
              </Typography>
              <button
                onClick={() => setContactDetailModal({ contact: null, isOpen: false })}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: DesignSystem.colors.neutral[500],
                  padding: DesignSystem.spacing[1]
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const contactData = {
                email: formData.get('email') as string,
                firstname: formData.get('firstname') as string,
                lastname: formData.get('lastname') as string,
                company: formData.get('company') as string,
                phone: formData.get('phone') as string,
                jobtitle: formData.get('jobtitle') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                country: formData.get('country') as string,
                lifecyclestage: formData.get('lifecyclestage') as string,
                hs_lead_status: formData.get('hs_lead_status') as string
              };
              
              try {
                const method = contactDetailModal.contact ? 'PATCH' : 'POST';
                const url = contactDetailModal.contact 
                  ? `/api/admin/crm/contacts/${contactDetailModal.contact.id}`
                  : '/api/admin/crm/contacts';
                  
                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(contactData)
                });
                
                if (response.ok) {
                  await fetchContacts();
                  setContactDetailModal({ contact: null, isOpen: false });
                } else {
                  console.error('Failed to save contact');
                }
              } catch (error) {
                console.error('Error saving contact:', error);
              }
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: DesignSystem.spacing[4],
                marginBottom: DesignSystem.spacing[4]
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={contactDetailModal.contact?.email || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>First Name</label>
                  <input
                    name="firstname"
                    type="text"
                    defaultValue={contactDetailModal.contact?.firstname || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Last Name</label>
                  <input
                    name="lastname"
                    type="text"
                    defaultValue={contactDetailModal.contact?.lastname || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Company</label>
                  <input
                    name="company"
                    type="text"
                    defaultValue={contactDetailModal.contact?.company || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={contactDetailModal.contact?.phone || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Job Title</label>
                  <input
                    name="jobtitle"
                    type="text"
                    defaultValue={contactDetailModal.contact?.jobtitle || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>City</label>
                  <input
                    name="city"
                    type="text"
                    defaultValue={contactDetailModal.contact?.city || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>State</label>
                  <input
                    name="state"
                    type="text"
                    defaultValue={contactDetailModal.contact?.state || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Country</label>
                  <input
                    name="country"
                    type="text"
                    defaultValue={contactDetailModal.contact?.country || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Lifecycle Stage</label>
                  <select
                    name="lifecyclestage"
                    defaultValue={contactDetailModal.contact?.lifecyclestage || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Stage</option>
                    {lifecycleStages.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: DesignSystem.spacing[1],
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Lead Status</label>
                  <select
                    name="hs_lead_status"
                    defaultValue={contactDetailModal.contact?.hs_lead_status || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Status</option>
                    {leadStatusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: DesignSystem.spacing[3]
              }}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setContactDetailModal({ contact: null, isOpen: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  {contactDetailModal.contact ? 'Update Contact' : 'Create Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMContactsPage;
