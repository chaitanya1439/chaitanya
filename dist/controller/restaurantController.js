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
exports.createRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, address } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const restaurant = yield prisma.restaurant.create({
            data: {
                name,
                address,
                userId,
            },
        });
        return res.status(201).json({ message: 'Restaurant created successfully', restaurant });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getRestaurants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const restaurants = yield prisma.restaurant.findMany({
            where: { userId },
            include: { menu: true },
        });
        return res.status(200).json({ restaurants });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.addMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId, name, description, price } = req.body;
    try {
        const menuItem = yield prisma.menuItem.create({
            data: {
                name,
                description,
                price,
                restaurantId,
            },
        });
        return res.status(201).json({ message: 'Menu item added successfully', menuItem });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getMenuItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId } = req.params;
    try {
        const menuItems = yield prisma.menuItem.findMany({
            where: { restaurantId: parseInt(restaurantId) },
        });
        return res.status(200).json({ menuItems });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
