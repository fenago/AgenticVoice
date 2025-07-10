import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HubSpot Tracking Test | AgenticVoice",
  description: "Test page to verify HubSpot tracking implementation",
};

export default function HubSpotTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            HubSpot Tracking Test Page
          </h1>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                ✅ HubSpot Tracking Implemented
              </h2>
              <p className="text-green-700">
                HubSpot tracking code has been successfully added to the main layout.
                This test page verifies that tracking is active across all AgenticVoice pages.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Tracking Implementation Details
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Global tracking script added to app/layout.tsx</li>
                <li>• Script ID: 242953242 (js-na2.hs-scripts.com)</li>
                <li>• Loaded asynchronously for optimal performance</li>
                <li>• Active on all pages including admin, dashboard, and marketing pages</li>
                <li>• hubspotContactId field added to User model for future CRM sync</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                Next Steps for Full HubSpot Integration
              </h3>
              <ol className="space-y-2 text-yellow-700 list-decimal list-inside">
                <li>Implement contact synchronization API endpoints</li>
                <li>Add event tracking for user actions and registrations</li>
                <li>Create marketing automation workflows</li>
                <li>Build HubSpot analytics dashboard integration</li>
                <li>Implement lead scoring based on platform usage</li>
              </ol>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>How to verify tracking:</strong> Open browser developer tools,
                go to Network tab, refresh this page, and look for requests to 
                js-na2.hs-scripts.com to confirm HubSpot tracking is loading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
