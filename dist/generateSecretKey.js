"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
// Function to generate a secure random secret key
const generateSecretKey = () => {
    return (0, crypto_1.randomBytes)(64).toString('hex');
};
// Generate secrets for JWT and session
const jwtSecretKey = generateSecretKey();
console.log(`Your JWT secret key is: ${jwtSecretKey}`);
const sessionSecretKey = generateSecretKey();
console.log(`Your session secret key is: ${sessionSecretKey}`);
