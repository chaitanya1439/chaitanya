import { Router } from 'express';
import multer from 'multer';
import passport from 'passport';
import { uploadFile, downloadFile, deleteFile } from '../services/s3Service';
import { authMiddleware } from '../middleware/authenticate';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT_SECRET is defined
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Initialize S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME is not defined in the environment variables');
}

// Sign in and generate JWT
router.post('/signin', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate a presigned URL for S3 file upload
router.get('/presignedUrl', authMiddleware, async (req, res) => {
  const userId = req.user;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: `auth/${userId}/${Math.random()}/image.png`,
      Conditions: [['content-length-range', 0, 5 * 1024 * 1024]], // 5 MB max
      Fields: {
        'Content-Type': 'image/png',
      },
      Expires: 3600,
    });

    res.json({ presignedUrl: url, fields });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload file to S3
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.single('file'), uploadFile);

// Download file from S3
router.get('/download/:filePath', passport.authenticate('jwt', { session: false }), downloadFile);

// Delete file from S3
router.delete('/delete/:filePath', passport.authenticate('jwt', { session: false }), deleteFile);

export default router;
