import { PrismaClient } from '@prisma/client';
import { calculateDistance, getETAFromGoogle } from '../utils/calculateDistance';

const prisma = new PrismaClient();

// Track driver location and update in the database
export const trackDriver = async (driverId: string, latitude: number, longitude: number) => {
  try {
    // Check if the driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Update driver location in the database
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { latitude, longitude },
    });

    return updatedDriver;
  } catch (error) {
    // Improved error handling
    console.error('Error updating driver location:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while updating driver location');
  }
};

// Track rider location and update in the database
export const trackRider = async (riderId: number, latitude: number, longitude: number) => {
  try {
    // Check if the rider exists
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
    });

    if (!rider) {
      throw new Error('Rider not found');
    }

    // Update rider location in the database
    const updatedRider = await prisma.user.update({
      where: { id: riderId },
      data: { latitude, longitude },
    });

    return updatedRider;
  } catch (error) {
    // Improved error handling
    console.error('Error updating rider location:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while updating rider location');
  }
};

// Calculate ETA based on distance and average speed
export const calculateETA = async (
  pickupLat: number,
  pickupLong: number,
  dropoffLat: number,
  dropoffLong: number
): Promise<number> => {
  try {
    const distance = calculateDistance(pickupLat, pickupLong, dropoffLat, dropoffLong);
    const averageSpeed = 50; // Assume an average speed in km/h
    const etaInMinutes = Math.ceil((distance / averageSpeed) * 60); // ETA in minutes
    return etaInMinutes;
  } catch (error) {
    // Improved error handling
    console.error('Error calculating ETA:', error);
    throw new Error(error instanceof Error ? 'Error calculating ETA: ' + error.message : 'An unknown error occurred while calculating ETA');
  }
};

// Get ETA from Google Maps API
export const getETA = async (
  pickupLat: number,
  pickupLong: number,
  dropoffLat: number,
  dropoffLong: number
): Promise<number> => {
  try {
    const etaInMinutes = await getETAFromGoogle(pickupLat, pickupLong, dropoffLat, dropoffLong);
    return etaInMinutes;
  } catch (error) {
    // Improved error handling
    console.error('Error fetching ETA from Google Maps API:', error);
    throw new Error(error instanceof Error ? 'Error fetching ETA from Google Maps API: ' + error.message : 'An unknown error occurred while fetching ETA from Google Maps API');
  }
};
