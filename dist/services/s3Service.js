"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.downloadFile = exports.uploadFile = exports.getSignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv = __importStar(require("dotenv"));
const stream_1 = require("stream");
dotenv.config();
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
    throw new Error('Missing one or more AWS environment variables');
}
const s3Client = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
// Get a presigned URL for downloading a file from S3
function getSignedUrl(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.id;
        const filePath = `auth/${userId}/${Math.random()}/image.png`;
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filePath,
        });
        try {
            const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
            res.json({ presignedUrl });
        }
        catch (error) {
            console.error('Error generating presigned URL', error);
            res.status(500).json({ message: 'Error generating presigned URL' });
        }
    });
}
exports.getSignedUrl = getSignedUrl;
// Upload a file to S3
const uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { fileBuffer, mimeType } = req.body;
    if (!fileBuffer || !mimeType) {
        res.status(400).json({ message: 'No file data provided' });
        return;
    }
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: `auth/${userId}/${Math.random()}/image.png`,
        Body: Buffer.from(fileBuffer, 'base64'),
        ContentType: mimeType,
    };
    try {
        yield s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error('Error uploading file to S3:', error);
        next(error);
    }
});
exports.uploadFile = uploadFile;
// Download a file from S3
const downloadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = req.params.filePath;
    const downloadParams = {
        Bucket: BUCKET_NAME,
        Key: filePath,
    };
    try {
        const { Body } = yield s3Client.send(new client_s3_1.GetObjectCommand(downloadParams));
        if (Body instanceof stream_1.Readable) {
            Body.pipe(res);
        }
        else {
            throw new Error('Unexpected response body from S3');
        }
    }
    catch (error) {
        console.error('Error downloading file from S3:', error);
        next(error);
    }
});
exports.downloadFile = downloadFile;
// Delete a file from S3
const deleteFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = req.params.filePath;
    const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: filePath,
    };
    try {
        yield s3Client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting file from S3:', error);
        next(error);
    }
});
exports.deleteFile = deleteFile;
