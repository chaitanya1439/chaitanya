"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const router = express_1.Router();
const prisma = new client_1.PrismaClient();
const stripeClient = new stripe_1.default('YOUR_STRIPE_SECRET_KEY', { apiVersion: '2024-06-20' }); // Update the API version here
// Schema validation using Zod
const paymentSchema = zod_1.z.object({
    amount: zod_1.z.number(),
    method: zod_1.z.enum(['UPI', 'Credit Card', 'Digital Wallet', 'Cash']),
    orderId: zod_1.z.number()
});
router.post('/process', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, method, orderId } = req.body;
    try {
        // Validate request body
        paymentSchema.parse({ amount, method, orderId });
        // Handle payment processing
        if (method === 'Credit Card') {
            // Example for Stripe
            const paymentIntent = yield stripeClient.paymentIntents.create({
                amount: amount * 100,
                currency: 'usd',
                payment_method_types: ['card'],
                confirm: true
            });
            // Save payment to database
            yield prisma.payment.create({
                data: {
                    amount,
                    method,
                    status: paymentIntent.status,
                    orderId
                }
            });
            return res.status(200).json({ message: 'Payment successful', paymentIntent });
        }
        else if (method === 'UPI' || method === 'Digital Wallet') {
            // Integrate with respective UPI or Digital Wallet API
            // For example purposes, we just log the request
            console.log(`Processing ${method} payment`);
            // Save payment to database
            yield prisma.payment.create({
                data: {
                    amount,
                    method,
                    status: 'Pending',
                    orderId
                }
            });
            return res.status(200).json({ message: 'Payment initiated' });
        }
        else if (method === 'Cash') {
            // Handle cash payments
            // Save payment to database
            yield prisma.payment.create({
                data: {
                    amount,
                    method,
                    status: 'Pending',
                    orderId
                }
            });
            return res.status(200).json({ message: 'Cash payment recorded' });
        }
        else {
            return res.status(400).json({ message: 'Invalid payment method' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
