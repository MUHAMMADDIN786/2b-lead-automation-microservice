import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

// Define the structured schema using Zod
export const LeadAnalysisSchema = z.object({
  leadQuality: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  intentScore: z.number().min(1).max(10),
  companySizeEstimate: z.string(),
  leadSummary: z.string(),
  keyRequirements: z.array(z.string()),
  suggestedOfferings: z.array(z.string()),
  draftedEmailResponse: z.string(),
});

export type LeadAnalysis = z.infer<typeof LeadAnalysisSchema>;

// Initialize OpenAI client
// Note: If OPENAI_API_KEY is not set, we'll fall back to mock data so the demo runs without API keys
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function analyzeLeadAndDraftResponse(
  name: string,
  email: string,
  company: string,
  inquiry: string
): Promise<LeadAnalysis> {
  if (!openai) {
    console.log('⚠️ OpenAI API Key not found. Falling back to mock AI analysis for development.');
    // Simulated processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Smart heuristic based mock responses
    const inquiryLower = inquiry.toLowerCase();
    const isHighQuality = inquiryLower.includes('budget') || inquiryLower.includes('enterprise') || inquiryLower.includes('schedule');
    const isUrgent = inquiryLower.includes('now') || inquiryLower.includes('asap') || inquiryLower.includes('urgent');

    return {
      leadQuality: isHighQuality ? 'HIGH' : 'MEDIUM',
      intentScore: isUrgent ? 9 : 6,
      companySizeEstimate: inquiryLower.includes('enterprise') ? 'Enterprise (1000+)' : 'SME (10-50 employees)',
      leadSummary: `Client ${name} from ${company} wants to automate: ${inquiry.slice(0, 60)}...`,
      keyRequirements: [
        inquiryLower.includes('voice') ? 'AI Voice Agent' : 'Workflow Automation',
        inquiryLower.includes('crm') ? 'CRM Integration' : 'Lead Response speed'
      ],
      suggestedOfferings: [
        inquiryLower.includes('voice') ? 'Vapi.ai Voice Agent integration' : 'Make.com webhook sync pipeline',
        'AI email auto-responder microservice'
      ],
      draftedEmailResponse: `Hi ${name},\n\nThanks for reaching out to us regarding your request at ${company}.\n\nI read your inquiry: "${inquiry}"\n\nWe specialize in building exact systems like this using Make.com and custom Node.js middleware to sync with CRMs. This will completely eliminate manual data entry and cut response time down to under 2 minutes.\n\nAre you available for a brief 10-minute discovery call tomorrow at 2 PM or 4 PM EST?\n\nBest regards,\nAamir\nFounder, B2B Automation Solutions`
    };
  }

  const prompt = `
    You are an elite B2B AI & Automation consultant. You have received a new business lead inquiry.
    Analyze the lead and produce a structured analysis.
    
    Lead Info:
    - Name: ${name}
    - Email: ${email}
    - Company: ${company}
    - Inquiry: ${inquiry}
    
    Tasks:
    1. Assess lead quality ('HIGH', 'MEDIUM', 'LOW') based on budget hints, company size, and specific requirements.
    2. Give an intent score (1 to 10) on how ready they are to implement the solution.
    3. Estimate company size based on inquiry context (e.g. Enterprise, SME, Start-up, Solo).
    4. Provide a 1-sentence summary of the lead's main pain point.
    5. List 2-3 key requirements mentioned in the inquiry.
    6. List 1-2 automation offerings we should pitch them (e.g., custom AI Voice Agent, Make.com CRM Sync, n8n webhook middleware).
    7. Draft a highly professional, compelling, and customized response email. The email should address their specific problem, explain how automation solves it, and contain a CTA (call to action) to schedule a consultation call. Keep it concise, natural, and persuasive.
  `;

  try {
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an advanced B2B AI lead parser.' },
        { role: 'user', content: prompt }
      ],
      response_format: zodResponseFormat(LeadAnalysisSchema, 'lead_analysis'),
    });

    const parsed = response.choices[0].message.parsed;
    if (!parsed) {
      throw new Error('Failed to parse OpenAI response format.');
    }
    return parsed;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
