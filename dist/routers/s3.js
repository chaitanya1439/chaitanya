"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const passport_1 = __importDefault(require("passport"));
const s3Service_1 = require("../services/s3Service");
const authenticate_1 = require("../middleware/authenticate");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
const upload = multer_1.default();
const JWT_SECRET = process.env.JWT_SECRET;
// Ensure JWT_SECRET is defined
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}
// Initialize S3 client
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined in the environment variables');
}
// Sign in and generate JWT
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const existingUser = yield prisma.user.findFirst({ where: { email } });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        }
        else {
            res.status(401).json({ message: 'Invalid email' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Generate a presigned URL for S3 file upload
router.get('/presignedUrl', authenticate_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const { url, fields } = yield s3_presigned_post_1.createPresignedPost(s3Client, {
            Bucket: BUCKET_NAME,
            Key: `auth/${userId}/${Math.random()}/image.png`,
            Conditions: [['content-length-range', 0, 5 * 1024 * 1024]],
            Fields: {
                'Content-Type': 'image/png',
            },
            Expires: 3600,
        });
        res.json({ presignedUrl: url, fields });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Upload file to S3
router.post('/upload', passport_1.default.authenticate('jwt', { session: false }), upload.single('file'), s3Service_1.uploadFile);
// Download file from S3
router.get('/download/:filePath', passport_1.default.authenticate('jwt', { session: false }), s3Service_1.downloadFile);
// Delete file from S3
router.delete('/delete/:filePath', passport_1.default.authenticate('jwt', { session: false }), s3Service_1.deleteFile);
exports.default = router;
