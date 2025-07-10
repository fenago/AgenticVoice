import { IndustryType } from '@/types/auth';

/**
 * HIPAA Compliance Utilities
 * Provides helpers for managing HIPAA compliance requirements
 */

export interface HipaaConfig {
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  dataRetentionDays: number;
  encryptionRequired: boolean;
  auditLoggingEnabled: boolean;
  anonymizationRequired: boolean;
  consentRequired: boolean;
}

// Default HIPAA configuration for medical users
export const DEFAULT_HIPAA_CONFIG: HipaaConfig = {
  recordingEnabled: false, // Disabled by default for HIPAA
  transcriptionEnabled: true,
  dataRetentionDays: 2555, // 7 years as per HIPAA requirements
  encryptionRequired: true,
  auditLoggingEnabled: true,
  anonymizationRequired: false, // Can be enabled based on practice needs
  consentRequired: true,
};

// Non-HIPAA default configuration
export const DEFAULT_NON_HIPAA_CONFIG: HipaaConfig = {
  recordingEnabled: true,
  transcriptionEnabled: true,
  dataRetentionDays: 1095, // 3 years
  encryptionRequired: true,
  auditLoggingEnabled: true,
  anonymizationRequired: false,
  consentRequired: false,
};

/**
 * Determines if a user requires HIPAA compliance based on their industry
 */
export const requiresHipaaCompliance = (industryType: IndustryType): boolean => {
  return industryType === IndustryType.MEDICAL;
};

/**
 * Gets the appropriate HIPAA configuration for a user
 */
export const getHipaaConfig = (industryType: IndustryType, customConfig?: Partial<HipaaConfig>): HipaaConfig => {
  const baseConfig = requiresHipaaCompliance(industryType) 
    ? DEFAULT_HIPAA_CONFIG 
    : DEFAULT_NON_HIPAA_CONFIG;
  
  return {
    ...baseConfig,
    ...customConfig,
  };
};

/**
 * Validates if a configuration meets HIPAA requirements
 */
export const validateHipaaCompliance = (config: HipaaConfig, industryType: IndustryType): string[] => {
  const errors: string[] = [];

  if (!requiresHipaaCompliance(industryType)) {
    return errors; // No validation needed for non-medical users
  }

  if (!config.encryptionRequired) {
    errors.push('Encryption is required for HIPAA compliance');
  }

  if (!config.auditLoggingEnabled) {
    errors.push('Audit logging is required for HIPAA compliance');
  }

  if (config.dataRetentionDays < 2555) { // 7 years
    errors.push('Data retention period must be at least 7 years for HIPAA compliance');
  }

  if (!config.consentRequired) {
    errors.push('Patient consent is required for HIPAA compliance');
  }

  return errors;
};

/**
 * Sanitizes sensitive data for logging in HIPAA environments
 */
export const sanitizeForLogging = (data: any, hipaaCompliant: boolean = false): any => {
  if (!hipaaCompliant) {
    return data;
  }

  // Fields that should be sanitized in HIPAA environments
  const sensitiveFields = [
    'name', 'firstName', 'lastName', 'email', 'phone', 'phoneNumber',
    'address', 'ssn', 'dateOfBirth', 'medicalRecordNumber', 'patientId'
  ];

  const sanitized = { ...data };

  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      if (value.includes('@')) {
        // Email - keep domain
        const [, domain] = value.split('@');
        return `***@${domain}`;
      }
      if (value.match(/^\+?[\d\s\-\(\)]+$/)) {
        // Phone number
        return value.length > 4 ? `***-${value.slice(-4)}` : '***';
      }
      // Other strings
      return value.length > 2 ? `${value.slice(0, 2)}***` : '***';
    }
    return '***';
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        result[key] = sanitizeValue(value);
      } else if (typeof value === 'object') {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return sanitizeObject(sanitized);
};

/**
 * Calculates data retention expiry date based on HIPAA requirements
 */
export const calculateRetentionDate = (createdAt: Date, industryType: IndustryType): Date => {
  const retentionDays = requiresHipaaCompliance(industryType) ? 2555 : 1095; // 7 years vs 3 years
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + retentionDays);
  return expiryDate;
};

/**
 * Checks if data should be anonymized based on age and settings
 */
export const shouldAnonymizeData = (
  createdAt: Date, 
  config: HipaaConfig, 
  industryType: IndustryType
): boolean => {
  if (!config.anonymizationRequired) {
    return false;
  }

  const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const anonymizationThreshold = requiresHipaaCompliance(industryType) ? 365 : 180; // 1 year vs 6 months

  return ageInDays > anonymizationThreshold;
};

/**
 * Generates a HIPAA-compliant consent disclaimer
 */
export const generateConsentDisclaimer = (companyName: string = 'Our Organization'): string => {
  return `
HIPAA Privacy Notice and Consent

By proceeding with this call, you acknowledge and consent to the following:

1. This call may be recorded and transcribed for quality assurance and training purposes.
2. The information discussed during this call may include Protected Health Information (PHI) as defined by HIPAA.
3. ${companyName} is committed to protecting your privacy and maintaining the confidentiality of your health information.
4. Your health information will only be used or disclosed as necessary for treatment, payment, or healthcare operations.
5. You have the right to request restrictions on how your health information is used or disclosed.
6. You have the right to access, inspect, and obtain copies of your health information.
7. If you have concerns about how your health information is being handled, you may contact our Privacy Officer.

By continuing, you provide your consent for this call to proceed under these terms.

For questions about your privacy rights, please contact our Privacy Officer at privacy@${companyName.toLowerCase().replace(/\s+/g, '')}.com
  `.trim();
};

export default {
  requiresHipaaCompliance,
  getHipaaConfig,
  validateHipaaCompliance,
  sanitizeForLogging,
  calculateRetentionDate,
  shouldAnonymizeData,
  generateConsentDisclaimer,
  DEFAULT_HIPAA_CONFIG,
  DEFAULT_NON_HIPAA_CONFIG,
};
