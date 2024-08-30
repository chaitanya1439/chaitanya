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
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const googleMapsClient = new google_maps_services_js_1.Client({});
const FareSchema = zod_1.z.object({
    pickupLat: zod_1.z.number(),
    pickupLong: zod_1.z.number(),
    dropoffLat: zod_1.z.number(),
    dropoffLong: zod_1.z.number(),
    demand: zod_1.z.number(),
});
router.post('/calculate-fare', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const { pickupLat, pickupLong, dropoffLat, dropoffLong, demand } = FareSchema.parse(req.body);
        // Calculate distance using Google Maps Distance Matrix API
        const distanceResponse = yield googleMapsClient.distancematrix({
            params: {
                origins: [`${pickupLat},${pickupLong}`],
                destinations: [`${dropoffLat},${dropoffLong}`],
                key: 'process.env.GOOGLE_KEY',
            },
        });
        const distance = distanceResponse.data.rows[0].elements[0].distance.value / 1000; // distance in km
        // Fetch fare details from the database
        const fareData = yield prisma.fare.findFirst();
        if (!fareData) {
            return res.status(500).json({ message: 'Fare data not found' });
        }
        const { baseFare, perKmRate, surgeMultiplier } = fareData;
        // Calculate fare
        const surgeFactor = surgeMultiplier; // Example: a static multiplier
        const totalFare = baseFare + (perKmRate * distance * surgeFactor * demand);
        return res.status(200).json({ distance, totalFare });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
