"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const generateSecretKey = () => {
    return crypto_1.randomBytes(64).toString('hex');
};
// Generate secrets for JWT and session
const jwtSecretKey = generateSecretKey();
console.log(`Your JWT secret key is: ${jwtSecretKey}`);
const sessionSecretKey = generateSecretKey();
console.log(`Your session secret key is: ${sessionSecretKey}`);
