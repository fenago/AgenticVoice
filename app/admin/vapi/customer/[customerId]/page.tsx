'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Bot, Clock, DollarSign, Calendar, Mail } from 'lucide-react';
import { VapiAssistant, VapiCall } from '@/libs/vapi';
import { Heading, Text, Button, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/app/admin/components/ui';

interface VapiCustomerDetails {
  id: string;
  name: string;
  email: string;
  totalCalls: number;
  totalCost: number;
  totalDuration: number;
  averageCallDuration: number;
  firstCallDate?: string;
  lastCallDate?: string;
  assistantsList: VapiAssistant[];
  callsList: VapiCall[];
}

const MetricCard = ({ icon: Icon, title, value, subtext }: { icon: React.ElementType, title: string, value: string | number, subtext?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Heading level={4} className="text-sm font-medium">{title}</Heading>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </CardContent>
  </Card>
);

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;

  const [customer, setCustomer] = useState<VapiCustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/vapi/customer/${customerId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch customer data');
        }
        const data = await response.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Heading level={4}>Loading Customer Details...</Heading></div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center text-red-500"><Heading level={4}>Error: {error}</Heading></div>;
  }

  if (!customer) {
    return <div className="flex h-full items-center justify-center"><Heading level={4}>Customer not found.</Heading></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin/vapi" className="flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to VAPI Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <User className="h-12 w-12 text-muted-foreground" />
          <div>
            <Heading level={2} className="font-bold">{customer.name}</Heading>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
            </div>
            <Text size="sm" color="muted">Customer ID: {customer.id}</Text>
          </div>
        </div>
      </div>

      <Heading level={4} className="mb-4">Customer Overview</Heading>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard icon={Phone} title="Total Calls" value={customer.totalCalls} />
        <MetricCard icon={DollarSign} title="Total Cost" value={`$${customer.totalCost.toFixed(2)}`} />
        <MetricCard icon={Clock} title="Total Duration" value={`${customer.totalDuration} min`} />
        <MetricCard icon={Clock} title="Avg. Call Duration" value={`${customer.averageCallDuration} min`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><Heading level={4}>Activity Period</Heading></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Text size="sm" color="muted">First Call</Text>
              <Text size="sm">{customer.firstCallDate ? new Date(customer.firstCallDate).toLocaleDateString() : 'N/A'}</Text>
            </div>
            <div className="flex items-center justify-between">
              <Text size="sm" color="muted">Last Call</Text>
              <Text size="sm">{customer.lastCallDate ? new Date(customer.lastCallDate).toLocaleDateString() : 'N/A'}</Text>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Heading level={4} className="mb-4">Assistants ({customer.assistantsList.length})</Heading>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Voice</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.assistantsList.length > 0 ? customer.assistantsList.map(assistant => (
                <TableRow key={assistant.id}>
                  <TableCell className="font-medium">{assistant.name}</TableCell>
                  <TableCell>{`${assistant.model.provider} / ${assistant.model.model}`}</TableCell>
                  <TableCell>{`${assistant.voice.provider} / ${assistant.voice.voiceId}`}</TableCell>
                  <TableCell>{new Date(assistant.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center">No assistants found for this customer.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div>
        <Heading level={4} className="mb-4">Recent Calls ({customer.callsList.length})</Heading>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Assistant</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration (sec)</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.callsList.length > 0 ? customer.callsList.map(call => (
                <TableRow key={call.id}>
                  <TableCell><Badge variant={call.status === 'ended' ? 'success' : 'secondary'}>{call.status}</Badge></TableCell>
                  <TableCell>{call.assistant?.name || call.assistantId}</TableCell>
                  <TableCell>{call.startedAt ? new Date(call.startedAt).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{call.startedAt && call.endedAt ? ((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000).toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>${(call.cost || 0).toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center">No calls found for this customer.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

    </div>
  );
}
