import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import authMiddleware from '../middleware/auth';


const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.ACCESS_SECRET ?? "",
    },
    region: "us-east-1"
})

const router = Router();

const prismaClient = new PrismaClient();

router.get("/presignedUrl", authMiddleware, async (req, res) => {
    const userId = req.user?.id;
  
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    // Optionally verify that the user exists in the database
    const user = await prismaClient.user.findUnique({
      where: {
        id: Number(userId)
      },
    });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    })

    res.json({
        preSignedUrl: url,
        fields
    })
    
})
