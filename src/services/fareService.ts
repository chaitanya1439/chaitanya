import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CalculateFareParams {
  distance: number;
  demand?: number; // Optional if not always needed
  surgeFactor: number;
}

export async function calculateFare(params: CalculateFareParams): Promise<number> {
  const { distance, demand = 1, surgeFactor } = params; // Default demand to 1 if not provided

  // Fetch current fare settings
  const fareSettings = await prisma.fare.findFirst();

  if (!fareSettings) {
    throw new Error('Fare settings not found');
  }

  const { baseFare, perKmRate, surgeMultiplier, demandFactor } = fareSettings;

  // Calculate fare using all relevant factors
  // Example calculation including demand:
  const fare = (baseFare + (perKmRate * distance) * demandFactor * demand) * surgeMultiplier * surgeFactor;

  return fare;
}

