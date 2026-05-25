import { Request, Response } from 'express';
import { z } from 'zod';
import { analyzeLeadAndDraftResponse, LeadAnalysis } from '../services/openai';
import { analyzeLeadWithGemini } from '../services/gemini';
import { syncToCRM } from '../services/crm';

// Validation schema for incoming webhook leads
const IncomingLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  inquiry: z.string().min(10, 'Inquiry must be at least 10 characters long')
});

export async function handleLeadWebhook(req: Request, res: Response): Promise<void> {
  try {
    // 1. Optional Webhook Security Check
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const clientSecret = req.headers['x-webhook-secret'];
      if (clientSecret !== webhookSecret) {
        res.status(401).json({ error: 'Unauthorized: Invalid webhook secret token' });
        return;
      }
    }

    // 2. Validate request payload structure
    const validationResult = IncomingLeadSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation Failed',
        details: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    const { name, email, company, inquiry } = validationResult.data;

    let aiAnalysis: LeadAnalysis;
    const useGemini = !!process.env.GEMINI_API_KEY;

    if (useGemini) {
      console.log(`🤖 Received lead from ${name} (${company}). Analyzing with Gemini 1.5 Flash...`);
      aiAnalysis = await analyzeLeadWithGemini(name, email, company, inquiry);
    } else {
      console.log(`🤖 Received lead from ${name} (${company}). Analyzing with GPT-4o-mini...`);
      aiAnalysis = await analyzeLeadAndDraftResponse(name, email, company, inquiry);
    }

    // 4. Sync lead & draft to CRM
    const crmResult = await syncToCRM({
      name,
      email,
      company,
      inquiry,
      analysis: aiAnalysis
    });

    // 5. Respond with results
    res.status(200).json({
      message: 'Lead processed successfully',
      lead: { name, email, company },
      analysis: {
        quality: aiAnalysis.leadQuality,
        intentScore: aiAnalysis.intentScore,
        estimatedSize: aiAnalysis.companySizeEstimate,
        painPoint: aiAnalysis.leadSummary,
        offerings: aiAnalysis.suggestedOfferings
      },
      crmSync: {
        success: crmResult.success,
        id: crmResult.crmId,
        error: crmResult.error
      },
      actions: {
        followUpEmailDrafted: true
      }
    });

  } catch (error: any) {
    console.error('🔴 Error processing lead webhook:', error);
    res.status(500).json({
      error: 'Processing Error',
      message: error.message || 'An error occurred while running the automation workflow.'
    });
  }
}
