/**
 * HubSpot API Service
 * Centralized service for all HubSpot CRM operations
 */

interface HubSpotContact {
  id?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  website?: string;
  lifecyclestage?: string;
  jobtitle?: string;
  message?: string;
  leadstatus?: string;
}

interface HubSpotEvent {
  eventName: string;
  email?: string;
  contactId?: string;
  companyId?: string;
  properties?: { [key: string]: string | number };
  occurredAt?: number;
}

class HubSpotService {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = process.env.HUBSPOT_TOKEN!;
    if (!this.apiKey) {
      throw new Error('HubSpot API key not configured');
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const maxRetries = 3;
    let delay = 1000;

    for (let i = 0; i < maxRetries; i++) {
        const url = `${this.baseUrl}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            if (response.ok) {
                if (response.status === 204) { // Handle "No Content" responses
                    return null;
                }
                return await response.json();
            }

            if (response.status === 429) {
                console.warn(`HubSpot API rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue; // Move to the next attempt
            }

            // For other errors, throw and break the loop
            const errorBody = await response.text();
            throw new Error(`HubSpot API Error: ${response.status} - ${errorBody}`);

        } catch (error) {
            console.error(`Request to HubSpot failed (attempt ${i + 1}/${maxRetries}):`, error);
            // If it's the last attempt, re-throw the error to be caught by the caller
            if (i === maxRetries - 1) {
                throw error;
            }
            // For network errors etc., we can also retry
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    // This line should be unreachable if the logic is correct, but as a fallback:
    throw new Error('HubSpot API request failed after all retries.');
  }

  /**
   * Create or update a contact in HubSpot with smart lead status handling
   */
  async createOrUpdateContact(contactData: HubSpotContact): Promise<any> {
    try {
      // Check if contact already exists
      const existingContact = await this.findContactByEmail(contactData.email);
      
      if (existingContact) {
        // Contact exists - only set leadstatus to NEW if it's currently empty
        const updateData = { ...contactData };
        
        // Debug: Log all existing contact properties
        console.log(`🔍 Existing contact properties for ${contactData.email}:`, JSON.stringify(existingContact.properties, null, 2));
        
        // Check multiple possible lead status property names
        const currentLeadStatus = existingContact.properties?.hs_lead_status || 
                                 existingContact.properties?.leadstatus ||
                                 existingContact.properties?.lead_status;
        
        console.log(`🔍 Current lead status values: hs_lead_status=${existingContact.properties?.hs_lead_status}, leadstatus=${existingContact.properties?.leadstatus}, lead_status=${existingContact.properties?.lead_status}`);
        
        if (!currentLeadStatus || currentLeadStatus === '' || currentLeadStatus === null) {
          // Only set to NEW if leadstatus is empty
          updateData.leadstatus = 'NEW';
          console.log(`🔄 Setting lead status to NEW for existing contact ${contactData.email} (was empty)`);
        } else {
          // Don't overwrite existing leadstatus
          delete updateData.leadstatus;
          console.log(`🔒 Preserving existing lead status '${currentLeadStatus}' for contact ${contactData.email}`);
        }
        
        return await this.updateContact(existingContact.id, updateData);
      } else {
        // New contact - always set leadstatus to NEW
        const newContactData = { ...contactData, leadstatus: 'NEW' };
        console.log(`Creating new contact ${contactData.email} with leadstatus: NEW`);
        return await this.createContact(newContactData);
      }
    } catch (error) {
      console.error('Error creating or updating HubSpot contact:', error);
      throw error;
    }
  }

  /**
   * Create a new HubSpot contact
   */
  async createContact(contactData: any): Promise<any> {
    const properties = this.formatContactProperties(contactData);
    
    const data = {
      properties
    };

    return await this.makeRequest('/crm/v3/objects/contacts', 'POST', data);
  }

  /**
   * Find contact by email
   */
  async findContactByEmail(email: string): Promise<any> {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/contacts/search`, 
        'POST', 
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email
                }
              ]
            }
          ]
        }
      );

      return response.results && response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error finding HubSpot contact:', error);
      return null;
    }
  }

  /**
   * Track custom event for a contact
   */
  async trackEvent(eventData: HubSpotEvent): Promise<any> {
    try {
      const data: any = {
        eventName: eventData.eventName,
        properties: eventData.properties || {},
        occurredAt: eventData.occurredAt || Date.now()
      };

      // Add identifier based on what's provided
      if (eventData.email) {
        data.email = eventData.email;
      } else if (eventData.contactId) {
        data.objectId = eventData.contactId;
        data.objectType = 'contact';
      } else if (eventData.companyId) {
        data.objectId = eventData.companyId;
        data.objectType = 'company';
      } else {
        throw new Error('Either email, contactId, or companyId must be provided for event tracking');
      }

      return await this.makeRequest('/events/v3/send', 'POST', data);
    } catch (error) {
      console.error('Error tracking HubSpot event:', error);
      throw error;
    }
  }

  /**
   * Update contact's notes with usage information
   */
  async updateContactNotes(email: string, notes: string): Promise<any> {
    try {
      const contact = await this.findContactByEmail(email);
      if (!contact) {
        throw new Error('Contact not found');
      }

      return await this.updateContact(contact.id, {
        email,
        message: notes
      });
    } catch (error) {
      console.error('Error updating contact notes:', error);
      throw error;
    }
  }

  /**
   * Add important activity as a note to HubSpot contact
   */
  async addActivityNote(email: string, activityType: string, activityDetails: string): Promise<any> {
    try {
      const contact = await this.findContactByEmail(email);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Create a note in HubSpot using the engagements API
      const noteData = {
        engagement: {
          active: true,
          type: 'NOTE'
        },
        associations: {
          contactIds: [contact.id]
        },
        metadata: {
          body: `**${activityType}**: ${activityDetails}\n\nTimestamp: ${new Date().toLocaleString()}`
        }
      };

      return await this.makeRequest('/engagements/v1/engagements', 'POST', noteData);
    } catch (error) {
      console.error('Error adding activity note to HubSpot:', error);
      throw error;
    }
  }

  /**
   * Log multiple activities as notes for a contact
   */
  async logUserActivities(email: string, activities: Array<{type: string, details: string, timestamp?: Date}>): Promise<void> {
    try {
      for (const activity of activities) {
        const timestamp = activity.timestamp || new Date();
        const activityDetails = `${activity.details} (${timestamp.toLocaleString()})`;
        await this.addActivityNote(email, activity.type, activityDetails);
        console.log(`✅ Added activity note for ${email}: ${activity.type}`);
      }
    } catch (error) {
      console.error('Error logging user activities:', error);
      throw error;
    }
  }

  /**
   * Get contact engagement analytics
   */
  async getContactAnalytics(contactId: string): Promise<any> {
    try {
      return await this.makeRequest(`/crm/v3/objects/contacts/${contactId}?properties=engagement_score,feature_usage_score,lifecyclestage,last_activity_date`);
    } catch (error) {
      console.error('Error fetching contact analytics:', error);
      throw error;
    }
  }

  /**
   * Segment contacts based on criteria
   */
  async segmentContacts(segmentCriteria: any): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        '/crm/v3/objects/contacts/search',
        'POST',
        {
          filterGroups: [segmentCriteria],
          properties: ['email', 'firstname', 'lastname', 'user_role', 'subscription_status', 'engagement_score']
        }
      );

      return response.results || [];
    } catch (error) {
      console.error('Error segmenting contacts:', error);
      throw error;
    }
  }

  /**
   * Format contact properties for HubSpot API
   */
  private formatContactProperties(contactData: HubSpotContact): any {
    const properties: any = {};
    
    // Only use standard HubSpot contact properties that exist by default
    if (contactData.email) properties.email = contactData.email;
    if (contactData.firstname) properties.firstname = contactData.firstname;
    if (contactData.lastname) properties.lastname = contactData.lastname;
    if (contactData.phone) properties.phone = contactData.phone;
    if (contactData.company) properties.company = contactData.company;
    if (contactData.website) properties.website = contactData.website;
    if (contactData.lifecyclestage) properties.lifecyclestage = contactData.lifecyclestage;
    if (contactData.jobtitle) properties.jobtitle = contactData.jobtitle;
    if (contactData.message) properties.message = contactData.message;
    
    // Use only the correct HubSpot lead status property name
    if (contactData.leadstatus) {
      properties.hs_lead_status = contactData.leadstatus;
      console.log(`🔍 Setting lead status property: hs_lead_status=${contactData.leadstatus}`);
    }
    
    console.log(`🔍 HubSpot properties being sent:`, JSON.stringify(properties, null, 2));
    return properties;
  }

  /**
   * Sync AgenticVoice user to HubSpot contact
   */
  async syncUserToContact(user: any): Promise<string | null> {
    try {
      // Create contact data using only standard HubSpot properties
      const contactData: HubSpotContact = {
        email: user.email,
        firstname: user.name?.split(' ')[0] || '',
        lastname: user.name?.split(' ').slice(1).join(' ') || '',
        lifecyclestage: user.role === 'FREE' ? 'lead' : 'customer',
        jobtitle: user.role || 'Free User',
        company: 'AgenticVoice User',
        message: `AgenticVoice user - Role: ${user.role || 'FREE'}, Industry: ${user.industryType || 'OTHER'}, Access: ${user.hasAccess ? 'Active' : 'Free'}, Login Count: ${user.loginCount || 0}, Last Login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}`
      };

      const response = await this.createOrUpdateContact(contactData);
      
      // Save HubSpot contact ID to user record if successful
      if (response.id) {
        console.log(`✅ Successfully synced user ${user.email} to HubSpot contact ${response.id}`);
      }
      
      return response.id || null;
    } catch (error) {
      console.error('Error syncing user to HubSpot:', error);
      throw error; // Re-throw to properly handle errors in calling code
    }
  }

  /**
   * Creates or updates a deal in HubSpot based on a Stripe subscription.
   * Associates the deal with the HubSpot contact.
   */
  async createOrUpdateDealForSubscription(
    user: { hubspotContactId?: string; hubspotDealId?: string; name?: string; email?: string },
    subscription: any // Using 'any' to avoid deep Stripe type dependencies here
  ): Promise<string | null> {
    if (!user.hubspotContactId) {
      console.error('HubSpot contact ID is missing for user ' + user.email + '. Cannot create or update deal.');
      throw new Error('HubSpot contact ID is missing.');
    }

    const planName = subscription.items.data[0]?.price.nickname || 'Subscription';
    const amount = (subscription.items.data[0]?.price.unit_amount || 0) / 100;

    let dealstage: string;
    switch (subscription.status) {
      case 'active':
      case 'trialing':
        dealstage = 'closedwon'; // From HubSpot's default sales pipeline
        break;
      case 'canceled':
      case 'unpaid':
        dealstage = 'closedlost'; // From HubSpot's default sales pipeline
        break;
      default:
        // A neutral, early-stage value for other statuses like 'incomplete'
        dealstage = 'appointmentscheduled'; 
    }

    const dealProperties = {
      dealname: `${user.name || user.email} - ${planName}`,
      amount: amount.toString(),
      dealstage: dealstage,
      pipeline: 'default', // Use the default sales pipeline
      closedate: subscription.status === 'active' ? new Date(subscription.start_date * 1000).toISOString() : new Date().toISOString(),
    };

    try {
      if (user.hubspotDealId) {
        // Update existing deal
        console.log(`Updating HubSpot deal ${user.hubspotDealId} for contact ${user.hubspotContactId}`);
        await this.makeRequest(`/crm/v3/objects/deals/${user.hubspotDealId}`, 'PATCH', {
          properties: dealProperties,
        });
        return user.hubspotDealId;
      } else {
        // Create new deal and associate it with the contact
        console.log(`Creating new HubSpot deal for contact ${user.hubspotContactId}`);
        const newDealData = {
          properties: dealProperties,
          associations: [
            {
              to: { id: user.hubspotContactId },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: 3, // 3 = Deal to Contact association. (4 = Contact to Deal)
                },
              ],
            },
          ],
        };
        const newDeal = await this.makeRequest('/crm/v3/objects/deals', 'POST', newDealData);
        console.log(`Successfully created HubSpot deal ${newDeal.id}`);
        return newDeal.id;
      }
    } catch (error) {
      console.error('Error creating or updating HubSpot deal:', error);
      throw error;
    }
  }

  // CRM Dashboard Methods
  async getContactsStats() {
    const response = await this.makeRequest('/crm/v3/objects/contacts', 'GET');
    return {
      total: response.total || 0,
      lastModified: new Date().toISOString()
    };
  }

  async getCompaniesStats() {
    const response = await this.makeRequest('/crm/v3/objects/companies', 'GET');
    return {
      total: response.total || 0,
      lastModified: new Date().toISOString()
    };
  }

  async getDealsStats() {
    const deals = await this.makeRequest('/crm/v3/objects/deals?properties=amount,dealstage', 'GET');
    const total = deals.total || 0;
    const closedWon = deals.results?.filter((deal: any) => deal.properties.dealstage === 'closedwon').length || 0;
    const totalRevenue = deals.results?.reduce((sum: number, deal: any) => 
      sum + (parseFloat(deal.properties.amount) || 0), 0) || 0;
    
    return {
      total,
      closedWon,
      totalRevenue,
      lastModified: new Date().toISOString()
    };
  }

  async getTicketsStats() {
    const response = await this.makeRequest('/crm/v3/objects/tickets', 'GET');
    return {
      total: response.total || 0,
      lastModified: new Date().toISOString()
    };
  }

  async getRecentActivities(limit: number = 10) {
    try {
      // Get recent contact updates as activity proxy since HubSpot doesn't have a general activities endpoint
      const response = await this.makeRequest(`/crm/v3/objects/contacts?limit=${limit}&properties=email,firstname,lastname,lastmodifieddate&sorts=lastmodifieddate&direction=DESCENDING`, 'GET');
      
      // Transform contact updates into activity-like format
      const activities = (response.results || []).map((contact: any) => ({
        id: contact.id,
        type: 'contact_updated',
        description: `Contact ${contact.properties?.firstname || ''} ${contact.properties?.lastname || 'Unknown'} was updated`,
        timestamp: contact.properties?.lastmodifieddate || new Date().toISOString(),
        contact: {
          id: contact.id,
          email: contact.properties?.email,
          name: `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim() || 'Unknown'
        }
      }));
      
      return activities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return empty array on error - no mock data
      return [];
    }
  }

  /**
   * Get contact's activity timeline
   */
  async getContactActivityTimeline(contactId: string) {
    try {
      // Get various activities for a contact
      const [engagements, notes, meetings, calls] = await Promise.all([
        this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/engagements`, 'GET').catch(() => ({ results: [] as any[] })),
        this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/notes`, 'GET').catch(() => ({ results: [] as any[] })),
        this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/meetings`, 'GET').catch(() => ({ results: [] as any[] })),
        this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/calls`, 'GET').catch(() => ({ results: [] as any[] }))
      ]);

      const timeline = [
        ...(engagements.results || []).map((item: any) => ({ ...item, type: 'engagement' })),
        ...(notes.results || []).map((item: any) => ({ ...item, type: 'note' })),
        ...(meetings.results || []).map((item: any) => ({ ...item, type: 'meeting' })),
        ...(calls.results || []).map((item: any) => ({ ...item, type: 'call' }))
      ];

      return timeline.sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());
    } catch (error) {
      console.error('Error fetching contact activity timeline:', error);
      return [];
    }
  }

  /**
   * Update contact lead scoring
   */
  async updateContactLeadScore(contactId: string, score: number, notes?: string) {
    try {
      const updateData: any = {
        hs_lead_status: score >= 80 ? 'QUALIFIED' : score >= 60 ? 'CONNECTED' : score >= 40 ? 'NEW' : 'OPEN'
      };

      if (notes) {
        updateData.hs_lead_notes = notes;
      }

      return await this.updateContact(contactId, { properties: updateData });
    } catch (error) {
      console.error('Error updating lead score:', error);
      throw error;
    }
  }

  /**
   * Batch update contacts
   */
  async batchUpdateContacts(updates: Array<{ id: string; properties: any }>) {
    try {
      const batchData = {
        inputs: updates.map(update => ({
          id: update.id,
          properties: update.properties
        }))
      };

      return await this.makeRequest('/crm/v3/objects/contacts/batch/update', 'POST', batchData);
    } catch (error) {
      console.error('Error batch updating contacts:', error);
      throw error;
    }
  }

  /**
   * Batch delete contacts
   */
  async batchDeleteContacts(contactIds: string[]) {
    try {
      const batchData = {
        inputs: contactIds.map(id => ({ id }))
      };

      return await this.makeRequest('/crm/v3/objects/contacts/batch/archive', 'POST', batchData);
    } catch (error) {
      console.error('Error batch deleting contacts:', error);
      throw error;
    }
  }

  /**
   * Import contacts from CSV data
   */
  async importContacts(contactsData: any[]) {
    try {
      const batchData = {
        inputs: contactsData.map(contact => ({
          properties: this.formatContactProperties(contact)
        }))
      };

      return await this.makeRequest('/crm/v3/objects/contacts/batch/create', 'POST', batchData);
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  }

  /**
   * Associate contact with company
   */
  async associateContactWithCompany(contactId: string, companyId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating contact with company:', error);
      throw error;
    }
  }

  /**
   * Associate contact with deal
   */
  async associateContactWithDeal(contactId: string, dealId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}/contact_to_deal`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating contact with deal:', error);
      throw error;
    }
  }

  /**
   * Get contact lifecycle stages
   */
  async getLifecycleStages() {
    try {
      const response = await this.makeRequest('/crm/v3/properties/contacts/lifecyclestage', 'GET');
      return response.options || [
        { label: 'Subscriber', value: 'subscriber' },
        { label: 'Lead', value: 'lead' },
        { label: 'Marketing Qualified Lead', value: 'marketingqualifiedlead' },
        { label: 'Sales Qualified Lead', value: 'salesqualifiedlead' },
        { label: 'Opportunity', value: 'opportunity' },
        { label: 'Customer', value: 'customer' },
        { label: 'Evangelist', value: 'evangelist' },
        { label: 'Other', value: 'other' }
      ];
    } catch (error) {
      console.error('Error fetching lifecycle stages:', error);
      return [
        { label: 'Subscriber', value: 'subscriber' },
        { label: 'Lead', value: 'lead' },
        { label: 'Marketing Qualified Lead', value: 'marketingqualifiedlead' },
        { label: 'Sales Qualified Lead', value: 'salesqualifiedlead' },
        { label: 'Opportunity', value: 'opportunity' },
        { label: 'Customer', value: 'customer' },
        { label: 'Evangelist', value: 'evangelist' },
        { label: 'Other', value: 'other' }
      ];
    }
  }

  /**
   * Get lead status options
   */
  async getLeadStatusOptions() {
    try {
      const response = await this.makeRequest('/crm/v3/properties/contacts/hs_lead_status', 'GET');
      return response.options || [
        { label: 'New', value: 'NEW' },
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Connected', value: 'CONNECTED' },
        { label: 'Qualified', value: 'QUALIFIED' },
        { label: 'Unqualified', value: 'UNQUALIFIED' }
      ];
    } catch (error) {
      console.error('Error fetching lead status options:', error);
      return [
        { label: 'New', value: 'NEW' },
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Connected', value: 'CONNECTED' },
        { label: 'Qualified', value: 'QUALIFIED' },
        { label: 'Unqualified', value: 'UNQUALIFIED' }
      ];
    }
  }

  async getPipelineHealth() {
    const [deals, tickets] = await Promise.all([
      this.makeRequest('/crm/v3/objects/deals?properties=dealstage', 'GET'),
      this.makeRequest('/crm/v3/objects/tickets?properties=hs_ticket_pipeline_stage', 'GET')
    ]);

    return {
      deals: deals.results?.reduce((acc: any, deal: any) => {
        const stage = deal.properties.dealstage || 'unknown';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {}) || {},
      tickets: tickets.results?.reduce((acc: any, ticket: any) => {
        const stage = ticket.properties.hs_ticket_pipeline_stage || 'unknown';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {}) || {},
      leadProgression: {} // Placeholder for lead progression data
    };
  }

  // Contact Management Methods
  async searchContacts(searchParams: {
    filters?: any[];
    properties?: string[];
    sorts?: any[];
    offset?: number;
    limit?: number;
  }) {
    const searchData = {
      filterGroups: searchParams.filters ? [{ filters: searchParams.filters }] : [],
      properties: searchParams.properties || ['firstname', 'lastname', 'email'],
      sorts: searchParams.sorts || [],
      after: searchParams.offset || 0,
      limit: searchParams.limit || 50
    };

    return await this.makeRequest('/crm/v3/objects/contacts/search', 'POST', searchData);
  }

  async getContactById(contactId: string, properties?: string[]) {
    const propsQuery = properties ? `?properties=${properties.join(',')}` : '';
    return await this.makeRequest(`/crm/v3/objects/contacts/${contactId}${propsQuery}`, 'GET');
  }

  async updateContact(contactId: string, data: any) {
    const properties = typeof data.properties !== 'undefined' ? data.properties : this.formatContactProperties(data);
    const requestData = typeof data.properties !== 'undefined' ? data : { properties };
    return await this.makeRequest(`/crm/v3/objects/contacts/${contactId}`, 'PATCH', requestData);
  }

  async deleteContact(contactId: string) {
    return await this.makeRequest(`/crm/v3/objects/contacts/${contactId}`, 'DELETE');
  }

  async getContactEngagements(contactId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/activities${limitQuery}`, 'GET');
    return response.results || [];
  }

  async getContactCompanies(contactId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/companies`, 'GET');
    return response.results || [];
  }

  async getContactDeals(contactId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/deals`, 'GET');
    return response.results || [];
  }

  async getContactTickets(contactId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/contacts/${contactId}/associations/tickets`, 'GET');
    return response.results || [];
  }

  // Company Management Methods
  async searchCompanies(searchParams: {
    filters?: any[];
    properties?: string[];
    sorts?: any[];
    offset?: number;
    limit?: number;
  }) {
    const searchData = {
      filterGroups: searchParams.filters ? [{ filters: searchParams.filters }] : [],
      properties: searchParams.properties || ['name', 'domain', 'industry'],
      sorts: searchParams.sorts || [],
      after: searchParams.offset || 0,
      limit: searchParams.limit || 50
    };

    return await this.makeRequest('/crm/v3/objects/companies/search', 'POST', searchData);
  }

  async getCompanyById(companyId: string, properties?: string[]) {
    const propsQuery = properties ? `?properties=${properties.join(',')}` : '';
    return await this.makeRequest(`/crm/v3/objects/companies/${companyId}${propsQuery}`, 'GET');
  }

  async createCompany(data: any) {
    return await this.makeRequest('/crm/v3/objects/companies', 'POST', data);
  }

  async updateCompany(companyId: string, data: any) {
    return await this.makeRequest(`/crm/v3/objects/companies/${companyId}`, 'PATCH', data);
  }

  async deleteCompany(companyId: string) {
    return await this.makeRequest(`/crm/v3/objects/companies/${companyId}`, 'DELETE');
  }

  async getCompanyContacts(companyId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/companies/${companyId}/associations/contacts${limitQuery}`, 'GET');
    return response.results || [];
  }

  async getCompanyDeals(companyId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/companies/${companyId}/associations/deals`, 'GET');
    return response.results || [];
  }

  async getCompanyTickets(companyId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/companies/${companyId}/associations/tickets`, 'GET');
    return response.results || [];
  }

  async getCompanyEngagements(companyId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/companies/${companyId}/associations/activities${limitQuery}`, 'GET');
    return response.results || [];
  }

  // Deal Management Methods
  async searchDeals(searchParams: {
    filters?: any[];
    properties?: string[];
    sorts?: any[];
    offset?: number;
    limit?: number;
  }) {
    const searchData = {
      filterGroups: searchParams.filters ? [{ filters: searchParams.filters }] : [],
      properties: searchParams.properties || ['dealname', 'amount', 'dealstage', 'closedate', 'probability', 'dealtype', 'description', 'hubspot_owner_id', 'createdate', 'lastmodifieddate'],
      sorts: searchParams.sorts || [],
      after: searchParams.offset || 0,
      limit: searchParams.limit || 50
    };

    return await this.makeRequest('/crm/v3/objects/deals/search', 'POST', searchData);
  }

  async getDealById(dealId: string, properties?: string[]) {
    const propsQuery = properties ? `?properties=${properties.join(',')}` : '';
    return await this.makeRequest(`/crm/v3/objects/deals/${dealId}${propsQuery}`, 'GET');
  }

  async createDeal(data: any) {
    const properties = {
      dealname: data.dealname,
      amount: data.amount,
      closedate: data.closedate,
      dealstage: data.dealstage,
      probability: data.probability,
      dealtype: data.dealtype,
      description: data.description
    };

    // Remove undefined values
    Object.keys(properties).forEach(key => 
      properties[key as keyof typeof properties] === undefined && 
      delete properties[key as keyof typeof properties]
    );

    const requestData = { properties };
    return await this.makeRequest('/crm/v3/objects/deals', 'POST', requestData);
  }

  async updateDeal(dealId: string, data: any) {
    const properties = {
      dealname: data.dealname,
      amount: data.amount,
      closedate: data.closedate,
      dealstage: data.dealstage,
      probability: data.probability,
      dealtype: data.dealtype,
      description: data.description
    };

    // Remove undefined values
    Object.keys(properties).forEach(key => 
      properties[key as keyof typeof properties] === undefined && 
      delete properties[key as keyof typeof properties]
    );

    const requestData = { properties };
    return await this.makeRequest(`/crm/v3/objects/deals/${dealId}`, 'PATCH', requestData);
  }

  async deleteDeal(dealId: string) {
    return await this.makeRequest(`/crm/v3/objects/deals/${dealId}`, 'DELETE');
  }

  async getDealContacts(dealId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/deals/${dealId}/associations/contacts${limitQuery}`, 'GET');
    return response.results || [];
  }

  async getDealCompanies(dealId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/deals/${dealId}/associations/companies`, 'GET');
    return response.results || [];
  }

  async associateDealWithContact(dealId: string, contactId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating deal with contact:', error);
      throw error;
    }
  }

  async associateDealWithCompany(dealId: string, companyId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}/deal_to_company`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating deal with company:', error);
      throw error;
    }
  }

  // Ticket Management Methods
  async searchTickets(searchParams: {
    filters?: any[];
    properties?: string[];
    sorts?: any[];
    offset?: number;
    limit?: number;
  }) {
    const searchData = {
      filterGroups: searchParams.filters ? [{ filters: searchParams.filters }] : [],
      properties: searchParams.properties || ['subject', 'hs_ticket_priority', 'hs_pipeline_stage', 'createdate', 'hs_lastmodifieddate', 'content', 'source_type', 'hubspot_owner_id'],
      sorts: searchParams.sorts || [],
      after: searchParams.offset || 0,
      limit: searchParams.limit || 50
    };

    return await this.makeRequest('/crm/v3/objects/tickets/search', 'POST', searchData);
  }

  async getTicketById(ticketId: string, properties?: string[]) {
    const propsQuery = properties ? `?properties=${properties.join(',')}` : '';
    return await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}${propsQuery}`, 'GET');
  }

  async createTicket(data: any) {
    const properties = {
      subject: data.subject,
      content: data.content,
      hs_pipeline_stage: data.status || 'new',
      hs_ticket_priority: data.priority || 'MEDIUM',
      source_type: data.source_type || 'EMAIL',
      hubspot_owner_id: data.hubspot_owner_id
    };

    // Remove undefined values
    Object.keys(properties).forEach(key => 
      properties[key as keyof typeof properties] === undefined && 
      delete properties[key as keyof typeof properties]
    );

    const requestData = { properties };
    return await this.makeRequest('/crm/v3/objects/tickets', 'POST', requestData);
  }

  async updateTicket(ticketId: string, data: any) {
    const properties = {
      subject: data.subject,
      content: data.content,
      hs_pipeline_stage: data.status,
      hs_ticket_priority: data.priority,
      source_type: data.source_type,
      hubspot_owner_id: data.hubspot_owner_id
    };

    // Remove undefined values
    Object.keys(properties).forEach(key => 
      properties[key as keyof typeof properties] === undefined && 
      delete properties[key as keyof typeof properties]
    );

    const requestData = { properties };
    return await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}`, 'PATCH', requestData);
  }

  async deleteTicket(ticketId: string) {
    return await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}`, 'DELETE');
  }

  async getTicketContacts(ticketId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}/associations/contacts${limitQuery}`, 'GET');
    return response.results || [];
  }

  async getTicketCompanies(ticketId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}/associations/companies`, 'GET');
    return response.results || [];
  }

  async associateTicketWithContact(ticketId: string, contactId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/tickets/${ticketId}/associations/contacts/${contactId}/ticket_to_contact`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating ticket with contact:', error);
      throw error;
    }
  }

  async associateTicketWithCompany(ticketId: string, companyId: string) {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/tickets/${ticketId}/associations/companies/${companyId}/ticket_to_company`,
        'PUT'
      );
    } catch (error) {
      console.error('Error associating ticket with company:', error);
      throw error;
    }
  }

  async getTicketActivities(ticketId: string, limit?: number) {
    const limitQuery = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/crm/v3/objects/tickets/${ticketId}/associations/activities${limitQuery}`, 'GET');
    return response.results || [];
  }

  // Sync Methods
  async syncAllContacts() {
    try {
      const response = await this.searchContacts({
        properties: ['email', 'firstname', 'lastname', 'company', 'phone'],
        limit: 100
      });
      return { 
        status: 'success', 
        message: 'Contacts sync completed',
        count: response.total || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Contacts sync failed: ' + (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async syncAllCompanies() {
    try {
      const response = await this.searchCompanies({
        properties: ['name', 'domain', 'industry', 'city', 'state'],
        limit: 100
      });
      return { 
        status: 'success', 
        message: 'Companies sync completed',
        count: response.total || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Companies sync failed: ' + (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async syncAllDeals() {
    try {
      const response = await this.searchDeals({
        properties: ['dealname', 'amount', 'dealstage', 'closedate'],
        limit: 100
      });
      return { 
        status: 'success', 
        message: 'Deals sync completed',
        count: response.total || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Deals sync failed: ' + (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async syncAllTickets() {
    try {
      const response = await this.makeRequest('/crm/v3/objects/tickets?properties=subject,hs_ticket_pipeline_stage&limit=100', 'GET');
      return { 
        status: 'success', 
        message: 'Tickets sync completed',
        count: response.total || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Tickets sync failed: ' + (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportAllData() {
    try {
      const [contacts, companies, deals, tickets] = await Promise.all([
        this.searchContacts({ properties: ['email', 'firstname', 'lastname', 'company', 'phone'], limit: 1000 }),
        this.searchCompanies({ properties: ['name', 'domain', 'industry', 'city', 'state'], limit: 1000 }),
        this.searchDeals({ properties: ['dealname', 'amount', 'dealstage', 'closedate'], limit: 1000 }),
        this.makeRequest('/crm/v3/objects/tickets?properties=subject,hs_ticket_pipeline_stage&limit=1000', 'GET')
      ]);

      const exportData = {
        contacts: contacts.results || [],
        companies: companies.results || [],
        deals: deals.results || [],
        tickets: tickets.results || [],
        exportedAt: new Date().toISOString(),
        totalRecords: {
          contacts: contacts.total || 0,
          companies: companies.total || 0,
          deals: deals.total || 0,
          tickets: tickets.total || 0
        }
      };

      return { 
        status: 'success', 
        message: 'Data export completed',
        data: exportData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Data export failed: ' + (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update lead score for a contact by email
   */
  async updateLeadScore(email: string, score: number, notes?: string): Promise<any> {
    try {
      // First find the contact by email
      const contact = await this.findContactByEmail(email);
      if (!contact) {
        throw new Error(`Contact not found for email: ${email}`);
      }

      // Determine lead status based on score
      const leadStatus = score >= 80 ? 'QUALIFIED' : 
                        score >= 60 ? 'CONNECTED' : 
                        score >= 40 ? 'IN_PROGRESS' : 
                        score >= 20 ? 'OPEN' : 'NEW';

      // Update the contact with new lead score and status
      const updateData: any = {
        hs_lead_status: leadStatus,
        lead_score: score.toString()
      };

      if (notes) {
        updateData.hs_lead_notes = notes;
      }

      return await this.updateContact(contact.id, updateData);
    } catch (error) {
      console.error('Error updating lead score:', error);
      throw error;
    }
  }
}

export { HubSpotService };
export default HubSpotService;
