import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from './config/passport'; // Ensure this file exists
import cors from 'cors';
import helmet from 'helmet'; 
import morgan from 'morgan'; 
import dotenv from 'dotenv';
import axios from 'axios';
import { z, ZodError } from 'zod';

// Load environment variables
dotenv.config();

// Application constants
const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const sessionSecret = process.env.SESSION_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure to add this in your .env file

if (!sessionSecret || !OPENAI_API_KEY) {
  console.error('SESSION_SECRET or OPENAI_API_KEY environment variable is not set');
  process.exit(1); // Exit with failure
}

const app = express();

// Middlewares
app.use(helmet()); // Security middleware
app.use(morgan('dev')); // HTTP request logger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Session handling
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }, 
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Import and use routers
import userRouter from './routers/user';
import workerRouter from './routers/worker';
import bookingRouter from './routers/booking';
import trackingRouter from './routers/tracking';
import driverRouter from './routers/driver';
import s3Router from './routers/s3';
import orderRouter from './routers/order';
import cartRouter from './routers/cart';

app.use('/v1/user', userRouter);
app.use('/v1/worker', workerRouter);
app.use('/v1/booking', bookingRouter);
app.use('/v1/s3', s3Router);
app.use('/v1/order', orderRouter);
app.use('/c1/tracking', trackingRouter);
app.use('/c1/driver', driverRouter);
app.use('/v1/cart', cartRouter);

// Chat route
app.post('/chat', async (req: Request, res: Response) => {
  const chatSchema = z.object({
    prompt: z.string().min(1),
  });

  try {
    const { prompt } = chatSchema.parse(req.body);

    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt,
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Base route
app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Hello API' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack); // Log the error stack
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// Graceful shutdown
const shutdown = () => {
  server.close(() => {
    console.log('Shutting down server...');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
