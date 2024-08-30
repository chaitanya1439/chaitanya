import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  throw new Error('Missing one or more AWS environment variables');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Get a presigned URL for downloading a file from S3
export async function getSignedUrl(req: Request, res: Response): Promise<void> {
  const userId = (req.user as { id: string }).id;
  const filePath = `auth/${userId}/${Math.random()}/image.png`;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
  });

  try {
    const presignedUrl = await getS3SignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL', error);
    res.status(500).json({ message: 'Error generating presigned URL' });
  }
}

// Upload a file to S3
export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = (req.user as { id: string }).id;
  const { fileBuffer, mimeType } = req.body;

  if (!fileBuffer || !mimeType) {
    res.status(400).json({ message: 'No file data provided' });
    return;
  }

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: `auth/${userId}/${Math.random()}/image.png`,
    Body: Buffer.from(fileBuffer, 'base64'), // Assuming fileBuffer is a base64 encoded string
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    next(error);
  }
};

// Download a file from S3
export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const filePath = req.params.filePath;

  const downloadParams = {
    Bucket: BUCKET_NAME,
    Key: filePath,
  };

  try {
    const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
    if (Body instanceof Readable) {
      Body.pipe(res);
    } else {
      throw new Error('Unexpected response body from S3');
    }
  } catch (error) {
    console.error('Error downloading file from S3:', error);
    next(error);
  }
};

// Delete a file from S3
export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const filePath = req.params.filePath;

  const deleteParams = {
    Bucket: BUCKET_NAME,
    Key: filePath,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    next(error);
  }
};
