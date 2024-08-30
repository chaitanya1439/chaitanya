import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();
const stripeClient = new Stripe('YOUR_STRIPE_SECRET_KEY', { apiVersion: '2024-06-20' }); // Update the API version here

// Schema validation using Zod
const paymentSchema = z.object({
  amount: z.number(),
  method: z.enum(['UPI', 'Credit Card', 'Digital Wallet', 'Cash']),
  orderId: z.number()
});

router.post('/process', async (req: Request, res: Response) => {
  const { amount, method, orderId } = req.body;

  try {
    // Validate request body
    paymentSchema.parse({ amount, method, orderId });

    // Handle payment processing
    if (method === 'Credit Card') {
      // Example for Stripe
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: 'usd',
        payment_method_types: ['card'],
        confirm: true
      });

      // Save payment to database
      await prisma.payment.create({
        data: {
          amount,
          method,
          status: paymentIntent.status,
          orderId
        }
      });

      return res.status(200).json({ message: 'Payment successful', paymentIntent });
    } else if (method === 'UPI' || method === 'Digital Wallet') {
      // Integrate with respective UPI or Digital Wallet API
      // For example purposes, we just log the request
      console.log(`Processing ${method} payment`);

      // Save payment to database
      await prisma.payment.create({
        data: {
          amount,
          method,
          status: 'Pending',
          orderId
        }
      });

      return res.status(200).json({ message: 'Payment initiated' });
    } else if (method === 'Cash') {
      // Handle cash payments
      // Save payment to database
      await prisma.payment.create({
        data: {
          amount,
          method,
          status: 'Pending',
          orderId
        }
      });

      return res.status(200).json({ message: 'Cash payment recorded' });
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
