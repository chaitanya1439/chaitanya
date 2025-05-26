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
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// Public: PHONE JWT
router.post('/phone-jwt', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, id } = req.body;
    if (!phoneNumber || !id) {
        res.status(400).json({ message: 'Missing phoneNumber or id' });
        return;
    }
    let driver = yield prisma.driver.findUnique({ where: { id } });
    if (!driver) {
        driver = yield prisma.driver.create({
            data: {
                id,
                phoneNumber,
                name: '',
                email: '',
                country: '',
                registrationNumber: '',
                registrationDate: new Date(),
                drivingLicense: '',
                vehicleColor: '',
                vehicleType: '',
                rate: 0,
                notificationToken: '',
            },
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: driver.id, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, driver: { id: driver.id, phoneNumber: driver.phoneNumber } });
})));
// Public: GOOGLE JWT
router.post('/google-jwt', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ message: 'Name and email are required' });
        return;
    }
    let driver = yield prisma.driver.findUnique({ where: { email } });
    if (!driver) {
        driver = yield prisma.driver.create({
            data: {
                id: `google-${email}`,
                name,
                email,
                phoneNumber: '',
                country: '',
                registrationNumber: '',
                registrationDate: new Date(),
                drivingLicense: '',
                vehicleColor: '',
                vehicleType: '',
                rate: 0,
                notificationToken: '',
            },
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: driver.id, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, driver: { id: driver.id, name: driver.name, email: driver.email, phoneNumber: driver.phoneNumber } });
})));
// Apply auth to protected routes
router.use(auth_1.authMiddleware);
// Protected: GET PROFILE
router.get('/me', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const driver = yield prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
        res.status(404).json({ message: 'Driver not found' });
        return;
    }
    res.json({ success: true, driver });
})));
// Protected: UPDATE PROFILE
router.put('/update', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const updateData = {};
    [
        'name', 'country', 'phoneNumber', 'email', 'vehicleType',
        'registrationNumber', 'drivingLicense', 'vehicleColor', 'notificationToken'
    ].forEach(field => {
        if (req.body[field] !== undefined)
            updateData[field] = req.body[field];
    });
    if (req.body.registrationDate)
        updateData.registrationDate = new Date(req.body.registrationDate);
    if (req.body.rate !== undefined)
        updateData.rate = req.body.rate;
    const updated = yield prisma.driver.update({ where: { id: driverId }, data: updateData });
    res.json({ success: true, driver: updated });
})));
// Protected: GET DRIVERS DATA
router.get('/get-drivers-data', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idsParam = req.query.ids;
    if (!idsParam) {
        res.status(400).json({ message: 'No driver IDs provided' });
        return;
    }
    const ids = idsParam.split(',');
    const drivers = yield prisma.driver.findMany({ where: { id: { in: ids } } });
    res.json({ success: true, drivers });
})));
// Protected: UPDATE STATUS
router.put('/update-status', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const { status } = req.body;
    const driver = yield prisma.driver.update({ where: { id: driverId }, data: { status } });
    res.json({ success: true, driver });
})));
// Protected: NEW RIDE
router.post('/new-ride', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const { userId, charge, status, currentLocationName, destinationLocationName, distance } = req.body;
    const ride = yield prisma.ride.create({
        data: {
            id: crypto_1.default.randomUUID(),
            userId,
            driverId,
            charge: parseFloat(charge),
            status,
            currentLocationName,
            destinationLocationName,
            distance,
        },
    });
    res.json({ success: true, ride });
})));
// Protected: UPDATE RIDE STATUS
router.put('/update-ride-status', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const { rideId, rideStatus } = req.body;
    if (!rideId || !rideStatus) {
        res.status(400).json({ message: 'Invalid input data' });
        return;
    }
    const existing = yield prisma.ride.findUnique({ where: { id: rideId } });
    if (!existing) {
        res.status(404).json({ message: 'Ride not found' });
        return;
    }
    const updatedRide = yield prisma.ride.update({ where: { id: rideId }, data: { status: rideStatus } });
    if (rideStatus === 'Completed') {
        yield prisma.driver.update({ where: { id: driverId }, data: { totalEarning: { increment: existing.charge }, totalRides: { increment: 1 } } });
    }
    res.json({ success: true, updatedRide });
})));
// Protected: GET RIDE LIST
router.get('/get-ride', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const rides = yield prisma.ride.findMany({ where: { driverId }, include: { user: true, driver: true } });
    res.json({ success: true, rides });
})));
// Protected: PENDING RIDES
router.get('/pending-rides', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.driverId;
    const rides = yield prisma.ride.findMany({
        where: { status: 'Requested' },
        include: { user: true }
    });
    res.json({ success: true, rides });
})));
exports.default = router;
