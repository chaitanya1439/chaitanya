// types/user.ts

import { User as PrismaUser } from '@prisma/client';

export interface ExtendedUser extends PrismaUser {
  token?: string; // Add any additional fields you need
}
