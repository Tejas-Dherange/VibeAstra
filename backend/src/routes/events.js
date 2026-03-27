const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// GET /api/events/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch {
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// POST /api/events - Admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    if (!title || !date || !category) {
      return res.status(400).json({ message: 'Title, date, and category are required' });
    }
    const event = await prisma.event.create({
      data: { title, description, date: new Date(date), category },
    });
    res.status(201).json(event);
  } catch {
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(category && { category }),
      },
    });
    res.json(event);
  } catch {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
