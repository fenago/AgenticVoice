'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Users, Clock, Timer, TrendingUp, TrendingDown, Zap, RefreshCw, AlertTriangle, CheckCircle, Clock10, MessageSquare, Calendar, Mic, Headphones } from 'lucide-react';
import { Card, CardHeader, CardContent, Skeleton, Alert, AlertDescription, AlertTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/app/admin/components/ui';
import UsageTrendsChart from '@/app/admin/components/UsageTrendsChart';
import CallDetailsModal from '@/app/admin/components/CallDetailsModal'; // Import the new modal component

// Interface for the overview statistics
interface VapiOverviewStats {
  totalCalls: number;
  totalCustomers: number;
  totalDurationMinutes: number;
  averageDurationMinutes: number;
  callSuccessRate: number;
  callFailureRate: number;
  averageCallSetupTimeSeconds: number;
}

// Interface for individual VAPI calls (extended for details)
interface VapiCall {
  id: string;
  phoneNumberId: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  createdAt: string;
  customer?: {
    number: string;
  };
  assistantId?: string;
  cost?: number;
  startedAt?: string;
  endedAt?: string;
  metadata?: {
    customer_id?: string;
    user_id?: string;
    billing_entity?: string;
    user_email?: string;
    user_name?: string;
    customer_name?: string;
    customer_email?: string;
    [key: string]: any;
  };
  assistant?: {
    id: string;
    name: string;
  };
  transcript?: { role: string; content: string }[];
}

// Component for individual stat cards
const StatCard = ({ title, value, icon: Icon, loading }: { title: string; value: string | number; icon: React.ElementType; loading: boolean; }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-3/4" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

interface CallLogTableProps {
  onRowClick: (callId: string) => void;
}

const CallLogTable: React.FC<CallLogTableProps> = ({ onRowClick }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [calls, setCalls] = useState<VapiCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVapiCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/vapi/calls');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch VAPI calls');
        }
        const data: VapiCall[] = await response.json();
        setCalls(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVapiCalls();
  }, []);

  if (loading || !isClient) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Calls</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (status: VapiCall['status']) => {
    switch (status) {
      case 'ended': return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Ended</Badge>;
      case 'in-progress': return <Badge variant="secondary"><Clock10 className="mr-1 h-3 w-3" />In Progress</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Assistant</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          <TableHead className="text-right">Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow key={call.id} onClick={() => onRowClick(call.id)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <TableCell>{getStatusBadge(call.status)}</TableCell>
            <TableCell className="font-mono text-xs">{call.assistant?.name || call.assistantId || 'N/A'}</TableCell>
            <TableCell className="font-mono text-xs">{call.metadata?.customer_name || call.customer?.number || 'N/A'}</TableCell>
            <TableCell>{formatDuration(call.createdAt, call.endedAt)}</TableCell>
            <TableCell className="text-right">{call.cost ? `$${call.cost.toFixed(4)}` : 'N/A'}</TableCell>
            <TableCell className="text-right">{isClient ? new Date(call.createdAt).toLocaleString() : ''}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onRowClick(call.id); }}>View Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function VapiDashboardPage() {
  const [stats, setStats] = useState<VapiOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (callId: string) => {
    setSelectedCallId(callId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCallId(null);
  };

  const fetchVapiStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/vapi/overview');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch VAPI overview data');
      }
      const data: VapiOverviewStats = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVapiStats();
  }, []);

  const statCards = stats ? [
    {
      title: 'Total Calls',
      value: stats.totalCalls.toLocaleString(),
      icon: Phone,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
    },
    {
      title: 'Total Duration (min)',
      value: stats.totalDurationMinutes.toLocaleString(),
      icon: Clock,
    },
    {
      title: 'Avg. Duration (min)',
      value: stats.averageDurationMinutes.toLocaleString(),
      icon: Timer,
    },
    {
      title: 'Call Success Rate',
      value: `${stats.callSuccessRate.toFixed(2)}%`,
      icon: TrendingUp,
    },
    {
      title: 'Call Failure Rate',
      value: `${stats.callFailureRate.toFixed(2)}%`,
      icon: TrendingDown,
    },
    {
      title: 'Avg. Setup Time (s)',
      value: stats.averageCallSetupTimeSeconds.toLocaleString(),
      icon: Zap,
    },
  ] : [];



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VAPI Dashboard</h1>
          <p className="text-muted-foreground">High-level overview of your VAPI integration.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVapiStats} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {(loading || !stats) ? (
          Array.from({ length: 7 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-4/5" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              loading={false}
            />
          ))
        )}
      </div>

      <UsageTrendsChart />

      {/* Detailed Call Log Table */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-medium">Recent Calls</h3>
        </CardHeader>
        <CardContent>
          <CallLogTable onRowClick={handleRowClick} />
        </CardContent>
      </Card>

      <CallDetailsModal
        callId={selectedCallId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
