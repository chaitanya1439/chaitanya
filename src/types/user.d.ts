import { User as PrismaUser } from '@prisma/client';

// Extend the PrismaUser type with a token property
export interface User extends PrismaUser {
  token?: string; // Optional, as it may not always be present
}
