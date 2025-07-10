'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, Download, Plus, Edit, Trash2, MoreHorizontal, FileUp, FileDown, User, Users, DollarSign, Ticket, Eye, Edit2 } from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { useSession } from 'next-auth/react';

interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  createdate?: string;
  lastmodifieddate?: string;
  numberofemployees?: string;
  annualrevenue?: string;
  hs_lead_status?: string;
  lifecyclestage?: string;
  hubspotscore?: string;
  description?: string;
  timezone?: string;
  type?: string;
}

interface FilterOptions {
  search: string;
  industry: string;
  size: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface CompanyDetailModal {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (company: Company) => void;
}

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    industry: '',
    size: '',
    dateRange: 'all',
    sortBy: 'createdate',
    sortOrder: 'desc'
  });
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [companyDetailModal, setCompanyDetailModal] = useState<{
    company: Company | null;
    isOpen: boolean;
  }>({ company: null, isOpen: false });

  useEffect(() => {
    fetchCompanies();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filters.search,
        industry: filters.industry,
        size: filters.size,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/crm/companies?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`Failed to fetch companies: ${response.status}`);
      }
      
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const industryRes = await fetch('/api/admin/crm/industries');
      
      if (industryRes.ok) {
        const industryData = await industryRes.json();
        setIndustryOptions(industryData.industries || []);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleCreateCompany = async () => {
    // Open create company modal
    setCompanyDetailModal({ company: null, isOpen: true });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCompanies.length === 0) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, companyIds: selectedCompanies })
      });
      
      if (response.ok) {
        await fetchCompanies();
        setSelectedCompanies([]);
        setShowBulkActions(false);
      }
    } catch (err) {
      console.error('Bulk action error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyDisplayName = (company: Company) => {
    return company.name || company.domain || 'Unknown Company';
  };

  const handleExportCompanies = async () => {
    try {
      const response = await fetch('/api/admin/crm/companies?export=true');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `companies-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'customer': return DesignSystem.colors.success;
      case 'lead': return DesignSystem.colors.warning;
      case 'opportunity': return DesignSystem.colors.primary;
      default: return DesignSystem.colors.neutral[600];
    }
  };

  const getCompanySize = (employees: string) => {
    const num = parseInt(employees);
    if (num < 10) return 'Small';
    if (num < 50) return 'Medium';
    if (num < 200) return 'Large';
    return 'Enterprise';
  };

  if (!session) {
    return (
      <div style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
        <Typography variant="heading-md">Authentication Required</Typography>
        <Typography variant="body-md" style={{ marginTop: DesignSystem.spacing[4] }}>
          Please log in to view CRM companies.
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
          <Typography variant="heading-lg">CRM Companies</Typography>
          <Typography variant="body-md" style={{ 
            color: DesignSystem.colors.neutral[600],
            marginTop: DesignSystem.spacing[1]
          }}>
            Manage your HubSpot companies and organizations
          </Typography>
        </div>
        
        <div style={{ display: 'flex', gap: DesignSystem.spacing[3] }}>
          {selectedCompanies.length > 0 && (
            <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}
              >
                <FileDown size={16} />
                Export Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: DesignSystem.spacing[1],
                  color: DesignSystem.colors.error,
                  borderColor: DesignSystem.colors.error
                }}
              >
                <Trash2 size={16} />
                Delete Selected
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCompanies}
            style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}
          >
            <Download size={16} />
            Export
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateCompany}
            style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}
          >
            <Plus size={16} />
            Add Company
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: DesignSystem.spacing[6], padding: DesignSystem.spacing[4] }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: DesignSystem.spacing[4] 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              marginBottom: DesignSystem.spacing[1],
              color: DesignSystem.colors.neutral[700]
            }}>
              Search Companies
            </label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
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
                placeholder="Search by name, domain..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  width: '100%',
                  padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]} ${DesignSystem.spacing[2]} ${DesignSystem.spacing[10]}`,
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: DesignSystem.borderRadius.md,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              marginBottom: DesignSystem.spacing[1],
              color: DesignSystem.colors.neutral[700]
            }}>
              Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              style={{
                width: '100%',
                padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.md,
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Industries</option>
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              marginBottom: DesignSystem.spacing[1],
              color: DesignSystem.colors.neutral[700]
            }}>
              Company Size
            </label>
            <select
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              style={{
                width: '100%',
                padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.md,
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Sizes</option>
              <option value="1-10">Small (1-10)</option>
              <option value="11-50">Medium (11-50)</option>
              <option value="51-200">Large (51-200)</option>
              <option value="200+">Enterprise (200+)</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              marginBottom: DesignSystem.spacing[1],
              color: DesignSystem.colors.neutral[700]
            }}>
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
              }}
              style={{
                width: '100%',
                padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.md,
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="createdate-desc">Newest First</option>
              <option value="createdate-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="lastmodifieddate-desc">Recently Modified</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card style={{ 
          padding: DesignSystem.spacing[4], 
          marginBottom: DesignSystem.spacing[6],
          backgroundColor: DesignSystem.colors.error + '10',
          borderColor: DesignSystem.colors.error + '30'
        }}>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.error }}>
            {error}
          </Typography>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Loading companies...
          </Typography>
        </Card>
      )}

      {/* Companies Table */}
      {!loading && !error && (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}` }}>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    width: '40px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedCompanies.length === companies.length && companies.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCompanies(companies.map(c => c.id));
                        } else {
                          setSelectedCompanies([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Name</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Industry</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Location</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Size</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'center',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Score</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Last Modified</th>
                  <th style={{ 
                    padding: DesignSystem.spacing[3], 
                    textAlign: 'center',
                    fontWeight: 600,
                    color: DesignSystem.colors.neutral[700]
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr 
                    key={company.id}
                    style={{ 
                      borderBottom: `1px solid ${DesignSystem.colors.neutral[100]}`,
                      backgroundColor: selectedCompanies.includes(company.id) ? DesignSystem.colors.primary + '05' : 'transparent'
                    }}
                  >
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies([...selectedCompanies, company.id]);
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                          }
                        }}
                      />
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[3] }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: DesignSystem.colors.primary[500] + '20',
                          color: DesignSystem.colors.primary[500]
                        }}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: 500, 
                            color: DesignSystem.colors.neutral[900],
                            marginBottom: DesignSystem.spacing[1]
                          }}>
                            {getCompanyDisplayName(company)}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: DesignSystem.colors.neutral[500]
                          }}>
                            {company.domain && (
                              <span>{company.domain}</span>
                            )}
                            {company.domain && <span> • </span>}
                            ID: {company.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <div style={{ fontSize: '14px', color: DesignSystem.colors.neutral[700] }}>
                        {company.industry || '--'}
                      </div>
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      color: DesignSystem.colors.neutral[700]
                    }}>
                      {company.city && company.state ? `${company.city}, ${company.state}` : company.city || company.state || '--'}
                    </td>
                    <td style={{ padding: DesignSystem.spacing[3] }}>
                      <span style={{
                        padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
                        borderRadius: DesignSystem.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: DesignSystem.colors.neutral[200],
                        color: DesignSystem.colors.neutral[700]
                      }}>
                        {company.numberofemployees ? getCompanySize(company.numberofemployees) : 'Unknown'}
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
                        backgroundColor: company.hubspotscore 
                          ? (Number(company.hubspotscore) > 75 ? DesignSystem.colors.success + '20' 
                          : Number(company.hubspotscore) > 50 ? DesignSystem.colors.warning + '20'
                          : DesignSystem.colors.neutral[200])
                          : DesignSystem.colors.neutral[200],
                        color: company.hubspotscore 
                          ? (Number(company.hubspotscore) > 75 ? DesignSystem.colors.success
                          : Number(company.hubspotscore) > 50 ? DesignSystem.colors.warning
                          : DesignSystem.colors.neutral[600])
                          : DesignSystem.colors.neutral[600],
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {company.hubspotscore ? Number(company.hubspotscore) : 0}
                      </div>
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      color: DesignSystem.colors.neutral[600],
                      fontSize: '14px'
                    }}>
                      {company.lastmodifieddate 
                        ? new Date(company.lastmodifieddate).toLocaleDateString()
                        : '--'
                      }
                    </td>
                    <td style={{ 
                      padding: DesignSystem.spacing[3],
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: DesignSystem.spacing[1], justifyContent: 'center' }}>
                        <button
                          onClick={() => setCompanyDetailModal({ company, isOpen: true })}
                          style={{
                            padding: DesignSystem.spacing[1],
                            border: 'none',
                            background: 'transparent',
                            color: DesignSystem.colors.neutral[600],
                            cursor: 'pointer',
                            borderRadius: DesignSystem.borderRadius.sm,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setCompanyDetailModal({ company, isOpen: true })}
                          style={{
                            padding: DesignSystem.spacing[1],
                            border: 'none',
                            background: 'transparent',
                            color: DesignSystem.colors.neutral[600],
                            cursor: 'pointer',
                            borderRadius: DesignSystem.borderRadius.sm,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {companies.length === 0 && !loading && (
            <div style={{ 
              padding: DesignSystem.spacing[8], 
              textAlign: 'center',
              color: DesignSystem.colors.neutral[600]
            }}>
              <Building2 size={48} style={{ marginBottom: DesignSystem.spacing[4], opacity: 0.5 }} />
              <Typography variant="heading-sm" style={{ marginBottom: DesignSystem.spacing[2] }}>
                No companies found
              </Typography>
              <Typography variant="body-md">
                {filters.search || filters.industry || filters.size
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first company.'}
              </Typography>
            </div>
          )}
        </Card>
      )}
      
      {/* Company Detail Modal */}
      {companyDetailModal.isOpen && (
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
                {companyDetailModal.company ? 'Edit Company' : 'Add New Company'}
              </Typography>
              <button
                onClick={() => setCompanyDetailModal({ company: null, isOpen: false })}
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
              const companyData = {
                name: formData.get('name') as string,
                domain: formData.get('domain') as string,
                industry: formData.get('industry') as string,
                phone: formData.get('phone') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                country: formData.get('country') as string,
                description: formData.get('description') as string,
                numberofemployees: formData.get('numberofemployees') as string,
                annualrevenue: formData.get('annualrevenue') as string
              };
              
              try {
                const method = companyDetailModal.company ? 'PATCH' : 'POST';
                const url = companyDetailModal.company 
                  ? `/api/admin/crm/companies/${companyDetailModal.company.id}`
                  : '/api/admin/crm/companies';
                  
                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(companyData)
                });
                
                if (response.ok) {
                  await fetchCompanies();
                  setCompanyDetailModal({ company: null, isOpen: false });
                } else {
                  console.error('Failed to save company');
                }
              } catch (error) {
                console.error('Error saving company:', error);
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
                  }}>Company Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={companyDetailModal.company?.name || ''}
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
                  }}>Domain</label>
                  <input
                    name="domain"
                    type="text"
                    defaultValue={companyDetailModal.company?.domain || ''}
                    placeholder="example.com"
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
                  }}>Industry</label>
                  <select
                    name="industry"
                    defaultValue={companyDetailModal.company?.industry || ''}
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Industry</option>
                    {industryOptions.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
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
                    defaultValue={companyDetailModal.company?.phone || ''}
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
                    defaultValue={companyDetailModal.company?.city || ''}
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
                    defaultValue={companyDetailModal.company?.state || ''}
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
                    defaultValue={companyDetailModal.company?.country || ''}
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
                  }}>Number of Employees</label>
                  <input
                    name="numberofemployees"
                    type="number"
                    defaultValue={companyDetailModal.company?.numberofemployees || ''}
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
                  }}>Annual Revenue</label>
                  <input
                    name="annualrevenue"
                    type="number"
                    defaultValue={companyDetailModal.company?.annualrevenue || ''}
                    placeholder="USD"
                    style={{
                      width: '100%',
                      padding: DesignSystem.spacing[2],
                      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                      borderRadius: DesignSystem.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: DesignSystem.spacing[4] }}>
                <label style={{
                  display: 'block',
                  marginBottom: DesignSystem.spacing[1],
                  fontSize: '14px',
                  fontWeight: 500
                }}>Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={companyDetailModal.company?.description || ''}
                  style={{
                    width: '100%',
                    padding: DesignSystem.spacing[2],
                    border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                    borderRadius: DesignSystem.borderRadius.md,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: DesignSystem.spacing[3]
              }}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setCompanyDetailModal({ company: null, isOpen: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  {companyDetailModal.company ? 'Update Company' : 'Create Company'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
