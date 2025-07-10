'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Skeleton, Alert, AlertTitle, AlertDescription } from '@/app/admin/components/ui';
import { User, Users, AlertTriangle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  totalCalls: number;
}

interface CustomerListTableProps {
  onCustomerSelect: (customerId: string | null) => void;
}

export const CustomerListTable: React.FC<CustomerListTableProps> = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/vapi/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerClick = (customerId: string) => {
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(null);
      onCustomerSelect(null); // Deselect
    } else {
      setSelectedCustomerId(customerId);
      onCustomerSelect(customerId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="text-center">Total Calls</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow 
            key={customer.id} 
            onClick={() => handleCustomerClick(customer.id)}
            className={`cursor-pointer ${selectedCustomerId === customer.id ? 'bg-muted/50' : ''}`}
          >
            <TableCell>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{customer.name}</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{customer.id}</p>
            </TableCell>
            <TableCell className="text-center">{customer.totalCalls}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant={selectedCustomerId === customer.id ? 'secondary' : 'outline'} 
                size="sm"
              >
                {selectedCustomerId === customer.id ? 'Clear Filter' : 'View Calls'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
