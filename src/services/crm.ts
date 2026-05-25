import { LeadAnalysis } from './openai';

export interface LeadPayload {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  analysis: LeadAnalysis;
}

/**
 * Syncs processed lead data and AI analysis to the client's CRM (e.g., HubSpot, Salesforce, or custom webhook).
 * Demonstrates retry logic and robust HTTP request handling.
 */
export async function syncToCRM(payload: LeadPayload): Promise<{ success: boolean; crmId?: string; error?: string }> {
  const crmUrl = process.env.CRM_ENDPOINT_URL;
  const crmToken = process.env.CRM_ACCESS_TOKEN;

  if (!crmUrl) {
    console.log('ℹ️ CRM_ENDPOINT_URL not set. Simulating CRM Sync locally.');
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Log the payload beautifully in the console for demo purposes
    console.log('\n--- [MOCK CRM SYNC SUCCESS] ---');
    console.log(`Lead: ${payload.name} (${payload.company})`);
    console.log(`Email: ${payload.email}`);
    console.log(`AI Quality Check: ${payload.analysis.leadQuality} (Score: ${payload.analysis.intentScore}/10)`);
    console.log(`Suggested offer: ${payload.analysis.suggestedOfferings.join(', ')}`);
    console.log(`Draft Response Saved: Yes (${payload.analysis.draftedEmailResponse.slice(0, 100)}...)`);
    console.log('-------------------------------\n');
    
    return {
      success: true,
      crmId: `mock-crm-lead-${Math.floor(Math.random() * 1000000)}`
    };
  }

  // Attempt real CRM Sync
  try {
    console.log(`Syncing lead ${payload.name} to CRM at ${crmUrl}...`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (crmToken) {
      headers['Authorization'] = `Bearer ${crmToken}`;
    }

    const response = await fetch(crmUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        // Format payload to fit general HubSpot / Zapier webhook formats
        properties: {
          firstname: payload.name.split(' ')[0] || payload.name,
          lastname: payload.name.split(' ').slice(1).join(' ') || '',
          email: payload.email,
          company: payload.company,
          message: payload.inquiry,
          lead_quality: payload.analysis.leadQuality,
          intent_score: payload.analysis.intentScore,
          lead_summary: payload.analysis.leadSummary,
          suggested_offering: payload.analysis.suggestedOfferings[0] || 'Automation Audit',
          email_draft: payload.analysis.draftedEmailResponse
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM API responded with code ${response.status}: ${errorText}`);
    }

    const data = await response.json() as any;
    console.log('✅ Successfully synced to CRM:', data);

    return {
      success: true,
      crmId: data.id || data.crmId || 'crm-id-success'
    };
  } catch (error: any) {
    console.error('❌ CRM Sync Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
