/**
 * Decision Room Backend Server
 * Express + Vite Middleware with Resilient Gemini API Integration
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 1. Mandatory Top-Level Body Deserialization Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Google GenAI Client Initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// 2. Resilient Gemini Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
];

interface FallbackOptions {
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}

async function generateWithFallback(
  prompt: string,
  options: FallbackOptions = {}
): Promise<{ text: string; modelUsed: string }> {
  const client = getAIClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    let timer: NodeJS.Timeout | null = null;
    try {
      const contentPromise = client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature ?? 0.7,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Timeout after 22s on model ${modelName}`));
        }, 22000);
      });

      const response = await Promise.race([contentPromise, timeoutPromise]);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      const responseText = response.text || '';
      if (responseText) {
        return { text: responseText, modelUsed: modelName };
      }
    } catch (err: any) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastError = err;
      console.warn(`Model ${modelName} attempt notice:`, err?.message || err);
      // Sequentially attempt next model in fallback ladder
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// ==========================================
// API ROUTES
// ==========================================

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'decision-room-api',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Debate generation endpoint
app.post('/api/debate', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const {
      decisionTitle = '',
      context = '',
      category = 'general',
      history = [],
      targetPersona = 'all',
      userReply = '',
    } = body;

    if (!decisionTitle && !userReply) {
      return res.status(400).json({ error: 'A decision title or user response is required.' });
    }

    const cleanHistory = Array.isArray(history) ? history : [];

    // System prompt setting up the rigorous 3-Persona framework
    const systemPrompt = `You are the core intelligence engine of "Decision Room", where three distinct, highly specialized AI personas debate real-world decisions faced by the user.

THE THREE PERSONAS:
1. "The Realist" (persona: "realist"):
   - Role: Practical risks, cashflow/financial runway, logistics, hidden execution frictions, downside mitigation, and brutal operational realities.
   - Tone: Grounded, analytical, direct, calm, structured, and protective.
   - Mandate: Interrogate the actual specifics mentioned by the user. Avoid cliché generic advice.

2. "The Dreamer" (persona: "dreamer"):
   - Role: High-upside ambition, asymmetric growth, compounding skills/freedom, creative expansion, and the long-term cost of regret and inaction.
   - Tone: Inspiring, vision-oriented, energetic, forward-looking, and empowering.
   - Mandate: Paint a concrete, high-ceiling vision of what success looks like for this specific scenario.

3. "The Skeptic" (persona: "skeptic"):
   - Role: Poking holes in foundational assumptions, uncovering cognitive biases (e.g. grass-is-greener syndrome, boredom disguised as purpose, optimism bias, sunk cost), and stress-testing both the Realist and Dreamer.
   - Tone: Provocative, sharp, candid, inquisitive, and intellectually rigorous.
   - Mandate: Ask the uncomfortable question neither the Realist nor the Dreamer thought to ask.

RULES:
- Address the user's specific context, constraints, and words directly. Do NOT output generic templates.
- If targetPersona is "all", output all three personas in sequence.
- If targetPersona is specific ("realist", "dreamer", or "skeptic"), output ONLY that single persona responding deeply to the user's latest pushback while acknowledging the conversation history.
- Return ONLY valid JSON in the requested schema.`;

    let promptContent = ``;

    if (cleanHistory.length === 0 || targetPersona === 'all') {
      promptContent = `
DECISION TO DEBATE:
Title: "${decisionTitle}"
Category: ${category}
Context & Details: "${context || 'No additional details provided.'}"

${userReply ? `Latest User Follow-up/Pushback: "${userReply}"` : ''}

Generate structured debate responses from all 3 personas (The Realist, The Dreamer, The Skeptic).
Respond with a JSON object containing an array "responses" with 3 items.

JSON Schema:
{
  "responses": [
    {
      "persona": "realist",
      "headline": "Short 4-8 word punchy summary thesis",
      "content": "2-3 crisp paragraphs directly breaking down practical risks, logistics, and constraints for this exact decision.",
      "keyQuestionOrRisk": "One sharp, pivotal risk or logistical reality check."
    },
    {
      "persona": "dreamer",
      "headline": "Short 4-8 word punchy vision thesis",
      "content": "2-3 crisp paragraphs outlining the asymmetric upside, growth trajectory, and why this leap matters.",
      "keyQuestionOrRisk": "One inspiring catalytic question pushing them forward."
    },
    {
      "persona": "skeptic",
      "headline": "Short 4-8 word punchy contrarian thesis",
      "content": "2-3 crisp paragraphs exposing hidden assumptions, stress-testing both sides, and identifying cognitive blindspots.",
      "keyQuestionOrRisk": "One uncomfortable question challenging their underlying motives."
    }
  ]
}`;
    } else {
      // Single persona pushback turn
      const historyTranscript = cleanHistory
        .map((t: any) => `${t.sender.toUpperCase()}: ${t.content}`)
        .join('\n\n');

      promptContent = `
ORIGINAL DECISION: "${decisionTitle}"
Context: "${context || ''}"

PRIOR DEBATE HISTORY:
${historyTranscript}

LATEST USER PUSHBACK TARGETING ${targetPersona.toUpperCase()}:
"${userReply}"

Generate a targeted response ONLY for persona: "${targetPersona}".
Acknowledge the user's pushback directly, defend or adjust your stance with high intellectual rigor, and challenge them back.

JSON Schema:
{
  "responses": [
    {
      "persona": "${targetPersona}",
      "headline": "Short 4-8 word direct rebuttal or thesis",
      "content": "2-3 crisp paragraphs responding specifically to the user's pushback, maintaining your distinct persona personality.",
      "keyQuestionOrRisk": "One focused follow-up challenge question."
    }
  ]
}`;
    }

    const { text, modelUsed } = await generateWithFallback(promptContent, {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.75,
    });

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback extraction if model enclosed in markdown backticks
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      model: modelUsed,
      responses: parsed.responses || [],
    });
  } catch (err: any) {
    console.error('Error in /api/debate:', err);
    return res.status(500).json({
      error: 'Failed to generate persona debate responses.',
      details: err?.message || String(err),
    });
  }
});

// Decision pattern insights endpoint
app.post('/api/pattern-summary', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { decisions = [] } = body;

    const resolvedDecisions = Array.isArray(decisions)
      ? decisions.filter((d: any) => d.status === 'resolved' && d.chosenPersona)
      : [];

    if (resolvedDecisions.length < 3) {
      return res.json({
        hasEnoughHistory: false,
        message: 'At least 3 resolved decisions with logged outcomes are required to synthesize meaningful personalized patterns.',
        resolvedCount: resolvedDecisions.length,
      });
    }

    const summaryData = resolvedDecisions.map((d: any) => ({
      title: d.title,
      category: d.category || 'general',
      chosenPersona: d.chosenPersona,
      outcome: d.outcome || 'pending',
      outcomeReflection: d.outcomeReflection || '',
      resolvedAt: d.resolvedAt,
    }));

    const systemPrompt = `You are the Meta-Cognition Analyst for Decision Room.
You analyze a user's authenticated history of resolved decisions and real-world outcomes to identify genuine behavioral patterns, decision biases, and predictive advice.

CRITICAL RULES:
- Ground your analysis strictly in the provided decision records. Do NOT invent fake decisions.
- Highlight which persona alignments yielded the highest positive outcomes.
- Identify subtle cognitive tendencies (e.g. "When you align with The Skeptic on career decisions, you report 100% positive outcomes, but you frequently overlook The Dreamer's advice on creative projects").
- Provide 2-3 specific cognitive strengths and 2-3 specific blindspots.`;

    const prompt = `
USER'S RESOLVED DECISION HISTORY (${resolvedDecisions.length} decisions):
${JSON.stringify(summaryData, null, 2)}

Provide a deep, objective pattern synthesis. Return strictly valid JSON.

JSON Schema:
{
  "summaryHeadline": "A sharp, 1-sentence characterization of their decision-making archetype",
  "aiInsightSummary": "3-4 paragraphs analyzing their alignment patterns across personas (Realist, Dreamer, Skeptic), outcome correlation, and tendencies by category.",
  "topStrengths": [
    "Specific evidence-backed strength 1",
    "Specific evidence-backed strength 2"
  ],
  "blindspots": [
    "Specific tendency or risk area 1",
    "Specific tendency or risk area 2"
  ],
  "recommendedRule": "A personalized actionable decision heuristic for their next major crossroads"
}`;

    const { text, modelUsed } = await generateWithFallback(prompt, {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.6,
    });

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    return res.json({
      hasEnoughHistory: true,
      resolvedCount: resolvedDecisions.length,
      model: modelUsed,
      analysis: parsed,
    });
  } catch (err: any) {
    console.error('Error in /api/pattern-summary:', err);
    return res.status(500).json({
      error: 'Failed to generate pattern insights.',
      details: err?.message || String(err),
    });
  }
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Decision Room server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
