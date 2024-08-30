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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.submitRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { rateeId, rating, comment } = req.body;
    const raterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Ensure user is defined
    if (!raterId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    try {
        // Ensure rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }
        const ratingEntry = yield prisma.rating.create({
            data: {
                raterId,
                rateeId,
                rating,
                comment,
            },
        });
        res.status(201).json(ratingEntry);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const ratings = yield prisma.rating.findMany({
            where: { rateeId: (userId) },
            include: {
                rater: true,
            },
        });
        res.status(200).json(ratings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
