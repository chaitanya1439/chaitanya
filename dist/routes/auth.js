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
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// --- PHONE OTP → JWT ---
router.post('/phone-jwt', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, uid } = req.body;
    if (!phoneNumber || !uid) {
        return res.status(400).json({ message: 'Missing phoneNumber or uid' });
    }
    try {
        let user = yield prisma.user.findUnique({ where: { uid } });
        if (!user) {
            user = yield prisma.user.create({
                data: { uid, phoneNumber, name: '', username: '' }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, phoneNumber: user.phoneNumber } });
    }
    catch (err) {
        next(err);
    }
}));
// --- GOOGLE OAUTH → JWT ---
router.post('/google-jwt', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username } = req.body;
    if (!name || !username) {
        return res.status(400).json({ message: 'Name and username are required' });
    }
    try {
        let user = yield prisma.user.findUnique({ where: { username } });
        if (!user) {
            user = yield prisma.user.create({
                data: { username, name, uid: `google-${username}`, phoneNumber: '' }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                phoneNumber: user.phoneNumber
            }
        });
    }
    catch (err) {
        next(err);
    }
}));
// --- PROTECTED ROUTES ---
router.use(auth_1.authMiddleware);
// GET CURRENT USER
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID missing' });
    }
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
}));
// UPDATE PROFILE (only if incomplete)
router.put('/update', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { name, username, phoneNumber } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent updates if already complete
        if (user.name && user.username && user.phoneNumber) {
            return res.status(403).json({ message: 'Profile already completed' });
        }
        // Check uniqueness
        if (phoneNumber) {
            const conflict = yield prisma.user.findUnique({ where: { phoneNumber } });
            if (conflict && conflict.id !== userId) {
                return res.status(409).json({ message: 'Phone number in use' });
            }
        }
        if (username) {
            const conflict = yield prisma.user.findUnique({ where: { username } });
            if (conflict && conflict.id !== userId) {
                return res.status(409).json({ message: 'Username in use' });
            }
        }
        const data = {};
        if (name)
            data.name = name;
        if (username)
            data.username = username;
        if (phoneNumber)
            data.phoneNumber = phoneNumber;
        const updated = yield prisma.user.update({ where: { id: userId }, data });
        res.json({ user: updated });
    }
    catch (err) {
        next(err);
    }
}));
// GET USER RIDES
router.get('/get-rides', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const rides = yield prisma.ride.findMany({
            where: { userId },
            include: { user: true, driver: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ rides });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
