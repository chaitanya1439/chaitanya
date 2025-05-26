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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
/**
 * Express middleware to authenticate JWT and attach userId or driverId
 */
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = req.headers.authorization;
        if (!(header === null || header === void 0 ? void 0 : header.startsWith('Bearer '))) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = header.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload.role === 'user') {
            const user = yield prisma.user.findUnique({ where: { id: Number(payload.id) } });
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            req.userId = user.id;
        }
        else if (payload.role === 'driver') {
            const driver = yield prisma.driver.findUnique({ where: { id: String(payload.id) } });
            if (!driver)
                return res.status(404).json({ message: 'Driver not found' });
            req.driverId = driver.id;
        }
        else {
            return res.status(400).json({ message: 'Invalid role' });
        }
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.authMiddleware = authMiddleware;
