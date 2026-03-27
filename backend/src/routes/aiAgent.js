const express = require('express');
const OpenAI = require('openai');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a smart campus assistant AI. Analyze student data and generate:
1. A brief summary of the student's day
2. Alerts with priority (high, medium, low)
3. Suggested actions the student should take

Rules:
- Placement deadline < 3 hours → high priority, suggest 'apply_now'
- Placement deadline < 24 hours, not applied → medium priority, suggest apply
- Bus arriving < 10 min → high priority, suggest 'leave_now'
- Event matches student interest → recommend it
- Food rating < 2.5 → suggest alternative
- Be concise and direct — students are busy

Return ONLY valid JSON in exactly this format, no markdown fences:
{
  "summary": "string (2-3 sentences max)",
  "alerts": [
    {
      "type": "placement | event | transport | food",
      "message": "string",
      "priority": "high | medium | low"
    }
  ],
  "actions": [
    {
      "label": "string",
      "type": "apply | reminder | navigation",
      "metadata": {
        "id": "string",
        "message": "string"
      }
    }
  ]
}`;

// POST /api/ai/agent
router.post('/agent', authenticate, async (req, res) => {
  try {
    // Fetch all fresh data for this user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, interests: true },
    });

    const now = new Date();

    const [placements, buses, events, foods] = await Promise.all([
      prisma.placement.findMany({ orderBy: { deadline: 'asc' } }),
      prisma.bus.findMany({ orderBy: { arrivalTime: 'asc' } }),
      prisma.event.findMany({ orderBy: { date: 'asc' } }),
      prisma.food.findMany({ orderBy: { date: 'desc' }, take: 3 }),
    ]);

    // Get this student's applications
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      select: { placementId: true, status: true },
    });
    const appliedIds = new Set(applications.map((a) => a.placementId));

    // Enrich placements with applied status & hours left
    const enrichedPlacements = placements.map((p) => ({
      id: p.id,
      company: p.company,
      role: p.role,
      deadline: p.deadline,
      hoursLeft: Math.round((new Date(p.deadline) - now) / 3600000),
      tags: p.tags,
      ctc: p.ctc,
      applied: appliedIds.has(p.id),
    })).filter((p) => p.hoursLeft > 0); // Only future ones

    const enrichedBuses = buses.map((b) => ({
      id: b.id,
      route: b.route,
      minsLeft: Math.round((new Date(b.arrivalTime) - now) / 60000),
      status: b.status,
    })).filter((b) => b.minsLeft > 0 && b.minsLeft < 120); // Next 2 hours only

    const enrichedEvents = events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      hoursLeft: Math.round((new Date(e.date) - now) / 3600000),
      isRelevant: user.interests.length === 0 || user.interests.includes(e.category),
    })).filter((e) => e.hoursLeft > 0 && e.hoursLeft < 72); // Next 3 days

    const enrichedFood = foods.map((f) => ({
      id: f.id,
      menu: f.menu.slice(0, 100),
      rating: f.rating,
    }));

    // Build compact context for OpenAI (keep tokens low)
    const userContext = {
      student: {
        name: user.name,
        interests: user.interests,
      },
      placements: enrichedPlacements.slice(0, 6),
      buses: enrichedBuses.slice(0, 4),
      events: enrichedEvents.slice(0, 5),
      food: enrichedFood[0] || null,
      currentTime: now.toISOString(),
    };

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this campus data and generate alerts for the student:\n${JSON.stringify(userContext, null, 2)}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0].message.content;

    // Safe JSON parse
    let agentResponse;
    try {
      agentResponse = JSON.parse(rawContent);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid JSON', raw: rawContent });
    }

    // Validate expected shape
    if (!agentResponse.summary || !Array.isArray(agentResponse.alerts)) {
      return res.status(500).json({ message: 'AI response missing required fields', raw: agentResponse });
    }

    agentResponse.alerts = agentResponse.alerts || [];
    agentResponse.actions = agentResponse.actions || [];

    // Attach usage stats for transparency
    res.json({
      ...agentResponse,
      _meta: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    // If OpenAI quota / key error, return graceful fallback
    if (error?.status === 429 || error?.status === 401 || error?.code === 'invalid_api_key') {
      return res.status(402).json({
        message: 'OpenAI API key invalid or quota exceeded. Please check your OPENAI_API_KEY in backend/.env',
        code: error?.status,
      });
    }
    console.error('AI agent error:', error);
    res.status(500).json({ message: 'AI agent failed', error: error.message });
  }
});

module.exports = router;
