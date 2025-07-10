'use client';

import { useEffect, useState } from 'react';

interface ClientSafeDateProps {
  date: string | Date | null;
  format?: 'date' | 'datetime';
  fallback?: string;
}

export default function ClientSafeDate({ 
  date, 
  format = 'date', 
  fallback = 'N/A' 
}: ClientSafeDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>(fallback);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (date) {
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          setFormattedDate(fallback);
        } else {
          const formatted = format === 'datetime' 
            ? dateObj.toLocaleString() 
            : dateObj.toLocaleDateString();
          setFormattedDate(formatted);
        }
      } catch (error) {
        setFormattedDate(fallback);
      }
    } else {
      setFormattedDate(fallback);
    }
  }, [date, format, fallback]);

  // Return fallback during SSR to prevent hydration mismatch
  if (!isMounted) {
    return <span>{fallback}</span>;
  }

  return <span>{formattedDate}</span>;
}
