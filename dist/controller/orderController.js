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
exports.createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { menuItemId } = req.body;
    const userId = req.user.id;
    try {
        // Retrieve menu item details to get the price
        const menuItem = yield prisma.menuItem.findUnique({
            where: { id: menuItemId },
        });
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        // Calculate total amount (assuming price is a field in MenuItem)
        const totalAmount = menuItem.price;
        // Create the order
        const order = yield prisma.order.create({
            data: {
                userId,
                menuItemId,
                totalAmount,
                status: 'Pending',
            },
        });
        return res.status(201).json(order); // Ensure response is returned here
    }
    catch (error) {
        return res.status(500).json({ error: error.message }); // Ensure response is returned here
    }
});
exports.updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, status } = req.body;
    try {
        const order = yield prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
        return res.status(200).json(order); // Ensure response is returned here
    }
    catch (error) {
        return res.status(500).json({ error: error.message }); // Ensure response is returned here
    }
});
exports.cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.body;
    try {
        const order = yield prisma.order.update({
            where: { id: orderId },
            data: { status: 'Cancelled' },
        });
        return res.status(200).json(order); // Ensure response is returned here
    }
    catch (error) {
        return res.status(500).json({ error: error.message }); // Ensure response is returned here
    }
});
