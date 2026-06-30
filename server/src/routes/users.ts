import { Router, Response } from 'express';
import { prisma } from '../app';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/users/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, username: true, avatar: true, bio: true, createdAt: true,
      _count: { select: { places: true, favorites: true } },
      places: {
        take: 12,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, images: true, category: true, createdAt: true,
          city: { select: { id: true, name: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
      },
    },
  });
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  // Parse images JSON strings into arrays
  const placesWithImages = user.places.map((p) => ({
    ...p,
    images: safeJsonParse(p.images, []),
  }));
  res.json({ ...user, places: placesWithImages });
});

// Helper — safe JSON parse
function safeJsonParse(str: string, fallback: any) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// GET /api/users/:id/favorites
router.get('/:id/favorites', async (req: AuthRequest, res: Response) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.params.id },
    orderBy: { id: 'desc' },
    include: {
      place: {
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          city: { select: { id: true, name: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
      },
    },
  });
  res.json(favorites.map(f => f.place));
});

export default router;
