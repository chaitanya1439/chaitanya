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
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = require("../config/passport");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// Define the user schema
const userSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
// Register a new user
exports.register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = userSchema.parse(req.body);
        const { email, password, name } = parsedData;
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const createdUser = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        const token = passport_1.generateToken(createdUser);
        return res.status(201).json({
            message: 'User registered successfully',
            user: Object.assign(Object.assign({}, createdUser), { password: undefined }),
            token
        });
    }
    catch (error) {
        console.error('Error in register:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Login a user
exports.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginSchema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    });
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = passport_1.generateToken(user);
        return res.status(200).json({
            message: 'Login successful',
            user: Object.assign(Object.assign({}, user), { password: undefined }),
            token
        });
    }
    catch (error) {
        console.error('Error in login:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Logout a user
exports.logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Invalidate the token if you're storing it in a database or cache
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (token) {
            // Decode the token to find the user ID (assuming the token contains this info)
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded === null || decoded === void 0 ? void 0 : decoded.id) {
                // Optionally, store invalidated tokens or remove them from a token store
                // await prisma.invalidatedTokens.create({ data: { token } });
            }
        }
        // Clear any authentication-related cookies (if used)
        res.clearCookie('token'); // Assuming you're using cookies to store the token
        // Perform the logout operation
        req.logout((err) => {
            if (err) {
                console.error('Error in logout:', err);
                return res.status(500).json({ message: 'Logout failed', error: err.message });
            }
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    }
    catch (error) {
        console.error('Error in logout:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Get user profile
exports.getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { Order: true, Reward: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error in getUserProfile:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Update user profile
exports.updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const updateSchema = zod_1.z.object({
        name: zod_1.z.string().min(1, { message: 'Name is required' }),
    });
    try {
        const { name } = updateSchema.parse(req.body);
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { name },
        });
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error in updateUserProfile:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
