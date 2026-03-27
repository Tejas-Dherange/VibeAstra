const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/food
router.get('/', authenticate, async (req, res) => {
  try {
    const food = await prisma.food.findMany({ orderBy: { date: 'desc' }, take: 5 });
    res.json(food);
  } catch {
    res.status(500).json({ message: 'Failed to fetch food menu' });
  }
});

// POST /api/food - Admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { menu, rating } = req.body;
    if (!menu) return res.status(400).json({ message: 'Menu is required' });
    const food = await prisma.food.create({
      data: { menu, rating: rating || 3.0 },
    });
    res.status(201).json(food);
  } catch {
    res.status(500).json({ message: 'Failed to create food entry' });
  }
});

// PUT /api/food/:id - Admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { menu, rating } = req.body;
    const food = await prisma.food.update({
      where: { id: req.params.id },
      data: {
        ...(menu && { menu }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
      },
    });
    res.json(food);
  } catch {
    res.status(500).json({ message: 'Failed to update food entry' });
  }
});

// DELETE /api/food/:id - Admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.food.delete({ where: { id: req.params.id } });
    res.json({ message: 'Food entry deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete food entry' });
  }
});

module.exports = router;
