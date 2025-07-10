'use client';

import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  company?: string;
}

interface SimpleContactSearchProps {
  onContactSelect: (contactId: string, contactName: string) => void;
  error?: string;
  placeholder?: string;
  value?: string;
}

export default function SimpleContactSearch({ 
  onContactSelect, 
  error, 
  placeholder = "Search contacts...",
  value = ""
}: SimpleContactSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial contacts and handle search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Always search - empty query returns recent contacts
        const url = `/api/admin/crm/contacts/search?q=${encodeURIComponent(searchTerm)}&limit=10`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        } else {
          console.error('Search failed:', response.status);
          setContacts([]);
        }
      } catch (error) {
        console.error('Contact search error:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    }, searchTerm ? 300 : 0); // No delay for initial load

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load initial contacts on mount
  useEffect(() => {
    if (!searchTerm) {
      setLoading(true);
      fetch('/api/admin/crm/contacts/search?limit=10')
        .then(response => response.ok ? response.json() : null)
        .then(data => setContacts(data?.contacts || []))
        .catch(() => setContacts([]))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleContactClick = (contact: Contact) => {
    setSearchTerm(contact.fullName);
    setIsOpen(false);
    onContactSelect(contact.id, contact.fullName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true); // Always open when typing
    
    // Clear selection if input is cleared
    if (!value) {
      onContactSelect('', '');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 40px 12px 12px',
            border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white'
          }}
        />
        <Search size={16} style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#6b7280'
        }} />
      </div>
      
      {/* Dropdown */}
      {isOpen && (loading || contacts.length > 0) && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          {loading ? (
            <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
              Searching...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
              No contacts found
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} />
                  {contact.fullName}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '22px' }}>
                  {contact.email} {contact.company ? `• ${contact.company}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {error && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
