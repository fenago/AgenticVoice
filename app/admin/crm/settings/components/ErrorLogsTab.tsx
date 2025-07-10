import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: 'error' | 'warning' | 'info';
  category: 'sync' | 'webhook' | 'api' | 'validation';
  service: string;
  message: string;
  details?: string;
  resolved: boolean;
  userId?: string;
  retryCount: number;
}

const ErrorLogsTab: React.FC = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    {
      id: '1',
      timestamp: new Date('2025-07-05T18:45:00Z'),
      severity: 'error',
      category: 'sync',
      service: 'HubSpot Contact Sync',
      message: 'Failed to sync contact: Invalid email format',
      details: 'Contact john.doe@invalid-email attempted sync but email validation failed',
      resolved: false,
      userId: 'user123',
      retryCount: 3
    },
    {
      id: '2',
      timestamp: new Date('2025-07-05T18:30:00Z'),
      severity: 'warning',
      category: 'webhook',
      service: 'Deal Pipeline Webhook',
      message: 'Webhook delivery failed - 5xx server error',
      details: 'HTTP 502 Bad Gateway error when sending webhook payload',
      resolved: true,
      retryCount: 2
    },
    {
      id: '3',
      timestamp: new Date('2025-07-05T18:15:00Z'),
      severity: 'error',
      category: 'api',
      service: 'HubSpot API',
      message: 'Rate limit exceeded',
      details: 'API request rate limit of 100 req/10s exceeded',
      resolved: true,
      retryCount: 0
    },
    {
      id: '4',
      timestamp: new Date('2025-07-05T17:45:00Z'),
      severity: 'warning',
      category: 'validation',
      service: 'Data Mapping',
      message: 'Missing required field mapping',
      details: 'Required field "company" not mapped for contact sync',
      resolved: false,
      userId: 'user456',
      retryCount: 1
    }
  ]);

  const [filters, setFilters] = useState({
    severity: 'all',
    category: 'all',
    resolved: 'all',
    search: ''
  });

  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle size={16} color={DesignSystem.colors.error} />;
      case 'warning':
        return <AlertTriangle size={16} color={DesignSystem.colors.warning} />;
      case 'info':
        return <AlertCircle size={16} color={DesignSystem.colors.info} />;
      default:
        return <AlertCircle size={16} color={DesignSystem.colors.neutral[600]} />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error':
        return DesignSystem.colors.error;
      case 'warning':
        return DesignSystem.colors.warning;
      case 'info':
        return DesignSystem.colors.info;
      default:
        return DesignSystem.colors.neutral[600];
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'sync':
        return DesignSystem.colors.error;
      case 'webhook':
        return DesignSystem.colors.warning;
      case 'api':
        return DesignSystem.colors.info;
      default:
        return DesignSystem.colors.neutral[600];
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'resolved':
        return DesignSystem.colors.success;
      case 'investigating':
        return DesignSystem.colors.secondary[400];
      case 'pending':
        return DesignSystem.colors.warning;
      case 'unresolved':
        return DesignSystem.colors.error;
      default:
        return DesignSystem.colors.neutral[600];
    }
  };

  const filteredLogs = errorLogs
    .filter(log => {
      if (filters.severity !== 'all' && log.severity !== filters.severity) return false;
      if (filters.category !== 'all' && log.category !== filters.category) return false;
      if (filters.resolved !== 'all') {
        const isResolved = filters.resolved === 'resolved';
        if (log.resolved !== isResolved) return false;
      }
      if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortBy === 'severity') {
        const severityOrder = { error: 3, warning: 2, info: 1 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const markAsResolved = (logId: string) => {
    setErrorLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, resolved: true } : log
    ));
  };

  const retryOperation = (logId: string) => {
    // Mock retry logic
    console.log(`Retrying operation for log ${logId}`);
  };

  const clearResolvedLogs = () => {
    setErrorLogs(prev => prev.filter(log => !log.resolved));
  };

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      severity: log.severity,
      category: log.category,
      service: log.service,
      message: log.message,
      details: log.details,
      resolved: log.resolved,
      retryCount: log.retryCount
    }));
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="error-logs-tab">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[8]
      }}>
        <div>
          <Typography variant="heading-lg" style={{ color: DesignSystem.colors.neutral[900] }}>
            Error Logs
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Monitor and troubleshoot synchronization issues
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: DesignSystem.spacing[4] }}>
          <Button
            variant="secondary"
            onClick={clearResolvedLogs}
            style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[4] }}
          >
            <Trash2 size={16} />
            Clear Resolved
          </Button>
          <Button
            variant="primary"
            onClick={exportLogs}
            style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[4] }}
          >
            <Download size={16} />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: DesignSystem.spacing[6],
        marginBottom: DesignSystem.spacing[8]
      }}>
        <Card style={{ padding: DesignSystem.spacing[6], textAlign: 'center' }}>
          <Typography variant="heading-md" style={{ color: DesignSystem.colors.error }}>
            {errorLogs.filter(log => log.severity === 'error').length}
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Errors
          </Typography>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[6], textAlign: 'center' }}>
          <Typography variant="heading-md" style={{ color: DesignSystem.colors.warning }}>
            {errorLogs.filter(log => log.severity === 'warning').length}
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Warnings
          </Typography>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[6], textAlign: 'center' }}>
          <Typography variant="heading-md" style={{ color: DesignSystem.colors.success }}>
            {errorLogs.filter(log => log.resolved).length}
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Resolved
          </Typography>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[6], textAlign: 'center' }}>
          <Typography variant="heading-md" style={{ color: DesignSystem.colors.neutral[900] }}>
            {errorLogs.filter(log => !log.resolved).length}
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            Open Issues
          </Typography>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{
        padding: DesignSystem.spacing[6],
        marginBottom: DesignSystem.spacing[6]
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: DesignSystem.spacing[6],
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
              Search Messages
            </Typography>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search error messages..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{
                  width: '100%',
                  padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[4]}`,
                  fontSize: '14px',
                  paddingLeft: '40px',
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: '6px',
                  backgroundColor: DesignSystem.colors.neutral[50]
                }}
              />
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: DesignSystem.spacing[4],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: DesignSystem.colors.neutral[600]
                }}
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
              Severity
            </Typography>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              style={{
                width: '100%',
                padding: DesignSystem.spacing[4],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: '6px',
                backgroundColor: DesignSystem.colors.neutral[50]
              }}
            >
              <option value="all">All Severities</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
              Category
            </Typography>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={{
                width: '100%',
                padding: DesignSystem.spacing[4],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: '6px',
                backgroundColor: DesignSystem.colors.neutral[50]
              }}
            >
              <option value="all">All Categories</option>
              <option value="sync">Sync</option>
              <option value="webhook">Webhook</option>
              <option value="api">API</option>
              <option value="validation">Validation</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
              Status
            </Typography>
            <select
              value={filters.resolved}
              onChange={(e) => setFilters(prev => ({ ...prev, resolved: e.target.value }))}
              style={{
                width: '100%',
                padding: DesignSystem.spacing[4],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: '6px',
                backgroundColor: DesignSystem.colors.neutral[50]
              }}
            >
              <option value="all">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="open">Open</option>
            </select>
          </div>

          {/* Sort Options */}
          <div style={{ display: 'flex', gap: DesignSystem.spacing[4] }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy(sortBy === 'timestamp' ? 'severity' : 'timestamp')}
              style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
            >
              <ArrowUpDown size={16} />
              Sort by {sortBy === 'timestamp' ? 'Time' : 'Severity'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[4] }}>
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            style={{
              padding: DesignSystem.spacing[6],
              border: `1px solid ${DesignSystem.colors.neutral[300]}`,
              borderLeft: `4px solid ${getSeverityColor(log.severity)}`,
              opacity: log.resolved ? 0.7 : 1
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: DesignSystem.spacing[6]
            }}>
              <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignSystem.spacing[4],
                  marginBottom: DesignSystem.spacing[2]
                }}>
                  {getSeverityIcon(log.severity)}
                  <Typography variant="heading-md" style={{ color: DesignSystem.colors.neutral[900] }}>
                    {log.message}
                  </Typography>
                  <span style={{
                    backgroundColor: getCategoryColor(log.category),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: DesignSystem.borderRadius.sm,
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'uppercase'
                  }}>
                    {log.category}
                  </span>
                  {log.resolved && (
                    <CheckCircle size={16} color={DesignSystem.colors.success} />
                  )}
                </div>

                {/* Service and Timestamp */}
                <div style={{
                  display: 'flex', 
                  gap: DesignSystem.spacing[8], 
                  padding: DesignSystem.spacing[4],
                  marginBottom: DesignSystem.spacing[4]
                }}>
                  <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
                    <strong>Service:</strong> {log.service}
                  </Typography>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: DesignSystem.spacing[2]
                  }}>
                    <Clock size={14} color={DesignSystem.colors.neutral[600]} />
                    <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
                      {log.timestamp.toLocaleString()}
                    </Typography>
                  </div>
                  {log.retryCount > 0 && (
                    <Typography variant="body-sm" style={{ color: DesignSystem.colors.warning }}>
                      Retries: {log.retryCount}
                    </Typography>
                  )}
                </div>

                {/* Details */}
                {log.details && (
                  <div style={{
                    backgroundColor: DesignSystem.colors.neutral[50],
                    padding: DesignSystem.spacing[4],
                    borderRadius: DesignSystem.borderRadius.sm,
                    marginTop: DesignSystem.spacing[4]
                  }}>
                    <Typography variant="body-sm" style={{
                      color: DesignSystem.colors.neutral[600],
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }}>
                      {log.details}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: DesignSystem.spacing[4] }}>
                {!log.resolved && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryOperation(log.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
                    >
                      <RefreshCw size={14} />
                      Retry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsResolved(log.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
                    >
                      <CheckCircle size={14} />
                      Resolve
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <Eye size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card style={{
          padding: DesignSystem.spacing[8],
          textAlign: 'center'
        }}>
          <CheckCircle size={48} color={DesignSystem.colors.success} style={{ margin: '0 auto 16px' }} />
          <Typography variant="heading-lg" style={{ color: DesignSystem.colors.neutral[900], marginBottom: DesignSystem.spacing[4] }}>
            No Error Logs Found
          </Typography>
          <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[600] }}>
            {Object.values(filters).some(f => f !== 'all' && f !== '') 
              ? 'No logs match your current filters.'
              : 'All systems are running smoothly!'}
          </Typography>
        </Card>
      )}
    </div>
  );
};

export default ErrorLogsTab;
