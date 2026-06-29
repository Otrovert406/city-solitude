import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      res.status(409).json({ error: '用户名或邮箱已被注册' });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, username: true, email: true, avatar: true, createdAt: true },
    });

    const token = generateTokens(user.id);
    res.status(201).json({ user, ...token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: '输入数据不合法', details: err.errors });
      return;
    }
    res.status(500).json({ error: '注册失败' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    const token = generateTokens(user.id);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      ...token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: '输入数据不合法', details: err.errors });
      return;
    }
    res.status(500).json({ error: '登录失败' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, username: true, email: true, avatar: true,
      bio: true, createdAt: true,
      _count: { select: { places: true, favorites: true } },
    },
  });
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  res.json(user);
});

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

export default router;
