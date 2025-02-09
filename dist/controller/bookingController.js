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
exports.cancelBooking = exports.bookRoom = exports.getAvailableRooms = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get available rooms
const getAvailableRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield prisma.room.findMany({ where: { availability: true } });
        return res.json(rooms);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getAvailableRooms = getAvailableRooms;
// Book a room
const bookRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, startDate, endDate } = req.body;
    const userId = req.user.id;
    try {
        const room = yield prisma.room.findUnique({ where: { id: roomId } });
        if (!room || !room.availability) {
            return res.status(400).json({ error: 'Room not available' });
        }
        const booking = yield prisma.booking.create({
            data: {
                userId,
                roomId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        yield prisma.room.update({
            where: { id: roomId },
            data: { availability: false },
        });
        return res.status(201).json(booking);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.bookRoom = bookRoom;
// Cancel a booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.body;
    const userId = req.user.id;
    try {
        const booking = yield prisma.booking.findUnique({
            where: { id: bookingId },
            include: { Room: true }, // Use the correct model name
        });
        if (!booking || booking.userId !== userId) {
            return res.status(400).json({ error: 'Invalid booking' });
        }
        yield prisma.booking.delete({ where: { id: bookingId } });
        yield prisma.room.update({
            where: { id: booking.roomId },
            data: { availability: true },
        });
        return res.status(200).json({ message: 'Booking cancelled' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.cancelBooking = cancelBooking;
