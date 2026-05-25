# B2B Lead Automation & AI Qualification Microservice

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Framework-Express.js-lightgrey.svg)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--4o--mini-orange.svg)](https://openai.com/)
[![Zod](https://img.shields.io/badge/Validation-Zod-purple.svg)](https://zod.dev/)

An enterprise-ready, custom backend microservice designed to ingest inbound lead webhook payloads, run advanced AI-driven qualification & profiling via **GPT-4o-mini** with guaranteed JSON structure, and sync leads with automated response drafts to business CRMs (HubSpot, Google Sheets, custom databases, etc.).

## 🌐 The Business Problem This Solves

No-code workflow platforms like Make.com and Zapier are great for basic triggers, but they fall short for scaling businesses in three key ways:
1. **Unpredictable AI Formats**: Raw LLM prompts often return varying text shapes, causing subsequent webhook steps to break.
2. **High Platform Operation Cost**: Running heavy loops, complex string parsing, and validation schemas directly inside Make.com consumes thousands of expensive monthly operations.
3. **Lack of Security & Error Boundaries**: If a CRM API is temporarily down, standard no-code templates fail silently or freeze.

**This Microservice** acts as a hybrid engine. By delegating complex processing to a custom TypeScript backend, businesses gain **100% data predictability**, **robust security**, and **dramatic cost reductions** in automation operations.

---

## 🏗️ System Architecture

```
[ Lead Source ] (e.g. Google Forms, Webflow, Typeform)
       │
       ▼ (Webhook Trigger)
 [ Make.com / Zapier Router ]
       │
       ▼ (Secure HTTP POST)
┌─────────────────────────────────────────────────────────────┐
│               B2B CUSTOM AUTOMATION MICROSERVICE            │
│                                                             │
│  1. Request Validator (Zod)                                  │
│     Ensures email formatting, string lengths, and headers   │
│                                                             │
│  2. AI Profiler & Copywriter (GPT-4o-mini + Zod Output)      │
│     - Rates intent score (1-10)                             │
│     - Assesses lead quality (HIGH/MEDIUM/LOW)               │
│     - Identifies core friction points                       │
│     - Drafts a highly-personalized, contextual response     │
│                                                             │
│  3. CRM Database Synchronizer                               │
│     Logs contact, AI tags, and draft response to CRM        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼ (REST API)
 [ HubSpot / Salesforce / Sheets ]
```

---

## 🛠️ Tech Stack & Key Implementations

- **Express.js & TypeScript**: Clean separation of concerns with robust controller-service architecture.
- **Zod Schema Validation**: Validates inbound requests before hitting any AI models, saving computation costs.
- **Guaranteed Structured Outputs**: Utilizes OpenAI's `beta.chat.completions.parse` with `zodResponseFormat`. This guarantees the AI response is returned in a predictable JSON structure conforming exactly to TypeScript interfaces.
- **Mock Fallback Engine**: If OpenAI API keys are not supplied, the app automatically runs smart heuristic analyses and simulates CRM syncs, making demo runs and offline testing flawless.
- **Express Error Boundaries**: Prevents app crashes, handling payload errors and returning structured JSON API errors.

---

## 🚀 Getting Started

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm or yarn

### 📥 Installation
1. Clone the repository to your server/local environment.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables file and configure it:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `OPENAI_API_KEY` and optional `CRM_ENDPOINT_URL` / `CRM_ACCESS_TOKEN`.

### 🧪 Run Local Integration Test
We have built an ephemeral test suite that launches a mock server, executes the complete workflow using a simulated high-value lead payload, and prints the result:
```bash
npm run test:mock
```

### 💻 Running in Development
Start the dev server with hot-reloading:
```bash
npm run dev
```

### 🏗️ Compiling for Production
Compile the TypeScript code to optimized Javascript:
```bash
npm run build
npm start
```

---

## 📨 API Reference

### Process Webhook Lead
* **URL**: `/webhooks/lead`
* **Method**: `POST`
* **Headers**: 
  * `Content-Type: application/json`
  * `x-webhook-secret: [Your Shared Secret]` (Optional)
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@enterpriseautomations.com",
    "company": "Enterprise Automations LLC",
    "inquiry": "We need to set up a custom Vapi.ai voice agent syncing contact records to HubSpot. Current budget is $10k."
  }
  ```
* **Success Response (Code 200)**:
  ```json
  {
    "message": "Lead processed successfully",
    "lead": {
      "name": "Jane Doe",
      "email": "jane.doe@enterpriseautomations.com",
      "company": "Enterprise Automations LLC"
    },
    "analysis": {
      "quality": "HIGH",
      "intentScore": 9,
      "estimatedSize": "SME (10-50 employees)",
      "painPoint": "Needs custom Vapi.ai integration synced to HubSpot CRM.",
      "offerings": [
        "Vapi.ai Voice Agent integration",
        "CRM Sync custom webhook middleware"
      ]
    },
    "crmSync": {
      "success": true,
      "id": "mock-crm-lead-284910"
    },
    "actions": {
      "followUpEmailDrafted": true
    }
  }
  ```

---

## 🤝 Need Custom Automations?

This project is a small showcase of custom API integrations. If you are looking to build:
1. Custom Make.com modules or custom Zapier integrations.
2. AI-powered Voice Agents (Vapi, Retell, Bland) connected to your database.
3. Complex web scraping pipelines or SaaS synchronization.

Feel free to reach out via [Upwork / Fiverr] or schedule a direct consultation.
