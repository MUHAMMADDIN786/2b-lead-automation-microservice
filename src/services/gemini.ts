import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { LeadAnalysis } from './openai';

// JSON Schema to force Gemini 1.5 Flash to return structured outputs
const leadAnalysisSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    leadQuality: {
      type: SchemaType.STRING,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      description: 'The quality of the lead, based on budget, urgency, and requirements.'
    },
    intentScore: {
      type: SchemaType.INTEGER,
      description: 'Buyer intent score rated from 1 to 10.'
    },
    companySizeEstimate: {
      type: SchemaType.STRING,
      description: 'Estimated company size (e.g. Enterprise, SME, Start-up, Solo).'
    },
    leadSummary: {
      type: SchemaType.STRING,
      description: '1-sentence summary of what the lead wants to automate.'
    },
    keyRequirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '2-3 key requirements mentioned in the text.'
    },
    suggestedOfferings: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '1-2 services we should pitch them (e.g. AI Voice Agent, Make CRM webhook).'
    },
    draftedEmailResponse: {
      type: SchemaType.STRING,
      description: 'Draft a highly professional, natural follow-up response email with a scheduling call-to-action.'
    }
  },
  required: [
    'leadQuality',
    'intentScore',
    'companySizeEstimate',
    'leadSummary',
    'keyRequirements',
    'suggestedOfferings',
    'draftedEmailResponse'
  ]
};

export async function analyzeLeadWithGemini(
  name: string,
  email: string,
  company: string,
  inquiry: string
): Promise<LeadAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in your environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use the fast and cheap gemini-3.5-flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: leadAnalysisSchema,
      temperature: 0.2 // Lower temp for more analytical, predictable output
    }
  });

  const prompt = `
    You are an elite B2B AI & Automation consultant. You have received a new business lead inquiry.
    Analyze the lead and produce the required structured analysis JSON output.
    
    Lead Info:
    - Name: ${name}
    - Email: ${email}
    - Company: ${company}
    - Inquiry: ${inquiry}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    if (!responseText) {
      throw new Error('Gemini API returned an empty text response.');
    }

    return JSON.parse(responseText) as LeadAnalysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
export { LeadAnalysis };
