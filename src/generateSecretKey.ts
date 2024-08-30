import { randomBytes } from 'crypto';

const generateSecretKey = (): string => {
  return randomBytes(64).toString('hex');
};

// Generate secrets for JWT and session
const jwtSecretKey = generateSecretKey();
console.log(`Your JWT secret key is: ${jwtSecretKey}`);

const sessionSecretKey = generateSecretKey();
console.log(`Your session secret key is: ${sessionSecretKey}`);
