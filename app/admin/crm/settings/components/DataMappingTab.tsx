import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface DataMapping {
  hubspotProperty: string;
  agenticVoiceField: string;
  direction: 'to_hubspot' | 'to_agenticvoice' | 'bidirectional';
  transformFunction?: string;
  isRequired: boolean;
}

interface DataMappingTabProps {
  dataMappings: DataMapping[];
  setDataMappings: React.Dispatch<React.SetStateAction<DataMapping[]>>;
  saveSettings: (section: string, data: any) => Promise<void>;
}

const DataMappingTab: React.FC<DataMappingTabProps> = ({
  dataMappings,
  setDataMappings
}) => {
  const [editingMapping, setEditingMapping] = useState<number | null>(null);
  const [newMapping, setNewMapping] = useState<DataMapping>({
    hubspotProperty: '',
    agenticVoiceField: '',
    direction: 'bidirectional',
    isRequired: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'to_hubspot':
        return <ArrowRight size={16} color={DesignSystem.colors.primary[500]} />;
      case 'to_agenticvoice':
        return <ArrowRight size={16} color={DesignSystem.colors.primary[600]} style={{ transform: 'rotate(180deg)' }} />;
      case 'bidirectional':
        return <ArrowLeftRight size={16} color={DesignSystem.colors.success} />;
      default:
        return <ArrowRight size={16} color={DesignSystem.colors.neutral[600]} />;
    }
  };

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'to_hubspot':
        return 'AgenticVoice → HubSpot';
      case 'to_agenticvoice':
        return 'HubSpot → AgenticVoice';
      case 'bidirectional':
        return 'Bidirectional';
      default:
        return direction;
    }
  };

  const addMapping = () => {
    if (newMapping.hubspotProperty && newMapping.agenticVoiceField) {
      setDataMappings(prev => [...prev, newMapping]);
      setNewMapping({
        hubspotProperty: '',
        agenticVoiceField: '',
        direction: 'bidirectional',
        isRequired: false
      });
      setShowAddForm(false);
    }
  };

  const deleteMapping = (index: number) => {
    setDataMappings(prev => prev.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, updates: Partial<DataMapping>) => {
    setDataMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, ...updates } : mapping
    ));
  };

  // Predefined HubSpot properties
  const hubspotProperties = [
    'email', 'firstname', 'lastname', 'phone', 'company', 'website',
    'jobtitle', 'city', 'state', 'country', 'hs_lead_status',
    'lifecyclestage', 'hubspot_owner_id', 'createdate', 'lastmodifieddate',
    'hs_persona', 'industry', 'annualrevenue', 'num_employees'
  ];

  // Predefined AgenticVoice fields
  const agenticVoiceFields = [
    'user.email', 'user.firstName', 'user.lastName', 'user.phone',
    'user.company', 'user.website', 'user.jobTitle', 'user.city',
    'user.state', 'user.country', 'user.leadStatus', 'user.role',
    'user.industry', 'user.createdAt', 'user.updatedAt', 'user.lastLogin',
    'subscription.plan', 'subscription.status', 'subscription.trialEnd'
  ];

  return (
    <div className="data-mapping-tab">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: DesignSystem.spacing[8],
        paddingBottom: DesignSystem.spacing[8],
      }}
    >
      <div 
        style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: DesignSystem.colors.neutral[900], 
          marginBottom: DesignSystem.spacing[6] 
        }}
      >
        Data Mapping
      </div>
      <div 
        style={{ 
          fontSize: '0.875rem', 
          color: DesignSystem.colors.neutral[600], 
          marginBottom: DesignSystem.spacing[6] 
        }}
      >
        Configure how your AgenticVoice data maps to your CRM system
      </div>
      <Button
        variant="primary"
        onClick={() => setShowAddForm(true)}
        style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[3] }}
      >
        <Plus size={16} />
        Add Mapping
      </Button>
      </div>

      {/* Add New Mapping Form */}
      {showAddForm && (
        <div style={{
          padding: DesignSystem.spacing[6],
          marginBottom: DesignSystem.spacing[6],
          border: `2px solid ${DesignSystem.colors.primary[500]}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: DesignSystem.colors.neutral[900], 
                marginBottom: DesignSystem.spacing[4] 
              }}
            >
              Add New Data Mapping
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: DesignSystem.spacing[4],
            marginBottom: DesignSystem.spacing[4]
          }}>
            {/* HubSpot Property */}
            <div>
              <div 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: DesignSystem.colors.neutral[900] 
                }}
              >
                HubSpot Property
              </div>
              <select
                value={newMapping.hubspotProperty}
                onChange={(e) => setNewMapping(prev => ({ ...prev, hubspotProperty: e.target.value }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[3],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: 1,
                  backgroundColor: DesignSystem.colors.neutral[50],
                }}
              >
                <option value="">Select HubSpot Property</option>
                {hubspotProperties.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>

            {/* AgenticVoice Field */}
            <div>
              <div 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: DesignSystem.colors.neutral[900] 
                }}
              >
                AgenticVoice Field
              </div>
              <select
                value={newMapping.agenticVoiceField}
                onChange={(e) => setNewMapping(prev => ({ ...prev, agenticVoiceField: e.target.value }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[3],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: 1,
                  backgroundColor: DesignSystem.colors.neutral[50],
                }}
              >
                <option value="">Select AgenticVoice Field</option>
                {agenticVoiceFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Direction */}
            <div>
              <div 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: DesignSystem.colors.neutral[900] 
                }}
              >
                Sync Direction
              </div>
              <select
                value={newMapping.direction}
                onChange={(e) => setNewMapping(prev => ({ ...prev, direction: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: DesignSystem.spacing[3],
                  border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                  borderRadius: 1,
                  backgroundColor: DesignSystem.colors.neutral[50],
                }}
              >
                <option value="bidirectional">Bidirectional</option>
                <option value="to_hubspot">AgenticVoice → HubSpot</option>
                <option value="to_agenticvoice">HubSpot → AgenticVoice</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={newMapping.isRequired}
                onChange={(e) => setNewMapping(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              <div 
                style={{ 
                  fontSize: '0.875rem', 
                  color: DesignSystem.colors.neutral[600] 
                }}
              >
                Required field
              </div>
            </label>
            <Button
              variant="primary"
              onClick={addMapping}
              disabled={!newMapping.hubspotProperty || !newMapping.agenticVoiceField}
            >
              <Save size={16} />
              Add Mapping
            </Button>
          </div>
        </div>
      )}

      {/* Existing Mappings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[4] }}>
        {dataMappings.map((mapping, index) => (
          <div
            key={index}
            style={{
              padding: DesignSystem.spacing[4],
              borderRadius: DesignSystem.spacing[4],
              border: `1px solid ${DesignSystem.colors.primary[500]}`,
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 2fr 1fr auto',
              gap: DesignSystem.spacing[4],
              alignItems: 'center'
            }}>
              {/* HubSpot Property */}
              <div>
                <div 
                  style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: DesignSystem.colors.neutral[900] 
                  }}
                >
                  HubSpot Property
                </div>
                <div style={{
                  padding: DesignSystem.spacing[2],
                  backgroundColor: DesignSystem.colors.neutral[50],
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {mapping.hubspotProperty}
                </div>
              </div>

              {/* Direction */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {getDirectionIcon(mapping.direction)}
                <div 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: DesignSystem.colors.neutral[600], 
                    textAlign: 'center'
                  }}
                >
                  {getDirectionLabel(mapping.direction)}
                </div>
              </div>

              {/* AgenticVoice Field */}
              <div>
                <div 
                  style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: DesignSystem.colors.neutral[900] 
                  }}
                >
                  AgenticVoice Field
                </div>
                <div style={{
                  padding: DesignSystem.spacing[2],
                  backgroundColor: DesignSystem.colors.neutral[50],
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {mapping.agenticVoiceField}
                </div>
              </div>

              {/* Status & Requirements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[1] }}>
                {mapping.isRequired && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}>
                    <div
                      style={{
                        width: DesignSystem.spacing[1],
                        height: DesignSystem.spacing[1],
                        backgroundColor: DesignSystem.colors.error,
                        borderRadius: '50%',
                      }}
                    />
                    <div 
                      style={{ 
                        fontSize: '0.75rem', 
                        color: DesignSystem.colors.error 
                      }}
                    >
                      Required
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}>
                  <div
                    style={{
                      width: DesignSystem.spacing[1],
                      height: DesignSystem.spacing[1],
                      backgroundColor: DesignSystem.colors.success,
                      borderRadius: '50%',
                    }}
                  />
                  <div 
                    style={{ 
                      fontSize: '0.75rem', 
                      color: DesignSystem.colors.success 
                    }}
                  >
                    Active
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: DesignSystem.spacing[1] }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMapping(index)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMapping(index)}
                >
                  <Trash2 size={14} color={DesignSystem.colors.error} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mapping Statistics */}
      <Card style={{
        marginTop: DesignSystem.spacing[8],
        padding: DesignSystem.spacing[4],
        backgroundColor: DesignSystem.colors.neutral[50]
      }}>
        <div style={{ 
          fontSize: '1.25rem',
          fontWeight: 600,
          color: DesignSystem.colors.neutral[900],
          marginBottom: DesignSystem.spacing[4]
        }}>
          Mapping Statistics
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: DesignSystem.spacing[4]
        }}>
          <div>
            <div style={{ 
              fontSize: '1.5rem',
              fontWeight: 600,
              color: DesignSystem.colors.primary[500] 
            }}>
              {dataMappings.length}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: DesignSystem.colors.neutral[600] 
            }}>
              Total Mappings
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '1.5rem',
              fontWeight: 600,
              color: DesignSystem.colors.success 
            }}>
              {dataMappings.filter(m => m.direction === 'bidirectional').length}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: DesignSystem.colors.neutral[600] 
            }}>
              Bidirectional
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '1.5rem',
              fontWeight: 600,
              color: DesignSystem.colors.error 
            }}>
              {dataMappings.filter(m => m.isRequired).length}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: DesignSystem.colors.neutral[600] 
            }}>
              Required Fields
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataMappingTab;
