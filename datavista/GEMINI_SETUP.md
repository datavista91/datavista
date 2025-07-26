# 🤖 Gemini AI Integration Setup Guide

## Quick Setup (5 minutes)

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Create Environment File

1. In your project root, create a `.env` file:

```bash
# Copy .env.example to .env
cp .env.example .env
```

2. Add your API key to `.env`:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Test the Integration

1. Start your development server:

```bash
npm run dev
```

2. Upload a CSV file in DataVista
3. Go to the AI Chat section
4. Ask questions like:
   -  "Summarize my data"
   -  "What trends do you see?"
   -  "Suggest visualizations for this data"

## 🔒 Security Notes

**For Development:**

-  ✅ Client-side API calls are enabled
-  ✅ Request limiting (100 requests per session)
-  ✅ Environment variables for API keys
-  ⚠️ API key is visible in browser DevTools

**For Production:**

-  🚨 Move to server-side API calls (Firebase Functions)
-  🚨 Never deploy with client-side API keys
-  🚨 Add authentication and rate limiting

## 💡 Example Questions to Try

### Data Overview

-  "What does this dataset contain?"
-  "Give me a summary of the key statistics"
-  "How many rows and columns are there?"

### Analysis & Insights

-  "What are the main trends in this data?"
-  "Are there any outliers or anomalies?"
-  "What patterns do you notice?"
-  "Which columns are most important?"

### Visualization Suggestions

-  "What charts should I create?"
-  "How should I visualize this data?"
-  "Suggest the best visualization for trends"

### Data Quality

-  "Are there any data quality issues?"
-  "How much missing data is there?"
-  "Should I clean anything before analysis?"

## 🛠️ Troubleshooting

### "API key not found" Error

-  Check that `.env` file exists in project root
-  Verify `VITE_GEMINI_API_KEY` is set correctly
-  Restart the dev server after adding the key

### "Request limit reached" Error

-  You've hit the 100 request limit per session
-  Refresh the page to reset the counter
-  For production, implement proper rate limiting

### "Content blocked by safety filters" Error

-  Rephrase your question to be more specific
-  Avoid sensitive or inappropriate content
-  Focus on data analysis questions

## 📊 Usage Costs

Gemini Pro is very affordable:

-  **Input:** $0.50 per 1M tokens
-  **Output:** $1.50 per 1M tokens
-  **Typical chat:** ~2000-5000 tokens = $0.003-0.008
-  **100 chats:** ~$0.30-0.80

## 🔄 Migration to Production

When ready for production:

1. **Set up Firebase Functions:**

```bash
firebase init functions
cd functions
npm install @google/generative-ai
```

2. **Move API calls to server:**

```typescript
// functions/src/geminiChat.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
// Server-side implementation
```

3. **Update client to call your API:**

```typescript
// Replace direct Gemini calls with:
fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message, analysisData }) })
```

4. **Add authentication and rate limiting**

---

**Ready to start?** Add your API key to `.env` and start chatting with your data! 🚀
