// Vercel serverless handler — wraps the Express app from ../server/
const path = require('path');

// Point to the server directory so Node can resolve it
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') });

// Use tsx to compile TypeScript on the fly in production
// (Vercel installs tsx as a devDependency)
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ---- Auth Middleware ----
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch {}
  }
  next();
}

// ---- Helpers ----
function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function formatPlace(p) {
  return { ...p, vibe: safeJsonParse(p.vibe, []), images: safeJsonParse(p.images, []) };
}

// ---- Auth Routes ----
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: '用户名或邮箱已被注册' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
      select: { id: true, username: true, email: true, avatar: true, createdAt: true },
    });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user, accessToken });
  } catch {
    res.status(500).json({ error: '注册失败' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: '邮箱或密码错误' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: '邮箱或密码错误' });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt }, accessToken });
  } catch {
    res.status(500).json({ error: '登录失败' });
  }
});

authRouter.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, avatar: true, bio: true, createdAt: true, _count: { select: { places: true, favorites: true } } },
  });
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

// ---- Place Routes ----
const placesRouter = express.Router();

placesRouter.get('/', optionalAuth, async (req, res) => {
  const { city, category, vibe, search, page = '1', limit = '12' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (city) where.cityId = city;
  if (category) where.category = category;
  if (vibe) where.vibe = { contains: vibe };
  if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }];

  const [places, total] = await Promise.all([
    prisma.place.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, username: true, avatar: true } }, city: { select: { id: true, name: true, province: true } }, _count: { select: { favorites: true, reviews: true } } } }),
    prisma.place.count({ where }),
  ]);
  res.json({ places: places.map(formatPlace), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

placesRouter.get('/:id', optionalAuth, async (req, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id }, include: { author: { select: { id: true, username: true, avatar: true, bio: true } }, city: { select: { id: true, name: true, province: true } }, _count: { select: { favorites: true, reviews: true } } } });
  if (!place) return res.status(404).json({ error: '地点不存在' });
  let isFavorited = false;
  if (req.userId) {
    const fav = await prisma.favorite.findUnique({ where: { userId_placeId: { userId: req.userId, placeId: place.id } } });
    isFavorited = !!fav;
  }
  res.json({ ...formatPlace(place), isFavorited });
});

placesRouter.post('/', authenticate, async (req, res) => {
  try {
    const data = z.object({ title: z.string().min(1), description: z.string().min(1), address: z.string().optional(), latitude: z.number(), longitude: z.number(), category: z.string().default('OTHER'), vibe: z.array(z.string()).default([]), images: z.array(z.string()).default([]), cityId: z.string() }).parse(req.body);
    const place = await prisma.place.create({ data: { ...data, vibe: JSON.stringify(data.vibe), images: JSON.stringify(data.images), authorId: req.userId }, include: { author: { select: { id: true, username: true, avatar: true } }, city: { select: { id: true, name: true } } } });
    res.status(201).json(formatPlace(place));
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: '输入数据不合法', details: err.errors });
    res.status(500).json({ error: '创建地点失败' });
  }
});

placesRouter.delete('/:id', authenticate, async (req, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });
  if (!place) return res.status(404).json({ error: '地点不存在' });
  if (place.authorId !== req.userId) return res.status(403).json({ error: '无权删除' });
  await prisma.place.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ---- City Routes ----
const citiesRouter = express.Router();
citiesRouter.get('/', async (_req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { places: true } } } });
  res.json(cities);
});

// ---- User Routes ----
const usersRouter = express.Router();
usersRouter.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, username: true, avatar: true, bio: true, createdAt: true, _count: { select: { places: true, favorites: true } } } });
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

// ---- Upload Route (base64 for serverless) ----
const uploadRouter = express.Router();
uploadRouter.post('/', authenticate, (req, res) => {
  const { image } = req.body; // base64 data URL
  if (!image) return res.status(400).json({ error: '请提供图片 (base64 data URL)' });
  res.json({ url: image });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Export for Vercel serverless
module.exports = app;
