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
const fareService_1 = require("../services/fareService");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const bookingSchema = zod_1.z.object({
    userId: zod_1.z.number().positive(),
    roomId: zod_1.z.number().positive(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    distance: zod_1.z.number().positive().optional(),
    demand: zod_1.z.number().positive().optional(),
    surgeFactor: zod_1.z.number().nonnegative().optional()
});
function createBooking(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = bookingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }
        const { userId, roomId, startDate, endDate, distance, demand, surgeFactor } = parsed.data;
        try {
            let fare = null;
            if (distance !== undefined && demand !== undefined && surgeFactor !== undefined) {
                fare = yield fareService_1.calculateFare({ distance, demand, surgeFactor });
            }
            // Create booking record
            const booking = yield prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    BookingFare: {
                        create: {
                            distance: distance !== null && distance !== void 0 ? distance : 0,
                            demand: demand !== null && demand !== void 0 ? demand : 0,
                            surgeFactor: surgeFactor !== null && surgeFactor !== void 0 ? surgeFactor : 0,
                            fare: fare !== null && fare !== void 0 ? fare : 0
                        }
                    }
                }
            });
            return res.status(201).json(booking); // Ensure that the function returns a response
        }
        catch (error) {
            console.error('Error creating booking:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
exports.createBooking = createBooking;
