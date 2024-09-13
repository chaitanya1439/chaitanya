import express, { Request, Response, NextFunction } from 'express';
import userRouter from './routers/user';
import workerRouter from './routers/worker';
import bookingRouter from './routers/booking';
import trackingRouter from './routers/tracking';
import driverRouter from './routers/driver';
import s3Router from './routers/s3';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from './config/passport';
import orderRouter from './routers/order';
import cartRouter from './routers/cart';
import cors from 'cors';
import helmet from 'helmet'; 
import morgan from 'morgan'; 
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Application constants
const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable is not set');
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

// Routes
app.use('/v1/user', userRouter);
app.use('/v1/worker', workerRouter);
app.use('/v1/booking', bookingRouter);
app.use('/v1/s3', s3Router);
app.use('/v1/order', orderRouter);
app.use('/c1/tracking', trackingRouter);
app.use('/c1/driver', driverRouter);
app.use('/v1/cart', cartRouter);

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
