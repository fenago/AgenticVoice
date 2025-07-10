'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent, Skeleton, Alert, AlertDescription, AlertTitle } from './ui';

interface TrendData {
  date: string;
  calls: number;
  cost: number;
}

const UsageTrendsChart = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/vapi/trends');
        if (!response.ok) {
          throw new Error('Failed to fetch trends data');
        }
        const trends = await response.json();
        setData(trends);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>Usage Trends</CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>Usage & Cost Trends (Last 30 Days)</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="calls" orientation="left" stroke="#82ca9d" />
            <YAxis yAxisId="cost" orientation="right" stroke="#8884d8" />
            <Tooltip formatter={(value, name) => {
              if (name === 'cost') return [`$${(value as number).toFixed(2)}`, 'Cost'];
              if (name === 'calls') return [value, 'Calls'];
              return [value, name];
            }} />
            <Legend />
            <Bar yAxisId="calls" dataKey="calls" fill="#82ca9d" name="Calls" />
            <Bar yAxisId="cost" dataKey="cost" fill="#8884d8" name="Cost" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UsageTrendsChart;
