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
// Get all rooms
exports.getRooms = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield prisma.room.findMany();
        return res.json(rooms);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Update room information
exports.updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
        const updatedRoom = yield prisma.room.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (price !== undefined && { price })),
        });
        return res.json(updatedRoom);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
