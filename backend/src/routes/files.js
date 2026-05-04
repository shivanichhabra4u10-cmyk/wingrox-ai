// FILE UPLOAD ROUTES · multipart upload, list, download, delete
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_MB = parseInt(process.env.MAX_UPLOAD_MB || '20');
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         // xlsx
  'application/vnd.ms-powerpoint',
  'application/msword',
  'application/vnd.ms-excel',
];

// Ensure upload dir exists at startup
await fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

// Multer config — local disk for dev. For prod, switch to multer-s3.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type not allowed: ${file.mimetype}`));
  },
});

// POST /api/files — upload (multipart/form-data, field name 'files')
// Optional: ?sessionId=xxx to attach to a specific session
router.post('/', upload.array('files', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  // If sessionId provided, verify ownership
  let sessionId = req.query.sessionId || req.body.sessionId || null;
  if (sessionId) {
    const session = await prisma.diagnosticSession.findFirst({
      where: { id: sessionId, userId: req.user.id },
      select: { id: true },
    });
    if (!session) sessionId = null; // silently drop bad session ref
  }
  
  const records = await prisma.$transaction(
    req.files.map(f => prisma.uploadedFile.create({
      data: {
        userId: req.user.id,
        sessionId,
        filename: f.originalname,
        mimeType: f.mimetype,
        sizeBytes: f.size,
        storageKey: path.basename(f.path),
        storageDriver: process.env.UPLOAD_DRIVER || 'local',
      },
      select: { id: true, filename: true, sizeBytes: true, mimeType: true, createdAt: true },
    }))
  );
  
  res.status(201).json({ files: records });
}));

// GET /api/files — list user's files
router.get('/', asyncHandler(async (req, res) => {
  const files = await prisma.uploadedFile.findMany({
    where: { userId: req.user.id, ...(req.query.sessionId && { sessionId: req.query.sessionId }) },
    orderBy: { createdAt: 'desc' },
    select: { id: true, filename: true, sizeBytes: true, mimeType: true, createdAt: true, sessionId: true },
  });
  res.json({ files });
}));

// DELETE /api/files/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const file = await prisma.uploadedFile.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  // Remove from disk (best-effort — don't fail the request if file is already gone)
  if (file.storageDriver === 'local') {
    await fs.unlink(path.join(UPLOAD_DIR, file.storageKey)).catch(() => {});
  }
  // TODO: add S3 deletion when storageDriver === 's3'
  
  await prisma.uploadedFile.delete({ where: { id: file.id } });
  res.json({ ok: true });
}));

export default router;
