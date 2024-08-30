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
exports.assignDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, deliveryPersonnelId } = req.body;
    try {
        const delivery = yield prisma.delivery.create({
            data: {
                orderId,
                deliveryPersonnelId,
                status: 'Assigned',
            },
        });
        res.status(201).json(delivery);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateDeliveryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deliveryId, status, location } = req.body;
    try {
        const delivery = yield prisma.delivery.update({
            where: { id: deliveryId },
            data: { status, location },
        });
        res.status(200).json(delivery);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDeliveries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deliveries = yield prisma.delivery.findMany({
            include: {
                order: true,
                deliveryPersonnel: true,
            },
        });
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
