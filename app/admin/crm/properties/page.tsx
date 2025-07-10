'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Settings, Plus, Search, Filter, BarChart3, Edit, Trash2, 
  Eye, ChevronDown, Users, Building, Calendar, Phone, Mail, 
  Hash, Type, Check, List, Globe, Tag
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'email' | 'phone' | 'url';
  group: string;
  objectType: 'contacts' | 'companies' | 'deals' | 'tickets';
  required: boolean;
  fillRate: number;
  usageCount: number;
  description?: string;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyGroup {
  id: string;
  name: string;
  objectType: string;
  propertyCount: number;
  description?: string;
}

export default function PropertiesManagerPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjectType, setSelectedObjectType] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Create Property form state
  const [newProperty, setNewProperty] = useState({
    name: '',
    label: '',
    type: 'text' as 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'email' | 'phone' | 'url',
    objectType: 'contacts' as 'contacts' | 'companies' | 'deals' | 'tickets',
    group: '',
    description: '',
    required: false,
    options: [] as string[]
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole || '')) {
      setError('Access denied. Insufficient permissions.');
      return;
    }

    fetchProperties();
    fetchPropertyGroups();
  }, [session, status]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      } else {
        throw new Error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyGroups = async () => {
    try {
      const response = await fetch('/api/admin/crm/properties/groups');
      if (response.ok) {
        const data = await response.json();
        setPropertyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching property groups:', error);
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObjectType = selectedObjectType === 'all' || property.objectType === selectedObjectType;
    const matchesGroup = selectedGroup === 'all' || property.group === selectedGroup;
    const matchesType = selectedType === 'all' || property.type === selectedType;
    
    return matchesSearch && matchesObjectType && matchesGroup && matchesType;
  });

  // Property type icons
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={16} />;
      case 'number': return <Hash size={16} />;
      case 'date': return <Calendar size={16} />;
      case 'dropdown': return <List size={16} />;
      case 'checkbox': return <Check size={16} />;
      case 'email': return <Mail size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'url': return <Globe size={16} />;
      default: return <Tag size={16} />;
    }
  };

  // Object type icons
  const getObjectTypeIcon = (objectType: string) => {
    switch (objectType) {
      case 'contacts': return <Users size={16} />;
      case 'companies': return <Building size={16} />;
      case 'deals': return <BarChart3 size={16} />;
      case 'tickets': return <Settings size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/crm/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      } else {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    
    try {
      const response = await fetch('/api/admin/crm/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty)
      });
      
      if (response.ok) {
        const createdProperty = await response.json();
        setProperties(prev => [...prev, createdProperty]);
        setShowCreateModal(false);
        setNewProperty({
          name: '',
          label: '',
          type: 'text',
          objectType: 'contacts',
          group: '',
          description: '',
          required: false,
          options: []
        });
      } else {
        throw new Error('Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property');
    } finally {
      setCreateLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={32} color="#3b82f6" />
              Properties Manager
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              Manage custom fields and properties across your CRM objects
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: showAnalytics ? '#3b82f6' : '#f3f4f6',
                color: showAnalytics ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Tag size={16} />
              Manage Groups
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Create Property
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Tag size={16} color="#3b82f6" />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total Properties</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{properties.length}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={16} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Contact Properties</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {properties.filter(p => p.objectType === 'contacts').length}
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Building size={16} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Company Properties</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {properties.filter(p => p.objectType === 'companies').length}
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BarChart3 size={16} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Avg Fill Rate</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + p.fillRate, 0) / properties.length) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Property Analytics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Most Used Properties */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '12px' }}>MOST USED PROPERTIES</h4>
              {properties
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5)
                .map(property => (
                  <div key={property.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getPropertyTypeIcon(property.type)}
                      <span style={{ fontSize: '14px', color: '#111827' }}>{property.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{property.usageCount}</span>
                  </div>
                ))}
            </div>

            {/* Highest Fill Rates */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '12px' }}>HIGHEST FILL RATES</h4>
              {properties
                .sort((a, b) => b.fillRate - a.fillRate)
                .slice(0, 5)
                .map(property => (
                  <div key={property.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getPropertyTypeIcon(property.type)}
                      <span style={{ fontSize: '14px', color: '#111827' }}>{property.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: property.fillRate > 80 ? '#10b981' : property.fillRate > 50 ? '#f59e0b' : '#ef4444', fontWeight: '500' }}>
                      {property.fillRate}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Object Type Filter */}
          <select
            value={selectedObjectType}
            onChange={(e) => setSelectedObjectType(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Objects</option>
            <option value="contacts">Contacts</option>
            <option value="companies">Companies</option>
            <option value="deals">Deals</option>
            <option value="tickets">Tickets</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Groups</option>
            {propertyGroups.map(group => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="dropdown">Dropdown</option>
            <option value="checkbox">Checkbox</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="url">URL</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Property
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Object
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Group
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Fill Rate
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Usage
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property, index) => (
                <tr key={property.id} style={{ borderTop: index > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                        {property.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {property.name}
                        {property.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getPropertyTypeIcon(property.type)}
                      <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                        {property.type}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getObjectTypeIcon(property.objectType)}
                      <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                        {property.objectType}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{property.group}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${property.fillRate}%`,
                          height: '100%',
                          backgroundColor: property.fillRate > 80 ? '#10b981' : property.fillRate > 50 ? '#f59e0b' : '#ef4444',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        {property.fillRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{property.usageCount}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditProperty(property)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Edit Property"
                      >
                        <Edit size={14} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Delete Property"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProperties.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            {searchTerm || selectedObjectType !== 'all' || selectedGroup !== 'all' || selectedType !== 'all' 
              ? 'No properties match your current filters.' 
              : 'No properties found.'}
          </div>
        )}
      </div>

      {/* Create Property Modal */}
      {showCreateModal && (
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
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>Create New Property</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Property Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Property Name *</label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                  placeholder="e.g., custom_priority"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Property Label */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Display Label *</label>
                <input
                  type="text"
                  value={newProperty.label}
                  onChange={(e) => setNewProperty({ ...newProperty, label: e.target.value })}
                  placeholder="e.g., Customer Priority"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Property Type */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Property Type *</label>
                <select
                  value={newProperty.type}
                  onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'email' | 'phone' | 'url' })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select Type</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="url">URL</option>
                </select>
              </div>

              {/* Object Type */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Object Type *</label>
                <select
                  value={newProperty.objectType}
                  onChange={(e) => setNewProperty({ ...newProperty, objectType: e.target.value as 'contacts' | 'companies' | 'deals' | 'tickets' })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select Object</option>
                  <option value="contacts">Contacts</option>
                  <option value="companies">Companies</option>
                  <option value="deals">Deals</option>
                  <option value="tickets">Tickets</option>
                </select>
              </div>

              {/* Group Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Property Group</label>
                <select
                  value={newProperty.group}
                  onChange={(e) => setNewProperty({ ...newProperty, group: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select Group</option>
                  {propertyGroups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                  placeholder="Brief description of this property..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Options for Dropdown */}
              {newProperty.type === 'dropdown' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Dropdown Options</label>
                  <textarea
                    value={newProperty.options.join('\n')}
                    onChange={(e) => setNewProperty({ ...newProperty, options: e.target.value.split('\n').filter(opt => opt.trim()) })}
                    placeholder="Enter options, one per line:\nOption 1\nOption 2\nOption 3"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Required Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="required"
                  checked={newProperty.required}
                  onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
                  style={{ margin: 0 }}
                />
                <label htmlFor="required" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>Required property</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newProperty.name || !newProperty.label || !newProperty.type || !newProperty.objectType}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: (!newProperty.name || !newProperty.label || !newProperty.type || !newProperty.objectType) ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!newProperty.name || !newProperty.label || !newProperty.type || !newProperty.objectType) ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Groups Modal */}
      {showGroupModal && (
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
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>Manage Property Groups</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: '#374151' }}>Existing Groups</h4>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {propertyGroups.map(group => (
                  <div key={group.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{group.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{group.description}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{group.propertyCount} properties</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                <strong>Coming Soon:</strong> Create new property groups and organize your custom fields. This feature will integrate with HubSpot's Property Groups API.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowGroupModal(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
