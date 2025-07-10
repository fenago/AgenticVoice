'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  TrendingUp, 
  Calendar, 
  User, 
  Building2, 
  Target, 
  AlertCircle, 
  X, 
  Clock 
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { useSession } from 'next-auth/react';

interface Deal {
  id: string;
  dealname: string;
  amount?: string;
  closedate?: string;
  dealstage?: string;
  pipeline?: string;
  dealtype?: string;
  createdate?: string;
  lastmodifieddate?: string;
  hubspot_owner_id?: string;
  dealowner?: string;
  probability?: string;
  description?: string;
  company?: string;
  contact?: string;
  hs_priority?: string;
}

interface DealStage {
  id: string;
  label: string;
  probability: number;
  deals: Deal[];
}

interface FilterOptions {
  search: string;
  stage: string;
  owner: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function DealsPage() {
  const { data: session } = useSession();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealStages, setDealStages] = useState<DealStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    stage: '',
    owner: '',
    dateRange: 'all',
    sortBy: 'createdate',
    sortOrder: 'desc'
  });
  const [pipelineView, setPipelineView] = useState(true);
  const [dealDetailModal, setDealDetailModal] = useState<{ deal: Deal | null, isOpen: boolean }>({ deal: null, isOpen: false });
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Deal>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchDeals();
      fetchDealStages();
    }
  }, [session]);

  useEffect(() => {
    if (dealDetailModal.isOpen && dealDetailModal.deal) {
      setFormData(dealDetailModal.deal);
    } else {
      setFormData({});
    }
    setFormError(null);
  }, [dealDetailModal]);

  useEffect(() => {
    fetchDeals();
  }, [filters]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filters.search,
        stage: filters.stage,
        owner: filters.owner,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: '100'
      });

      const response = await fetch(`/api/admin/crm/deals?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`Failed to fetch deals: ${response.status}`);
      }

      const data = await response.json();
      setDeals(data.deals || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDealStages = async () => {
    try {
      const response = await fetch('/api/admin/crm/deal-stages');
      if (response.ok) {
        const data = await response.json();
        setDealStages(data.stages || []);
      }
    } catch (err) {
      console.error('Error fetching deal stages:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const isCreating = !dealDetailModal.deal?.id;
    const url = isCreating
      ? '/api/admin/crm/deals'
      : `/api/admin/crm/deals/${dealDetailModal.deal!.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save the deal.');
      }

      await fetchDeals();
      setDealDetailModal({ deal: null, isOpen: false });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDeal = () => {
    // Logic to open a create deal modal/form
    console.log('Create new deal');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDeals.length === 0) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/deals/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dealIds: selectedDeals })
      });

      if (response.ok) {
        await fetchDeals();
        setSelectedDeals([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Bulk action '${action}' failed`);
      }
    } catch (err) {
      console.error('Bulk action error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDeals = async () => {
    try {
      const response = await fetch('/api/admin/crm/deals?export=true');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deals-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '--';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString();
  };

  const getDealDisplayName = (deal: Deal) => {
    return deal.dealname || `Deal ${deal.id}`;
  };

  const organizeDealsByStage = () => {
    return dealStages.map(stage => ({
      ...stage,
      deals: deals.filter(deal => deal.dealstage === stage.id)
    }));
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const aValue = a[filters.sortBy as keyof Deal] || '';
    const bValue = b[filters.sortBy as keyof Deal] || '';
    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectDeal = (dealId: string, checked: boolean) => {
    setSelectedDeals(prev => 
      checked ? [...prev, dealId] : prev.filter(id => id !== dealId)
    );
  };



  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDeals(deals.map(d => d.id));
    } else {
      setSelectedDeals([]);
    }
  };

  // Style objects
  const tableHeaderStyle: React.CSSProperties = {
    padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
    textAlign: 'left',
    fontWeight: 500,
    color: DesignSystem.colors.neutral[600],
    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
    fontSize: '12px',
    textTransform: 'uppercase'
  };

  const tableRowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const tableCellStyle: React.CSSProperties = {
    padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[3]}`,
    verticalAlign: 'middle'
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
    borderRadius: DesignSystem.borderRadius.full,
    fontSize: '12px',
    fontWeight: 500
  };

  const modalOverlayStyle: React.CSSProperties = {
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
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: DesignSystem.borderRadius.md,
    border: `1px solid ${DesignSystem.colors.neutral[200]}`,
    padding: DesignSystem.spacing[3],
    marginBottom: DesignSystem.spacing[3],
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  const cardHeaderStyle: React.CSSProperties = {
    marginBottom: DesignSystem.spacing[2],
  };

  const cardContentStyle: React.CSSProperties = {
    marginBottom: DesignSystem.spacing[2],
  };

  const cardFooterStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing[6],
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  };

  const detailGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: DesignSystem.spacing[4]
  };

  const detailItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: DesignSystem.spacing[1]
  };

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
          <Typography variant="heading-lg">Deal Pipeline</Typography>
          <Typography variant="body-md" style={{ 
            color: DesignSystem.colors.neutral[600],
            marginTop: DesignSystem.spacing[1]
          }}>
            Manage your sales opportunities and pipeline
          </Typography>
        </div>
        
        <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
          <Button variant="outline" onClick={handleExportDeals}>
            <Download size={16} style={{ marginRight: DesignSystem.spacing[2] }} />
            Export
          </Button>
          <Button onClick={() => setDealDetailModal({ deal: null, isOpen: true })}>
            <Plus size={16} style={{ marginRight: DesignSystem.spacing[2] }} />
            Create Deal
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: DesignSystem.spacing[4] 
      }}>
        <div style={{ display: 'flex', gap: DesignSystem.spacing[2], alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: DesignSystem.colors.neutral[500] }} />
            <input 
              type="text"
              name="search"
              placeholder="Search deals..."
              value={filters.search}
              onChange={handleFilterChange}
              style={{
                paddingLeft: '36px',
                width: '100%',
                height: '38px',
                borderRadius: DesignSystem.borderRadius.md,
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                fontSize: '14px'
              }}
            />
          </div>
          <Button variant="outline">
            <Filter size={16} style={{ marginRight: DesignSystem.spacing[2] }} />
            Filters
          </Button>
        </div>
        <div style={{ display: 'flex', gap: DesignSystem.spacing[1], padding: DesignSystem.spacing[1], backgroundColor: DesignSystem.colors.neutral[200], borderRadius: DesignSystem.borderRadius.md }}>
          <button 
            onClick={() => setPipelineView(true)} 
            style={{
              padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[3]}`,
              border: 'none',
              backgroundColor: pipelineView ? 'white' : 'transparent',
              borderRadius: DesignSystem.borderRadius.sm,
              cursor: 'pointer',
              fontWeight: 500,
              color: pipelineView ? DesignSystem.colors.primary[600] : DesignSystem.colors.neutral[700]
            }}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setPipelineView(false)} 
            style={{
              padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[3]}`,
              border: 'none',
              backgroundColor: !pipelineView ? 'white' : 'transparent',
              borderRadius: DesignSystem.borderRadius.sm,
              cursor: 'pointer',
              fontWeight: 500,
              color: !pipelineView ? DesignSystem.colors.primary[600] : DesignSystem.colors.neutral[700]
            }}
          >
            List
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <div style={{ textAlign: 'center', padding: DesignSystem.spacing[8] }}>Loading deals...</div>}
      {error && 
        <div style={{ textAlign: 'center', padding: DesignSystem.spacing[8], color: DesignSystem.colors.error[500] }}>
          <AlertCircle style={{ marginBottom: DesignSystem.spacing[2] }} />
          <Typography variant="body-lg">{error}</Typography>
        </div>
      }

      {/* Pipeline View */}
      {!loading && !error && pipelineView && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dealStages.length > 0 ? dealStages.length : 1}, 1fr)`,
          gap: DesignSystem.spacing[4],
          overflowX: 'auto',
          padding: '2px'
        }}>
          {organizeDealsByStage().map((stage: DealStage) => (
            <div key={stage.id} style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: DesignSystem.colors.neutral[50],
              borderRadius: DesignSystem.borderRadius.lg,
              padding: DesignSystem.spacing[3],
              height: '100%'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: DesignSystem.spacing[4],
                paddingBottom: DesignSystem.spacing[3],
                borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
              }}>
                <Typography variant="heading-sm" style={{ color: DesignSystem.colors.neutral[800] }}>{stage.label}</Typography>
                <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[500] }}>
                  {formatCurrency(stage.deals.reduce((sum, deal) => sum + parseFloat(deal.amount || '0'), 0).toString())} ({stage.deals.length})
                </Typography>
              </div>
              <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: '400px' }}>
                {stage.deals.map((deal: Deal) => (
                  <div key={deal.id} style={cardStyle} onClick={() => setDealDetailModal({ deal, isOpen: true })}>
                    <div style={cardHeaderStyle}>
                      <Typography variant="body-md" style={{ fontWeight: DesignSystem.typography.fontWeight.bold }}>{getDealDisplayName(deal)}</Typography>
                    </div>
                    <div style={cardContentStyle}>
                      <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
                        {formatCurrency(deal.amount)}
                      </Typography>
                      <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[500] }}>
                        {deal.company || 'No Company'}
                      </Typography>
                    </div>
                    <div style={cardFooterStyle}>
                      <span style={{...tagStyle, backgroundColor: DesignSystem.colors.primary[100], color: DesignSystem.colors.primary[700]}}>
                        {dealStages.find(s => s.id === deal.dealstage)?.label || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && !error && !pipelineView && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}><input type="checkbox" onChange={handleSelectAll} checked={selectedDeals.length === deals.length && deals.length > 0} /></th>
                <th style={tableHeaderStyle}>Deal Name</th>
                <th style={tableHeaderStyle}>Amount</th>
                <th style={tableHeaderStyle}>Stage</th>
                <th style={tableHeaderStyle}>Close Date</th>
                <th style={tableHeaderStyle}>Owner</th>
                <th style={tableHeaderStyle}>Company</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal: Deal) => (
                <tr key={deal.id} style={tableRowStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DesignSystem.colors.neutral[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => setDealDetailModal({ deal, isOpen: true })}>
                  <td style={tableCellStyle}><input type="checkbox" checked={selectedDeals.includes(deal.id)} onChange={(e) => handleSelectDeal(deal.id, e.target.checked)} onClick={(e) => e.stopPropagation()} /></td>
                  <td style={tableCellStyle}>{getDealDisplayName(deal)}</td>
                  <td style={tableCellStyle}>{formatCurrency(deal.amount)}</td>
                  <td style={tableCellStyle}><span style={{...tagStyle, backgroundColor: DesignSystem.colors.primary[100], color: DesignSystem.colors.primary[700]}}>{dealStages.find(s => s.id === deal.dealstage)?.label || 'Unknown'}</span></td>
                  <td style={tableCellStyle}>{formatDate(deal.closedate)}</td>
                  <td style={tableCellStyle}>{deal.dealowner || 'Unassigned'}</td>
                  <td style={tableCellStyle}>{deal.company || 'N/A'}</td>
                  <td style={tableCellStyle}><Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); console.log('Edit deal', deal.id)}}><MoreHorizontal size={16} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    
      {/* Deal Create/Edit Modal */}
      {dealDetailModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`, paddingBottom: DesignSystem.spacing[3], marginBottom: DesignSystem.spacing[4] }}>
                <Typography variant="heading-md">{dealDetailModal.deal ? 'Edit Deal' : 'Create New Deal'}</Typography>
                <Button variant="outline" size="sm" onClick={() => setDealDetailModal({ deal: null, isOpen: false })} disabled={isSubmitting}>
                  <X size={20} />
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: DesignSystem.spacing[4], marginBottom: DesignSystem.spacing[4] }}>
                <div>
                  <label htmlFor="dealname" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Deal Name</label>
                  <input id="dealname" name="dealname" type="text" value={formData.dealname || ''} onChange={handleFormChange} required style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }} />
                </div>
                <div>
                  <label htmlFor="amount" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Amount (USD)</label>
                  <input id="amount" name="amount" type="number" step="0.01" value={formData.amount || ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }} />
                </div>
                <div>
                  <label htmlFor="closedate" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Close Date</label>
                  <input id="closedate" name="closedate" type="date" value={formData.closedate ? new Date(formData.closedate).toISOString().split('T')[0] : ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }} />
                </div>
                <div>
                  <label htmlFor="dealstage" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Deal Stage</label>
                  <select id="dealstage" name="dealstage" value={formData.dealstage || ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }}>
                    <option value="">Select Stage</option>
                    {dealStages.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
                  </select>
                </div>
                 <div>
                  <label htmlFor="company" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Company</label>
                  <input id="company" name="company" type="text" value={formData.company || ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }} />
                </div>
                <div>
                  <label htmlFor="contact" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Contact</label>
                  <input id="contact" name="contact" type="text" value={formData.contact || ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ marginBottom: DesignSystem.spacing[4] }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: DesignSystem.spacing[1], fontSize: '14px', fontWeight: 500 }}>Description</label>
                <textarea id="description" name="description" rows={4} value={formData.description || ''} onChange={handleFormChange} style={{ width: '100%', padding: DesignSystem.spacing[2], border: `1px solid ${DesignSystem.colors.neutral[300]}`, borderRadius: DesignSystem.borderRadius.md, fontSize: '14px', resize: 'vertical' }} />
              </div>

              {formError && (
                <div style={{ color: DesignSystem.colors.error[500], backgroundColor: DesignSystem.colors.error[50], padding: DesignSystem.spacing[3], borderRadius: DesignSystem.borderRadius.md, marginBottom: DesignSystem.spacing[4], textAlign: 'center' }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: DesignSystem.spacing[3] }}>
                <Button variant="outline" type="button" onClick={() => setDealDetailModal({ deal: null, isOpen: false })} disabled={isSubmitting}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (dealDetailModal.deal ? 'Update Deal' : 'Create Deal')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
