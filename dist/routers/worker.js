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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role, name, phone } = req.body;
    if (!email || !role || !phone) {
        return res.status(400).json({ message: 'Email, role, and phone are required' });
    }
    try {
        const worker = yield prisma.worker.create({
            data: {
                email,
                role,
                name,
                phone,
            },
        });
        return res.status(201).json({ message: 'Worker created', worker });
    }
    catch (error) {
        console.error('Error in register:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
