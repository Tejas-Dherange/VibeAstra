const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rule-based Smart Feed Engine
function generateAlerts(placements, buses, events, foods, userInterests) {
  const alerts = [];
  const now = new Date();

  // ─── PLACEMENT ALERTS ───────────────────────────────────────────────────
  placements.forEach((p) => {
    const hoursLeft = (new Date(p.deadline) - now) / (1000 * 60 * 60);
    const isInterested =
      userInterests.length === 0 ||
      p.tags.some((tag) => userInterests.includes(tag));

    if (hoursLeft < 0) return; // skip expired

    if (hoursLeft <= 2 && isInterested) {
      alerts.push({
        id: `placement-urgent-${p.id}`,
        type: 'placement',
        priority: 'HIGH',
        emoji: '🔥',
        title: `${p.company} deadline in ${Math.round(hoursLeft * 60)} minutes!`,
        message: `${p.role} | ${p.ctc || 'CTC not disclosed'} — Apply NOW!`,
        refId: p.id,
        createdAt: now,
      });
    } else if (hoursLeft <= 24 && isInterested) {
      alerts.push({
        id: `placement-warn-${p.id}`,
        type: 'placement',
        priority: 'MEDIUM',
        emoji: '⚠️',
        title: `${p.company} – ${p.role}`,
        message: `Deadline in ${Math.round(hoursLeft)} hours. ${p.ctc || ''}`,
        refId: p.id,
        createdAt: now,
      });
    } else if (isInterested) {
      alerts.push({
        id: `placement-normal-${p.id}`,
        type: 'placement',
        priority: 'LOW',
        emoji: '💼',
        title: `New opportunity: ${p.company} – ${p.role}`,
        message: `Deadline: ${new Date(p.deadline).toLocaleDateString()}. ${p.ctc || ''}`,
        refId: p.id,
        createdAt: now,
      });
    }
  });

  // ─── BUS ALERTS ─────────────────────────────────────────────────────────
  buses.forEach((bus) => {
    const minsLeft = (new Date(bus.arrivalTime) - now) / (1000 * 60);
    if (minsLeft < 0) return;

    if (minsLeft <= 8) {
      alerts.push({
        id: `bus-urgent-${bus.id}`,
        type: 'bus',
        priority: 'HIGH',
        emoji: '🚌',
        title: `Leave NOW for ${bus.route}`,
        message: `Bus arrives in ${Math.round(minsLeft)} min. Status: ${bus.status}`,
        refId: bus.id,
        createdAt: now,
      });
    } else if (minsLeft <= 20) {
      alerts.push({
        id: `bus-warn-${bus.id}`,
        type: 'bus',
        priority: 'MEDIUM',
        emoji: '🕐',
        title: `Leave in ~5 mins for ${bus.route}`,
        message: `Arrives in ${Math.round(minsLeft)} min. Status: ${bus.status}`,
        refId: bus.id,
        createdAt: now,
      });
    }
  });

  // ─── EVENT ALERTS ────────────────────────────────────────────────────────
  events.forEach((ev) => {
    const hoursLeft = (new Date(ev.date) - now) / (1000 * 60 * 60);
    const isRecommended =
      userInterests.length === 0 || userInterests.includes(ev.category);

    if (hoursLeft < 0) return;

    if (hoursLeft <= 3) {
      alerts.push({
        id: `event-urgent-${ev.id}`,
        type: 'event',
        priority: 'HIGH',
        emoji: '📍',
        title: `Starting SOON: ${ev.title}`,
        message: `In ${Math.round(hoursLeft * 60)} minutes — Don't miss it!`,
        refId: ev.id,
        createdAt: now,
      });
    } else if (hoursLeft <= 24 && isRecommended) {
      alerts.push({
        id: `event-tomorrow-${ev.id}`,
        type: 'event',
        priority: 'MEDIUM',
        emoji: '📅',
        title: `Tomorrow: ${ev.title}`,
        message: `${ev.description?.slice(0, 80)}... Recommended for you.`,
        refId: ev.id,
        createdAt: now,
      });
    } else if (isRecommended) {
      alerts.push({
        id: `event-recommend-${ev.id}`,
        type: 'event',
        priority: 'LOW',
        emoji: '✨',
        title: `Recommended: ${ev.title}`,
        message: `${new Date(ev.date).toLocaleDateString()} • ${ev.category}`,
        refId: ev.id,
        createdAt: now,
      });
    }
  });

  // ─── FOOD ALERTS ─────────────────────────────────────────────────────────
  const latestFood = foods[0];
  if (latestFood) {
    if (latestFood.rating < 2.5) {
      alerts.push({
        id: `food-low-${latestFood.id}`,
        type: 'food',
        priority: 'MEDIUM',
        emoji: '🍽️',
        title: `Mess rating is LOW today (${latestFood.rating}/5)`,
        message: 'Consider ordering from canteen or outside. Quality may be poor.',
        refId: latestFood.id,
        createdAt: now,
      });
    } else if (latestFood.rating >= 4.0) {
      alerts.push({
        id: `food-good-${latestFood.id}`,
        type: 'food',
        priority: 'LOW',
        emoji: '😋',
        title: `Great mess menu today! (${latestFood.rating}/5)`,
        message: latestFood.menu.split('|')[0].trim(),
        refId: latestFood.id,
        createdAt: now,
      });
    }
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return alerts;
}

// GET /api/smart-feed
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { interests: true },
    });

    const [placements, buses, events, foods] = await Promise.all([
      prisma.placement.findMany({ orderBy: { deadline: 'asc' } }),
      prisma.bus.findMany({ orderBy: { arrivalTime: 'asc' } }),
      prisma.event.findMany({ orderBy: { date: 'asc' } }),
      prisma.food.findMany({ orderBy: { date: 'desc' }, take: 5 }),
    ]);

    const alerts = generateAlerts(
      placements,
      buses,
      events,
      foods,
      user?.interests || []
    );

    res.json({
      alerts,
      stats: {
        total: alerts.length,
        high: alerts.filter((a) => a.priority === 'HIGH').length,
        medium: alerts.filter((a) => a.priority === 'MEDIUM').length,
        low: alerts.filter((a) => a.priority === 'LOW').length,
      },
    });
  } catch (error) {
    console.error('Smart feed error:', error);
    res.status(500).json({ message: 'Failed to generate smart feed' });
  }
});

module.exports = router;
