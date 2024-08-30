import { PrismaClient } from '@prisma/client';
import { calculateDistance } from '../utils/calculateDistance';

const prisma = new PrismaClient();

export async function trackDriver(driverId: string, latitude: number, longitude: number) {
  try {
    // Check if the driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Update driver location
    return await prisma.driver.update({
      where: { id: driverId },
      data: { latitude, longitude },
    });
  } catch (error) {
    throw new Error(error.message || 'An error occurred while updating driver location');
  }
}

export async function trackRider(riderId: number, latitude: number, longitude: number) {
  try {
    // Check if the rider exists
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
    });

    if (!rider) {
      throw new Error('Rider not found');
    }

    // Update rider location
    return await prisma.user.update({
      where: { id: riderId },
      data: { latitude, longitude },
    });
  } catch (error) {
    throw new Error(error.message || 'An error occurred while updating rider location');
  }
}

export async function calculateETA(pickupLat: number, pickupLong: number, dropoffLat: number, dropoffLong: number): Promise<number> {
  try {
    const distance = calculateDistance(pickupLat, pickupLong, dropoffLat, dropoffLong);
    const averageSpeed = 50; // Average speed in km/h
    return Math.ceil((distance / averageSpeed) * 60); // ETA in minutes
  } catch (error) {
    throw new Error('An error occurred while calculating ETA');
  }
}
