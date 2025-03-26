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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const auth_1 = __importDefault(require("../middleware/auth"));
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: (_a = process.env.ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : "",
        secretAccessKey: (_b = process.env.ACCESS_SECRET) !== null && _b !== void 0 ? _b : "",
    },
    region: "us-east-1"
});
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
router.get("/presignedUrl", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    // Use type assertion to inform TypeScript about req.user structure
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Optionally verify that the user exists in the database
    const user = yield prismaClient.user.findUnique({
        where: {
            id: Number(userId)
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: (_d = process.env.AWS_S3_BUCKET_NAME) !== null && _d !== void 0 ? _d : "",
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    });
    res.json({
        preSignedUrl: url,
        fields
    });
}));
exports.default = router;
