# VAPI Admin Interface - 10-Step Implementation Plan

This document outlines a 10-step plan to build the VAPI Admin Interface using Next.js API routes. Each step includes implementation details, validation instructions, and a build check.

---

### **Step 1: Foundational API Endpoint for VAPI Overview Statistics**
- [x] **Status**: Complete
- [x] **Details**: Implemented the `/api/admin/vapi/overview` route to fetch total calls, customers, and duration.

---

### **Step 2: Display "Big Picture" Stats on the Dashboard UI**
- [x] **Status**: Complete
- [x] **Details**: Refactored the `/admin/vapi` page to display the overview stats using stat cards.

---

### **Step 3: Granular Views - Detailed Call Log**
- [x] **Status**: Complete
- [x] **Details**: Implemented a detailed, searchable, and filterable log of all individual VAPI calls.
- [x] **Level**: 3 (Granular)
- [x] **API**: Created a new endpoint (`/api/admin/vapi/calls`) to list all calls.
- [x] **UI**: Added a data table to the VAPI dashboard to display the calls, including status, duration, customer, and a link to the recording.

---

### **Step 4: Big Picture Views - System Performance**
- [x] **Status**: Complete
- [x] **Details**: Enhanced the VAPI overview to include system performance metrics like call success/failure rates and average call setup time.
- [x] **API**: Updated the `/api/admin/vapi/overview` endpoint with the new analytics.
- [x] **UI**: Added new stat cards to the dashboard to display these performance indicators.

---

### **Step 5: API for Usage Trends Chart**
- [x] **Status**: Complete
- [x] **Details**: Created a new API endpoint to serve time-series data for usage charts.
- [x] **API**: Implemented the `/api/admin/vapi/trends` route, which returns daily call and revenue statistics.
- [x] **Logic**: The endpoint leverages the existing `getSystemAnalytics` method to provide consistent trend data.

---

### **Step 6: Visualize Usage Trends with a Chart**
- [x] **Status**: Complete
- [x] **Details**: Integrated a chart to visualize call trends on the dashboard.
- [x] **File to Modify**: `app/admin/vapi/page.tsx`
- [x] **Logic**:
    - Fetch data from `/api/admin/vapi/trends`.
    - Use a charting library (e.g., Recharts) to create a line or bar chart showing calls per day.
- **Validation (Cascade)**: I will ensure the chart component is implemented correctly.
- **Validation (USER)**: You will see a "Usage Trends" chart on the VAPI dashboard displaying the data.
- **Build Check**: Run `npm run build`.

---

### **Step 7: Granular Call Details API**
- **Objective**: Create an API endpoint to get all details for a single, specific call.
- **File to Create**: `app/api/admin/vapi/calls/[callId]/route.ts`
- **Logic**: This dynamic route will take a `callId` and fetch its complete transcript, metadata, and any other available details from VAPI.
- **Validation (Cascade)**: I will test the endpoint with a valid call ID.
- **Validation (USER)**: You will navigate to `/api/admin/vapi/calls/<some-call-id>` and see detailed JSON for that call.
- **Build Check**: Run `npm run build`.

---

### **Step 8: UI for Granular Call Details**
- **Objective**: Create a modal or a dedicated page to display the details of a selected call.
- **Files to Create/Modify**: `app/admin/vapi/page.tsx` (for modal) or `app/admin/vapi/calls/[callId]/page.tsx` (for dedicated page). We will start with a modal.
- **Logic**:
    - When a user clicks a row in the "Recent Calls" table, trigger a modal.
    - The modal will fetch data from `/api/admin/vapi/calls/[callId]` and display the full transcript and metadata.
- **Validation (Cascade)**: I will review the modal implementation and data fetching logic.
- **Validation (USER)**: You will click on a call in the table, and a modal will pop up showing its details.
- **Build Check**: Run `npm run build`.

---

### **Step 9: API for Customer-Specific VAPI Usage**
- **Objective**: Create an API endpoint to fetch all VAPI calls for a specific customer.
- **File to Create**: `app/api/admin/vapi/customers/[customerId]/calls/route.ts`
- **Logic**: This route will take a `customerId` and return a list of all their VAPI calls.
- **Validation (Cascade)**: I will test the endpoint with a valid customer ID.
- **Validation (USER)**: You will navigate to `/api/admin/vapi/customers/<some-customer-id>/calls` and see the call history for that customer.
- **Build Check**: Run `npm run build`.

---

### **Step 10: UI for Customer-Specific Drill-Down View**
- **Objective**: Enhance the existing customer list to allow drilling down into a customer's VAPI usage.
- **File to Modify**: `app/admin/vapi/page.tsx`
- **Logic**:
    - Add a "View Calls" button or link to each customer in the existing customer list.
    - Clicking this will either filter the main "Recent Calls" table to show only that customer's calls or open a modal/navigate to a page displaying their call history (fetched from the endpoint in Step 9).
- **Validation (Cascade)**: I will review the implementation of the drill-down feature.
- **Validation (USER)**: You will click the "View Calls" action for a customer and see their specific call history.
- **Build Check**: Run `npm run build` to finalize the implementation.
