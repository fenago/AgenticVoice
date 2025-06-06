## Voice Receptionist for Appointment Management (tools)

## Introduction
### What This Template Does:
- This n8n workflow template automates appointment management using a voice AI receptionist powered by Vapi. It integrates Vapi with Google Calendar for real-time scheduling and Airtable for logging and data management. Agent checks availability, books new appointments, reschedules existing ones, or cancels appointments directly within Google Calendar.

### Problem It Solves:
- Managing appointment scheduling manually can be time-consuming, and limited by business hours. This template solves these issues by providing an automated, 24/7 (within configured business rules) voice-based scheduling system. It frees up human staff from routine scheduling tasks, reduces booking errors, ensures appointments are logged consistently, and enhances the customer experience by offering immediate scheduling capabilities over the phone. It also captures valuable call data like recordings, summaries, and costs for analysis.

## Setup Instructions

### Prerequisites:
- An active n8n instance.
- A Vapi account for the voice agent.
- A Google account with access to Google Calendar.
- An Airtable account.
- API Keys/Credentials for Google Calendar and Airtable configured in your n8n instance.

## Step-by-Step Setup:
### 1. Copy Airtable Base:
- Duplicate the provided Airtable base structure to your own Airtable account using this link: https://airtable.com/appxDqRoEgG5sF2gu/shrnZU0D29TPMCjpt
- Note: The n8n workflow is configured to work with the specific tables and fields in this base ("Appointments" and "Call Recording" tables).

### 2. Import n8n Workflow:
- Import the provided n8n workflow JSON into your n8n instance.

### 3. Configure n8n Credentials:
- Locate the Google Calendar nodes within the workflow (e.g., "Check Availability", "Get All Calendar Events", "Create Event", "Update Event", "Delete Event"). Ensure they are configured to use your Google Calendar credentials in n8n. Select the correct calendar to manage.
- Locate the Airtable nodes (e.g., "Logs the confirmed booking details", "Finds original appointment", "Updates Airtable record", "Save all information"). Ensure they are configured with your Airtable credentials and point to the correct Base and Tables you created in Step 1.

### 4. Activate the n8n Workflow:
- Save and activate the n8n workflow. This generates the live Webhook URLs needed for Vapi.

### 5. Configure Vapi Assistant:
- **System Prompt:** Copy the system prompt provided in the large sticky note within the n8n workflow. Adapt it as needed (e.g., business name, hours) and paste it into your Vapi Assistant's System Prompt configuration. This prompt instructs the AI on its role, rules, and how/when to use the tools.

- **Tools Setup:** In your Vapi Assistant configuration, define the following 4 tools:
  - Getslots Tool:
    - Purpose: To check calendar availability.
    - Webhook URL: Copy the Production URL from the "Getslot_tool" Webhook node in your active n8n workflow (path: /getslots) and paste it here.
  - Bookslots Tool:
    - Purpose: To create a new calendar event.
    - Webhook URL: Copy the Production URL from the "bookslots_tool" Webhook node in your active n8n workflow (path: /bookslots) and paste it here.
  - Updateslots Tool:
    - Purpose: To modify an existing calendar event.
    - Webhook URL: Copy the Production URL from the "Updateslots_tool" Webhook node in your active n8n workflow (path: /updateslots) and paste it here.
  - Cancelslots Tool:
    - Purpose: To delete a calendar event.
    - Webhook URL: Copy the Production URL from the "CancelSlots_tool" Webhook node in your active n8n workflow (path: /cancelslots) and paste it here.
- **Server Webhook (End of Call Report):**
  - In Vapi's server configuration section (often under webhooks or reporting), find the setting for the end-of-call-report or similar event.
  - Copy the Production URL from the "call_results" Webhook node in your active n8n workflow (path: /callresults).
  - Paste this URL into the Vapi configuration for the end-of-call server webhook. This allows n8n to receive and log call summaries, recordings, etc., after the call ends.

## Video Walkthrough (coming soon)
### [🎥 Watch set up video (~2min)](https://www.loom.com/share/d379895004374ddc85dc9171ca37c139?sid=0996f0d2-aff2-45a7-aae9-c62df4fb0799)
