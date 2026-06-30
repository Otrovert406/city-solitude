import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// POST /api/upload - upload single image (base64 JSON, compatible with serverless)
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { image } = req.body;
  if (!image || typeof image !== 'string' || !image.startsWith('data:')) {
    res.status(400).json({ error: '请提供 base64 图片 (data URL)' });
    return;
  }
  res.json({ url: image });
});

// POST /api/upload/multiple - upload multiple images (max 6, multipart form-data)
router.post('/multiple', authenticate, upload.array('images', 6), (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: '请选择图片文件' });
    return;
  }
  const urls = files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
