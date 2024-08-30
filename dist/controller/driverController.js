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
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Define the schema for validating driver data
const driverSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    vehicle: zod_1.z.string().min(1),
    licenseNumber: zod_1.z.string().min(5),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
// Validate UUID format
const validateUUID = (id) => {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
};
// Function to register a new driver
exports.registerDriver = (data, workerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate the input data using Zod
    const parsedData = driverSchema.parse(data); // Use parse instead of safeParse to ensure all required fields are present
    // Validate the workerId
    if (!validateUUID(workerId)) {
        throw new Error(`Invalid worker ID: ${workerId}`);
    }
    // Ensure the worker exists
    const workerExists = yield prisma.worker.findUnique({
        where: { id: workerId },
    });
    if (!workerExists) {
        throw new Error(`Worker with ID ${workerId} not found`);
    }
    // Create a new driver in the database, connecting it to the worker by ID
    const driver = yield prisma.driver.create({
        data: {
            name: parsedData.name,
            vehicle: parsedData.vehicle,
            licenseNumber: parsedData.licenseNumber,
            latitude: parsedData.latitude,
            longitude: parsedData.longitude,
            worker: {
                connect: {
                    id: workerId
                }
            },
        },
    });
    return driver;
});
// Function to retrieve a driver by ID
exports.getDriver = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate the ID
    if (!validateUUID(id)) {
        throw new Error(`Invalid driver ID: ${id}`);
    }
    const driver = yield prisma.driver.findUnique({ where: { id } });
    if (!driver) {
        throw new Error('Driver not found');
    }
    return driver;
});
