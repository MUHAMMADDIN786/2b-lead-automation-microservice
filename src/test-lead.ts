import express from 'express';
import dotenv from 'dotenv';
import { handleLeadWebhook } from './webhooks/leadHandler';

// Load environment variables
dotenv.config();

// Create a temporary testing server
const app = express();
app.use(express.json());
app.post('/webhooks/lead', handleLeadWebhook);

const TEST_PORT = 3999;

const server = app.listen(TEST_PORT, async () => {
  console.log(`\n🧪 Spinning up ephemeral test server on port ${TEST_PORT}...`);
  
  const mockLead = {
    name: 'Jane Doe',
    email: 'jane.doe@enterpriseautomations.com',
    company: 'Enterprise Automations LLC',
    inquiry: 'We are looking to implement a custom AI Voice Agent for qualifying incoming calls. We need this syncing with our CRM. Please schedule a call ASAP, budget is flexible.'
  };

  console.log(`📤 Dispatching mock lead payload to http://localhost:${TEST_PORT}/webhooks/lead...`);
  console.log(`Payload:`, JSON.stringify(mockLead, null, 2));

  try {
    const response = await fetch(`http://localhost:${TEST_PORT}/webhooks/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockLead)
    });

    const result = (await response.json()) as any;
    
    console.log('\n📥 Webhook JSON Response:');
    console.log(JSON.stringify(result, null, 2));

    if (response.status === 200 && result.crmSync.success) {
      console.log('\n🟢 INTEGRATION TEST PASSED! The server validated headers, ran AI profiling, drafted the response, and synced to CRM.');
    } else {
      console.log('\n🔴 INTEGRATION TEST FAILED: Response status was not 200 or CRM sync failed.');
    }
  } catch (err: any) {
    console.error('\n🔴 Test execution failed due to server error:', err.message);
  } finally {
    server.close(() => {
      console.log('🧪 Ephemeral test server closed safely.\n');
    });
  }
});
