import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define the schema for validating driver data
const driverSchema = z.object({
  name: z.string().min(1),
  vehicle: z.string().min(1),
  licenseNumber: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Validate UUID format
const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
};

// Define the type for the registerDriver function parameters
type RegisterDriverData = z.infer<typeof driverSchema>;

// Function to register a new driver
export const registerDriver = async (data: RegisterDriverData, workerId: string) => {
  // Validate the input data using Zod
  const parsedData = driverSchema.parse(data); // Use parse instead of safeParse to ensure all required fields are present

  // Validate the workerId
  if (!validateUUID(workerId)) {
    throw new Error(`Invalid worker ID: ${workerId}`);
  }

  // Ensure the worker exists
  const workerExists = await prisma.worker.findUnique({
    where: { id: workerId },
  });

  if (!workerExists) {
    throw new Error(`Worker with ID ${workerId} not found`);
  }

  // Create a new driver in the database, connecting it to the worker by ID
  const driver = await prisma.driver.create({
    data: {
      name: parsedData.name, // Now it's ensured to be non-optional
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
};

// Function to retrieve a driver by ID
export const getDriver = async (id: string) => {
  // Validate the ID
  if (!validateUUID(id)) {
    throw new Error(`Invalid driver ID: ${id}`);
  }

  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) {
    throw new Error('Driver not found');
  }

  return driver;
};
