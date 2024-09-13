import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('Google API key is not set');
}

export const getETAFromGoogle = async (
  pickupLat: number, pickupLong: number, dropoffLat: number, dropoffLong: number
): Promise<number> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`, {
        params: {
          origins: `${pickupLat},${pickupLong}`,
          destinations: `${dropoffLat},${dropoffLong}`,
          key: GOOGLE_API_KEY,
        },
      }
    );

    const element = response.data.rows[0]?.elements[0];
    if (element?.status === 'OK') {
      const durationInSeconds = element.duration.value; // Duration in seconds
      const durationInMinutes = Math.ceil(durationInSeconds / 60); // Convert to minutes
      return durationInMinutes;
    } else {
      throw new Error(`API Error: ${element?.status || 'Unknown status'}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching ETA from Google Maps API:', error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw new Error('Error fetching ETA from Google Maps API');
  }
};

// Helper function to calculate distance in kilometers between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  // Validate input values
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lat2) || !isValidCoordinate(lon1) || !isValidCoordinate(lon2)) {
    throw new Error('Invalid coordinates');
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function isValidCoordinate(coord: number): boolean {
  return typeof coord === 'number' && coord >= -90 && coord <= 90;
}
