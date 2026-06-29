import { Router, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/cities
router.get('/', async (_req, res: Response) => {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { places: true } } },
  });
  res.json(cities);
});

export default router;
