import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const placeSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.string().default('OTHER'),
  vibe: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  cityId: z.string(),
});

// GET /api/places
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { city, category, vibe, search, page = '1', limit = '12' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (city) where.cityId = city as string;
  if (category) where.category = category as string;
  if (vibe) where.vibe = { has: vibe as string };
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [places, total] = await Promise.all([
    prisma.place.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        city: { select: { id: true, name: true, province: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
    }),
    prisma.place.count({ where }),
  ]);

  res.json({ places, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// GET /api/places/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const place = await prisma.place.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, username: true, avatar: true, bio: true } },
      city: { select: { id: true, name: true, province: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
  });
  if (!place) {
    res.status(404).json({ error: '地点不存在' });
    return;
  }

  // Check if current user favorited
  let isFavorited = false;
  if (req.userId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_placeId: { userId: req.userId, placeId: place.id } },
    });
    isFavorited = !!fav;
  }

  res.json({ ...place, isFavorited });
});

// POST /api/places
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = placeSchema.parse(req.body);
    const place = await prisma.place.create({
      data: { ...data, authorId: req.userId! },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        city: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(place);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: '输入数据不合法', details: err.errors });
      return;
    }
    res.status(500).json({ error: '创建地点失败' });
  }
});

// DELETE /api/places/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });
  if (!place) {
    res.status(404).json({ error: '地点不存在' });
    return;
  }
  if (place.authorId !== req.userId) {
    res.status(403).json({ error: '无权删除此地点' });
    return;
  }
  await prisma.place.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
