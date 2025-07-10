'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/admin/components/ui';
import { Skeleton } from '@/app/admin/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/app/admin/components/ui';
import { AlertTriangle, Info, Clock, DollarSign, User, Mail, Phone, MessageSquare, Calendar, Mic, Headphones, X } from 'lucide-react';

interface VapiCallDetails {
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

interface CallDetailsModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({ callId, isOpen, onClose }) => {
  const [callDetails, setCallDetails] = useState<VapiCallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !callId) {
      setCallDetails(null);
      setLoading(true);
      setError(null);
      return;
    }

    const fetchCallDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/vapi/calls/${callId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch call details');
        }
        const data: VapiCallDetails = await response.json();
        setCallDetails(data);
      } catch (err: any) {
        console.error('Error fetching call details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId, isOpen]);

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

        return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Call Details: {callId?.substring(0, 8)}...</DialogTitle>
          <DialogDescription>
            Comprehensive information about this VAPI call.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {loading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {callDetails && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center"><Info className="mr-2 h-4 w-4" />General Info</h4>
              <p><strong>Status:</strong> {callDetails.status}</p>
              <p><strong>Assistant:</strong> {callDetails.assistant?.name || callDetails.assistantId || 'N/A'}</p>
              <p><strong>Phone Number:</strong> {callDetails.customer?.number || callDetails.phoneNumberId || 'N/A'}</p>
              <p className="flex items-center"><Calendar className="mr-2 h-4 w-4" /><strong>Created At:</strong> {formatDateTime(callDetails.createdAt)}</p>
              <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /><strong>Duration:</strong> {formatDuration(callDetails.startedAt, callDetails.endedAt)}</p>
              <p className="flex items-center"><DollarSign className="mr-2 h-4 w-4" /><strong>Cost:</strong> {callDetails.cost ? `$${callDetails.cost.toFixed(4)}` : 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center"><User className="mr-2 h-4 w-4" />Customer/User Info</h4>
              <p><strong>Customer Name:</strong> {callDetails.metadata?.customer_name || 'N/A'}</p>
              <p className="flex items-center"><Mail className="mr-2 h-4 w-4" /><strong>Customer Email:</strong> {callDetails.metadata?.customer_email || 'N/A'}</p>
              <p className="flex items-center"><User className="mr-2 h-4 w-4" /><strong>User ID:</strong> {callDetails.metadata?.user_id || 'N/A'}</p>
              <p className="flex items-center"><User className="mr-2 h-4 w-4" /><strong>Customer ID:</strong> {callDetails.metadata?.customer_id || 'N/A'}</p>
            </div>

            {callDetails.transcript && (
              <div className="md:col-span-2 space-y-2">
                <h4 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Transcript</h4>
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                  {Array.isArray(callDetails.transcript) ? (
                    callDetails.transcript.map((line, index) => (
                      <p key={index} className={`text-sm ${line.role === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}>
                        <strong>{line.role === 'user' ? 'User' : 'Assistant'}:</strong> {line.content}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Transcript format not recognized or empty</p>
                  )}
                </div>
              </div>
            )}

            {callDetails.metadata && Object.keys(callDetails.metadata).length > 0 && (
              <div className="md:col-span-2 space-y-2">
                <h4 className="font-semibold flex items-center"><Info className="mr-2 h-4 w-4" />Raw Metadata</h4>
                <pre className="max-h-40 overflow-y-auto text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                  {JSON.stringify(callDetails.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CallDetailsModal;
