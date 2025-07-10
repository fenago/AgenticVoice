import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../../libs/hubspot';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, contactIds, updateData, importData } = await request.json();
    const hubspot = new HubSpotService();

    switch (action) {
      case 'bulk_update':
        if (!contactIds || !updateData) {
          return NextResponse.json({ error: 'Missing contactIds or updateData' }, { status: 400 });
        }

        const updateResults = await Promise.allSettled(
          contactIds.map((contactId: string) =>
            hubspot.updateContact(contactId, { properties: updateData })
          )
        );

        const successful = updateResults.filter(result => result.status === 'fulfilled').length;
        const failed = updateResults.filter(result => result.status === 'rejected').length;

        // Track bulk update event
        await hubspot.trackEvent({
          eventName: 'contacts_bulk_updated_via_admin',
          properties: {
            updated_by: session.user.email,
            contacts_count: contactIds.length,
            successful_updates: successful,
            failed_updates: failed
          }
        });

        return NextResponse.json({
          message: `Bulk update completed: ${successful} successful, ${failed} failed`,
          results: { successful, failed }
        });

      case 'bulk_delete':
        if (!contactIds) {
          return NextResponse.json({ error: 'Missing contactIds' }, { status: 400 });
        }

        const deleteResults = await Promise.allSettled(
          contactIds.map((contactId: string) => hubspot.deleteContact(contactId))
        );

        const deletedCount = deleteResults.filter(result => result.status === 'fulfilled').length;
        const deleteFailedCount = deleteResults.filter(result => result.status === 'rejected').length;

        // Track bulk delete event
        await hubspot.trackEvent({
          eventName: 'contacts_bulk_deleted_via_admin',
          properties: {
            deleted_by: session.user.email,
            contacts_count: contactIds.length,
            successful_deletions: deletedCount,
            failed_deletions: deleteFailedCount
          }
        });

        return NextResponse.json({
          message: `Bulk delete completed: ${deletedCount} successful, ${deleteFailedCount} failed`,
          results: { successful: deletedCount, failed: deleteFailedCount }
        });

      case 'bulk_import':
        if (!importData || !Array.isArray(importData)) {
          return NextResponse.json({ error: 'Missing or invalid importData' }, { status: 400 });
        }

        const importResults = await Promise.allSettled(
          importData.map((contactData: any) =>
            hubspot.createContact({
              properties: {
                firstname: contactData.firstName,
                lastname: contactData.lastName,
                email: contactData.email,
                phone: contactData.phone,
                company: contactData.company,
                lifecyclestage: contactData.lifecycleStage || 'lead',
                hs_lead_status: contactData.leadStatus || 'NEW',
                ...contactData.customProperties
              }
            })
          )
        );

        const importedCount = importResults.filter(result => result.status === 'fulfilled').length;
        const importFailedCount = importResults.filter(result => result.status === 'rejected').length;

        // Track bulk import event
        await hubspot.trackEvent({
          eventName: 'contacts_bulk_imported_via_admin',
          properties: {
            imported_by: session.user.email,
            contacts_count: importData.length,
            successful_imports: importedCount,
            failed_imports: importFailedCount
          }
        });

        return NextResponse.json({
          message: `Bulk import completed: ${importedCount} successful, ${importFailedCount} failed`,
          results: { successful: importedCount, failed: importFailedCount }
        });

      case 'export':
        const { searchParams } = new URL(request.url);
        const exportFilters = searchParams.get('filters') ? JSON.parse(searchParams.get('filters')!) : [];
        
        const exportContacts = await hubspot.searchContacts({
          filters: exportFilters,
          properties: [
            'firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle',
            'lifecyclestage', 'hs_lead_status', 'createdate', 'lastmodifieddate',
            'hubspotscore', 'state', 'city', 'country', 'zip'
          ],
          limit: 1000 // Adjust based on needs
        });

        return NextResponse.json({
          message: 'Export completed',
                    data: exportContacts.results.map((contact: any) => ({
            id: contact.id,
            firstName: contact.properties.firstname,
            lastName: contact.properties.lastname,
            email: contact.properties.email,
            phone: contact.properties.phone,
            company: contact.properties.company,
            jobTitle: contact.properties.jobtitle,
            lifecycleStage: contact.properties.lifecyclestage,
            leadStatus: contact.properties.hs_lead_status,
            leadScore: contact.properties.hubspotscore,
            location: `${contact.properties.city || ''}, ${contact.properties.state || ''} ${contact.properties.country || ''}`.trim(),
            createdAt: contact.properties.createdate,
            updatedAt: contact.properties.lastmodifieddate
          }))
        });

      default:
        return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Bulk Contacts API Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute bulk action' },
      { status: 500 }
    );
  }
}
