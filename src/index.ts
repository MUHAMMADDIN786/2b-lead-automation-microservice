import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleLeadWebhook } from './webhooks/leadHandler';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests for production observability
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Lead processing webhook endpoint
app.post('/webhooks/lead', handleLeadWebhook);

// Global 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware (production-grade error boundary)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`==================================================`);
  console.log(`🚀 B2B Automation Hub running on port: ${port}`);
  console.log(`🚀 Health Check: http://localhost:${port}/health`);
  console.log(`🚀 Webhook Listener: http://localhost:${port}/webhooks/lead`);
  console.log(`==================================================`);
});
