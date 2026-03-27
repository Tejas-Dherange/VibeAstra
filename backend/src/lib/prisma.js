const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Singleton pattern for Prisma in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = global.prisma || prisma;
}

module.exports = prisma;
